import { PdfFormFillerEngine } from '../PdfFormFillerEngine';
import { IPdfAdapter, FieldInfo, PdfFieldType, FieldMappingEntry } from '../../types';
import { InvalidMappingError, NoFormError } from '../../errors/PdfFormFillerError';

/**
 * Create a mock IPdfAdapter with jest.fn() methods.
 * Default behaviour: two text fields ('firstName', 'lastName') and a checkbox ('agree').
 */
function createMockAdapter(fields?: FieldInfo[]): jest.Mocked<IPdfAdapter> {
  const defaultFields: FieldInfo[] = fields ?? [
    { name: 'firstName', type: 'text', required: false, currentValue: null, options: null, readOnly: false },
    { name: 'lastName', type: 'text', required: false, currentValue: null, options: null, readOnly: false },
    { name: 'agree', type: 'checkbox', required: false, currentValue: false, options: null, readOnly: false },
    { name: 'country', type: 'dropdown', required: false, currentValue: null, options: ['UK', 'US', 'DE'], readOnly: false },
    { name: 'colour', type: 'radio', required: false, currentValue: null, options: ['Red', 'Blue'], readOnly: false },
  ];

  const fieldMap = new Map(defaultFields.map((f) => [f.name, f]));

  return {
    loadDocument: jest.fn().mockResolvedValue(undefined),
    discoverFields: jest.fn().mockReturnValue(defaultFields),
    getFieldType: jest.fn((name: string): PdfFieldType | null => {
      return fieldMap.get(name)?.type ?? null;
    }),
    getFieldOptions: jest.fn((name: string): string[] | null => {
      return fieldMap.get(name)?.options ?? null;
    }),
    setTextField: jest.fn(),
    setCheckbox: jest.fn(),
    setRadioGroup: jest.fn(),
    setDropdown: jest.fn(),
    saveDocument: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };
}

const DUMMY_PDF = new Uint8Array([0]);

