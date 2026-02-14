import { PDFDocument } from 'pdf-lib';

import { PdfLibAdapter } from '../PdfLibAdapter';
import { PdfLoadError, NoFormError, FieldNotFoundError } from '../../errors/PdfFormFillerError';
import {
  createTextOnlyForm,
  createMixedFieldsForm,
  createNoFieldsForm,
  createReadOnlyFieldForm,
} from '../../../test/fixtures/createTestPdf';

describe('PdfLibAdapter', () => {
  describe('loadDocument', () => {
    it('should load a valid PDF', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();

      await expect(adapter.loadDocument(pdfBytes)).resolves.toBeUndefined();
    });

    it('should throw PdfLoadError for invalid bytes', async () => {
      const adapter = new PdfLibAdapter();
      const badBytes = new Uint8Array([1, 2, 3, 4, 5]);

      await expect(adapter.loadDocument(badBytes)).rejects.toThrow(PdfLoadError);
    });
  });

  describe('discoverFields', () => {
    it('should discover text fields', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();

      expect(fields).toHaveLength(2);
      expect(fields[0].name).toBe('name');
      expect(fields[0].type).toBe('text');
      expect(fields[1].name).toBe('email');
      expect(fields[1].type).toBe('text');
    });

    it('should discover mixed field types', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();
      const types = fields.map((f) => f.type);

      expect(types).toContain('text');
      expect(types).toContain('checkbox');
      expect(types).toContain('radio');
      expect(types).toContain('dropdown');
    });

    it('should report correct names for all fields', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();
      const names = fields.map((f) => f.name);

      expect(names).toContain('name');
      expect(names).toContain('email');
      expect(names).toContain('agree');
      expect(names).toContain('colour');
      expect(names).toContain('country');
    });

    it('should report dropdown options', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();
      const dropdown = fields.find((f) => f.name === 'country');

      expect(dropdown).toBeDefined();
      expect(dropdown!.options).toEqual(['UK', 'US', 'DE']);
    });

    it('should report radio options', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();
      const radio = fields.find((f) => f.name === 'colour');

      expect(radio).toBeDefined();
      expect(radio!.options).toEqual(['Red', 'Blue']);
    });

    it('should report readOnly flag', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createReadOnlyFieldForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();

      expect(fields).toHaveLength(1);
      expect(fields[0].readOnly).toBe(true);
      expect(fields[0].currentValue).toBe('Pre-filled');
    });

    it('should return empty array for a PDF with no form fields', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createNoFieldsForm();
      await adapter.loadDocument(pdfBytes);

      const fields = adapter.discoverFields();

      expect(fields).toEqual([]);
    });

    it('should throw NoFormError when no document is loaded', () => {
      const adapter = new PdfLibAdapter();

      expect(() => adapter.discoverFields()).toThrow(NoFormError);
    });
  });

  describe('getFieldType', () => {
    it('should return the type of an existing field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldType('name')).toBe('text');
      expect(adapter.getFieldType('agree')).toBe('checkbox');
      expect(adapter.getFieldType('colour')).toBe('radio');
      expect(adapter.getFieldType('country')).toBe('dropdown');
    });

    it('should return null for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldType('nonexistent')).toBeNull();
    });
  });

  describe('getFieldOptions', () => {
    it('should return options for a dropdown field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldOptions('country')).toEqual(['UK', 'US', 'DE']);
    });

    it('should return options for a radio field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldOptions('colour')).toEqual(['Red', 'Blue']);
    });

    it('should return null for a text field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldOptions('name')).toBeNull();
    });

    it('should return null for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      expect(adapter.getFieldOptions('nonexistent')).toBeNull();
    });
  });

  describe('setTextField', () => {
    it('should set a text field value', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setTextField('name', 'John Doe');

      const savedBytes = await adapter.saveDocument();
      const reloaded = new PdfLibAdapter();
      await reloaded.loadDocument(savedBytes);
      const fields = reloaded.discoverFields();
      const nameField = fields.find((f) => f.name === 'name');

      expect(nameField!.currentValue).toBe('John Doe');
    });

    it('should throw FieldNotFoundError for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      expect(() => adapter.setTextField('nonexistent', 'value')).toThrow(FieldNotFoundError);
    });
  });

  describe('setCheckbox', () => {
    it('should check a checkbox', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setCheckbox('agree', true);

      const savedBytes = await adapter.saveDocument();
      const reloaded = new PdfLibAdapter();
      await reloaded.loadDocument(savedBytes);
      const fields = reloaded.discoverFields();
      const checkbox = fields.find((f) => f.name === 'agree');

      expect(checkbox!.currentValue).toBe(true);
    });

    it('should uncheck a checkbox', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setCheckbox('agree', true);
      adapter.setCheckbox('agree', false);

      const savedBytes = await adapter.saveDocument();
      const reloaded = new PdfLibAdapter();
      await reloaded.loadDocument(savedBytes);
      const fields = reloaded.discoverFields();
      const checkbox = fields.find((f) => f.name === 'agree');

      expect(checkbox!.currentValue).toBe(false);
    });

    it('should throw FieldNotFoundError for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(() => adapter.setCheckbox('nonexistent', true)).toThrow(FieldNotFoundError);
    });
  });

  describe('setDropdown', () => {
    it('should select a dropdown option', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setDropdown('country', 'US');

      const savedBytes = await adapter.saveDocument();
      const reloaded = new PdfLibAdapter();
      await reloaded.loadDocument(savedBytes);
      const fields = reloaded.discoverFields();
      const dropdown = fields.find((f) => f.name === 'country');

      expect(dropdown!.currentValue).toBe('US');
    });

    it('should throw FieldNotFoundError for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(() => adapter.setDropdown('nonexistent', 'value')).toThrow(FieldNotFoundError);
    });
  });

  describe('setRadioGroup', () => {
    it('should select a radio option', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setRadioGroup('colour', 'Blue');

      const savedBytes = await adapter.saveDocument();
      const reloaded = new PdfLibAdapter();
      await reloaded.loadDocument(savedBytes);
      const fields = reloaded.discoverFields();
      const radio = fields.find((f) => f.name === 'colour');

      expect(radio!.currentValue).toBe('Blue');
    });

    it('should throw FieldNotFoundError for a non-existent field', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createMixedFieldsForm();
      await adapter.loadDocument(pdfBytes);

      expect(() => adapter.setRadioGroup('nonexistent', 'value')).toThrow(FieldNotFoundError);
    });
  });

  describe('saveDocument', () => {
    it('should save and return valid PDF bytes', async () => {
      const adapter = new PdfLibAdapter();
      const pdfBytes = await createTextOnlyForm();
      await adapter.loadDocument(pdfBytes);

      adapter.setTextField('name', 'Test');
      const savedBytes = await adapter.saveDocument();

      expect(savedBytes).toBeInstanceOf(Uint8Array);
      expect(savedBytes.length).toBeGreaterThan(0);

      // Verify it's a valid PDF by reloading
      const reloaded = await PDFDocument.load(savedBytes);
      expect(reloaded.getForm().getFields()).toHaveLength(2);
    });

    it('should throw PdfLoadError when no document is loaded', async () => {
      const adapter = new PdfLibAdapter();

      await expect(adapter.saveDocument()).rejects.toThrow(PdfLoadError);
    });
  });
});