describe('PdfFormFillerEngine', () => {
  describe('discoverFields', () => {
    it('should discover fields from a valid PDF', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const fields = await engine.discoverFields(DUMMY_PDF);

      expect(adapter.loadDocument).toHaveBeenCalledWith(DUMMY_PDF);
      expect(adapter.discoverFields).toHaveBeenCalled();
      expect(fields).toHaveLength(5);
      expect(fields[0].name).toBe('firstName');
    });

    it('should propagate NoFormError from adapter', async () => {
      const adapter = createMockAdapter();
      adapter.loadDocument.mockRejectedValue(new NoFormError());
      const engine = new PdfFormFillerEngine(adapter);

      await expect(engine.discoverFields(DUMMY_PDF)).rejects.toThrow(NoFormError);
    });
  });

  describe('fillForm — happy path', () => {
    it('should fill all fields when mapping and data are complete', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'first', pdfField: 'firstName' },
        { dataKey: 'last', pdfField: 'lastName' },
        { dataKey: 'accepted', pdfField: 'agree' },
      ];
      const data = { first: 'John', last: 'Doe', accepted: true };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(3);
      expect(result.fieldsMissing).toBe(0);
      expect(result.fieldsSkipped).toBe(0);
      expect(result.fieldsErrored).toBe(0);
      expect(result.warnings).toEqual([]);
      expect(result.pdfBytes).toEqual(new Uint8Array([1, 2, 3]));

      expect(adapter.setTextField).toHaveBeenCalledWith('firstName', 'John');
      expect(adapter.setTextField).toHaveBeenCalledWith('lastName', 'Doe');
      expect(adapter.setCheckbox).toHaveBeenCalledWith('agree', true);
    });

    it('should fill a dropdown field with case-insensitive matching', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = { country: 'uk' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(adapter.setDropdown).toHaveBeenCalledWith('country', 'UK');
    });

    it('should fill a radio field', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'colour', pdfField: 'colour' },
      ];
      const data = { colour: 'Blue' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(adapter.setRadioGroup).toHaveBeenCalledWith('colour', 'Blue');
    });
  });

  describe('fillForm — partial data', () => {
    it('should report missing fields when data values are absent', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'first', pdfField: 'firstName' },
        { dataKey: 'last', pdfField: 'lastName' },
        { dataKey: 'middleName', pdfField: 'firstName' },
      ];
      const data = { first: 'John' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsMissing).toBe(2);
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0]).toContain('last');
      expect(result.warnings[1]).toContain('middleName');
    });

    it('should suppress missing value warnings when warnOnMissingValues is false', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter, { warnOnMissingValues: false });

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'first', pdfField: 'firstName' },
        { dataKey: 'missing', pdfField: 'lastName' },
      ];
      const data = { first: 'John' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsMissing).toBe(1);
      expect(result.warnings).toEqual([]);
    });

    it('should handle nested dot-notation data keys', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'applicant.first', pdfField: 'firstName' },
        { dataKey: 'applicant.last', pdfField: 'lastName' },
      ];
      const data = { applicant: { first: 'Jane', last: 'Smith' } };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(2);
      expect(adapter.setTextField).toHaveBeenCalledWith('firstName', 'Jane');
      expect(adapter.setTextField).toHaveBeenCalledWith('lastName', 'Smith');
    });
  });

  describe('fillForm — error handling', () => {
    it('should record error when pdfField does not exist in the PDF', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'first', pdfField: 'firstName' },
        { dataKey: 'phone', pdfField: 'nonExistentField' },
      ];
      const data = { first: 'John', phone: '12345' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsErrored).toBe(1);
      expect(result.status).toBe('partial');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('nonExistentField');
    });

    it('should skip field and warn when coercion fails', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'agree', pdfField: 'agree' },
      ];
      const data = { agree: 'banana' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsSkipped).toBe(1);
      expect(result.fieldsFilled).toBe(0);
      expect(result.status).toBe('partial');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('Cannot coerce');
    });

    it('should skip field when dropdown value has no match', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = { country: 'France' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsSkipped).toBe(1);
      expect(result.warnings[0]).toContain("Value 'France' not in options");
    });

    it('should record error when adapter setter throws', async () => {
      const adapter = createMockAdapter();
      adapter.setTextField.mockImplementation(() => {
        throw new Error('pdf-lib internal error');
      });
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'first', pdfField: 'firstName' },
      ];
      const data = { first: 'John' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsErrored).toBe(1);
      expect(result.status).toBe('error');
      expect(result.warnings[0]).toContain('pdf-lib internal error');
    });

    it('should return status "error" when all fields error and none filled', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'x', pdfField: 'doesNotExist1' },
        { dataKey: 'y', pdfField: 'doesNotExist2' },
      ];
      const data = { x: 'a', y: 'b' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.status).toBe('error');
      expect(result.fieldsErrored).toBe(2);
      expect(result.fieldsFilled).toBe(0);
    });
  });

  describe('fillForm — empty mapping', () => {
    it('should return success with zero fields filled for empty mapping', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const result = await engine.fillForm(DUMMY_PDF, [], {});

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(0);
      expect(result.fieldsMissing).toBe(0);
      expect(result.fieldsSkipped).toBe(0);
      expect(result.fieldsErrored).toBe(0);
      expect(result.warnings).toEqual([]);
      expect(result.details).toEqual([]);
    });
  });

  describe('fillForm — mapping validation', () => {
    it('should throw InvalidMappingError when mapping is not an array', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      await expect(
        engine.fillForm(DUMMY_PDF, 'not an array' as unknown as FieldMappingEntry[], {}),
      ).rejects.toThrow(InvalidMappingError);
    });

    it('should throw InvalidMappingError when entry has no dataKey', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping = [{ pdfField: 'firstName' }] as unknown as FieldMappingEntry[];

      await expect(engine.fillForm(DUMMY_PDF, mapping, {})).rejects.toThrow(
        InvalidMappingError,
      );
    });

    it('should throw InvalidMappingError when entry has no pdfField', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping = [{ dataKey: 'first' }] as unknown as FieldMappingEntry[];

      await expect(engine.fillForm(DUMMY_PDF, mapping, {})).rejects.toThrow(
        InvalidMappingError,
      );
    });

    it('should throw InvalidMappingError when dataKey is empty string', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [{ dataKey: '', pdfField: 'firstName' }];

      await expect(engine.fillForm(DUMMY_PDF, mapping, {})).rejects.toThrow(
        InvalidMappingError,
      );
    });
  });

  describe('fillForm — date formatting', () => {
    it('should use per-field dateFormat when specified', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter);

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'firstName', dateFormat: 'MM/DD/YYYY' },
      ];
      const data = { date: '2025-06-15' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(adapter.setTextField).toHaveBeenCalledWith('firstName', '06/15/2025');
    });

    it('should use global defaultDateFormat when no per-field format', async () => {
      const adapter = createMockAdapter();
      const engine = new PdfFormFillerEngine(adapter, {
        defaultDateFormat: 'YYYY-MM-DD',
      });

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'firstName' },
      ];
      const data = { date: '2025-06-15' };

      const result = await engine.fillForm(DUMMY_PDF, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(adapter.setTextField).toHaveBeenCalledWith('firstName', '2025-06-15');
    });
  });
});
