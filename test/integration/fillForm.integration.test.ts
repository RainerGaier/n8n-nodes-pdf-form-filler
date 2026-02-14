import { PdfFormFillerEngine } from '../../src/engine/PdfFormFillerEngine';
import { PdfLibAdapter } from '../../src/adapter/PdfLibAdapter';
import { NoFormError } from '../../src/errors/PdfFormFillerError';
import { FieldMappingEntry } from '../../src/types';
import {
  createTextOnlyForm,
  createMixedFieldsForm,
  createNoFieldsForm,
  createReadOnlyFieldForm,
  createComprehensiveForm,
  createPreFilledForm,
} from '../fixtures/createTestPdf';

/**
 * Helper: creates a fresh adapter + engine pair for each test.
 */
function createEngine(options?: { warnOnMissingValues?: boolean; defaultDateFormat?: string }) {
  const adapter = new PdfLibAdapter();
  const engine = new PdfFormFillerEngine(adapter, options);
  return { adapter, engine };
}

/**
 * Helper: reload a filled PDF and discover fields to verify values.
 */
async function reloadAndDiscover(pdfBytes: Uint8Array) {
  const { engine } = createEngine();
  return engine.discoverFields(pdfBytes);
}

describe('Integration: fillForm round-trip', () => {
  describe('text-only form', () => {
    it('should fill text fields and verify values after reload', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'email', pdfField: 'email' },
      ];
      const data = { name: 'John Doe', email: 'john@example.com' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(2);
      expect(result.fieldsMissing).toBe(0);
      expect(result.fieldsErrored).toBe(0);
      expect(result.pdfBytes).toBeInstanceOf(Uint8Array);
      expect(result.pdfBytes.length).toBeGreaterThan(0);

      // Reload and verify
      const fields = await reloadAndDiscover(result.pdfBytes);
      const nameField = fields.find((f) => f.name === 'name');
      const emailField = fields.find((f) => f.name === 'email');

      expect(nameField?.currentValue).toBe('John Doe');
      expect(emailField?.currentValue).toBe('john@example.com');
    });

    it('should fill text fields with numeric values', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
      ];
      const data = { name: 42 };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(1);

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('42');
    });
  });

  describe('mixed-fields form', () => {
    it('should fill all field types and verify values after reload', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'email', pdfField: 'email' },
        { dataKey: 'agree', pdfField: 'agree' },
        { dataKey: 'colour', pdfField: 'colour' },
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = {
        name: 'Jane Smith',
        email: 'jane@test.com',
        agree: true,
        colour: 'Blue',
        country: 'UK',
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(5);
      expect(result.warnings).toHaveLength(0);

      // Reload and verify each field type
      const fields = await reloadAndDiscover(result.pdfBytes);

      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('Jane Smith');
      expect(fields.find((f) => f.name === 'email')?.currentValue).toBe('jane@test.com');
      expect(fields.find((f) => f.name === 'agree')?.currentValue).toBe(true);
      expect(fields.find((f) => f.name === 'colour')?.currentValue).toBe('Blue');
      expect(fields.find((f) => f.name === 'country')?.currentValue).toBe('UK');
    });

    it('should handle case-insensitive dropdown matching', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = { country: 'uk' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(1);

      const fields = await reloadAndDiscover(result.pdfBytes);
      // Should use original case from PDF
      expect(fields.find((f) => f.name === 'country')?.currentValue).toBe('UK');
    });

    it('should handle case-insensitive radio matching', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'colour', pdfField: 'colour' },
      ];
      const data = { colour: 'red' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'colour')?.currentValue).toBe('Red');
    });

    it('should uncheck a checkbox when value is false', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'agree', pdfField: 'agree' },
      ];
      const data = { agree: false };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'agree')?.currentValue).toBe(false);
    });

    it('should check a checkbox with string "yes"', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'agree', pdfField: 'agree' },
      ];
      const data = { agree: 'yes' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'agree')?.currentValue).toBe(true);
    });
  });

  describe('date formatting', () => {
    it('should format ISO date with default DD/MM/YYYY format', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'name' },
      ];
      const data = { date: '2025-06-15' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('15/06/2025');
    });

    it('should format ISO date with per-field dateFormat override', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'name', dateFormat: 'MM/DD/YYYY' },
      ];
      const data = { date: '2025-06-15' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('06/15/2025');
    });

    it('should format ISO date with custom global defaultDateFormat', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine({ defaultDateFormat: 'YYYY-MM-DD' });

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'name' },
      ];
      const data = { date: '2025-06-15' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');

      const fields = await reloadAndDiscover(result.pdfBytes);
      // YYYY-MM-DD format should pass through unchanged
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('2025-06-15');
    });

    it('should format ISO date with D/M/YY tokens', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'date', pdfField: 'name', dateFormat: 'D/M/YY' },
      ];
      const data = { date: '2025-01-05' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('5/1/25');
    });
  });

  describe('dot-notation data resolution', () => {
    it('should resolve nested object paths', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'applicant.name', pdfField: 'name' },
        { dataKey: 'applicant.contact.email', pdfField: 'email' },
      ];
      const data = {
        applicant: {
          name: 'Nested Name',
          contact: { email: 'nested@test.com' },
        },
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(2);

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('Nested Name');
      expect(fields.find((f) => f.name === 'email')?.currentValue).toBe('nested@test.com');
    });

    it('should resolve array index paths', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'contacts.0.name', pdfField: 'name' },
        { dataKey: 'contacts.1.name', pdfField: 'email' },
      ];
      const data = {
        contacts: [
          { name: 'First Contact' },
          { name: 'Second Contact' },
        ],
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(2);

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('First Contact');
      expect(fields.find((f) => f.name === 'email')?.currentValue).toBe('Second Contact');
    });
  });

  describe('partial data and missing values', () => {
    it('should report missing values with status partial', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'missingKey', pdfField: 'email' },
      ];
      const data = { name: 'Partial Data' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsMissing).toBe(1);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('missingKey');

      // Verify the filled field was still written
      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('Partial Data');
    });

    it('should suppress warnings when warnOnMissingValues is false', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine({ warnOnMissingValues: false });

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'missingKey', pdfField: 'email' },
      ];
      const data = { name: 'No Warnings' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsMissing).toBe(1);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle non-existent PDF field with error', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'value', pdfField: 'nonExistentField' },
      ];
      const data = { name: 'Valid', value: 'ignored' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('partial');
      expect(result.fieldsFilled).toBe(1);
      expect(result.fieldsErrored).toBe(1);
      expect(result.warnings[0]).toContain('nonExistentField');
    });

    it('should handle invalid dropdown option with skip', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = { country: 'InvalidCountry' };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('partial');
      expect(result.fieldsSkipped).toBe(1);
      expect(result.warnings[0]).toContain('InvalidCountry');
    });

    it('should handle empty mapping array', async () => {
      const pdfBytes = await createTextOnlyForm();
      const { engine } = createEngine();

      const result = await engine.fillForm(pdfBytes, [], { name: 'ignored' });

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(0);
      expect(result.fieldsMissing).toBe(0);
      expect(result.fieldsErrored).toBe(0);
      expect(result.pdfBytes).toBeInstanceOf(Uint8Array);
    });
  });

  describe('edge cases', () => {
    it('should return error status when filling a PDF with no form fields', async () => {
      const pdfBytes = await createNoFieldsForm();
      const { engine } = createEngine();

      // pdf-lib lazily creates an empty form, so fillForm won't throw NoFormError.
      // Instead, the mapped field won't be found and will be reported as an error.
      const result = await engine.fillForm(
        pdfBytes,
        [{ dataKey: 'x', pdfField: 'y' }],
        { x: 'val' },
      );

      expect(result.status).toBe('error');
      expect(result.fieldsErrored).toBe(1);
      expect(result.fieldsFilled).toBe(0);
    });

    it('should return empty array when discovering fields on a formless PDF', async () => {
      const pdfBytes = await createNoFieldsForm();
      const { engine } = createEngine();

      // pdf-lib lazily creates an empty form, so discoverFields returns [].
      const fields = await engine.discoverFields(pdfBytes);
      expect(fields).toHaveLength(0);
    });

    it('should overwrite pre-filled values', async () => {
      const pdfBytes = await createPreFilledForm();
      const { engine } = createEngine();

      // Verify pre-filled values exist
      const beforeFields = await reloadAndDiscover(pdfBytes);
      expect(beforeFields.find((f) => f.name === 'name')?.currentValue).toBe('Existing Name');
      expect(beforeFields.find((f) => f.name === 'agree')?.currentValue).toBe(true);

      // Overwrite with new values
      const mapping: FieldMappingEntry[] = [
        { dataKey: 'name', pdfField: 'name' },
        { dataKey: 'email', pdfField: 'email' },
        { dataKey: 'agree', pdfField: 'agree' },
        { dataKey: 'country', pdfField: 'country' },
      ];
      const data = {
        name: 'New Name',
        email: 'new@example.com',
        agree: false,
        country: 'DE',
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(4);

      const afterFields = await reloadAndDiscover(result.pdfBytes);
      expect(afterFields.find((f) => f.name === 'name')?.currentValue).toBe('New Name');
      expect(afterFields.find((f) => f.name === 'email')?.currentValue).toBe('new@example.com');
      expect(afterFields.find((f) => f.name === 'agree')?.currentValue).toBe(false);
      expect(afterFields.find((f) => f.name === 'country')?.currentValue).toBe('DE');
    });

    it('should handle read-only field gracefully', async () => {
      const pdfBytes = await createReadOnlyFieldForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'value', pdfField: 'readOnlyField' },
      ];
      const data = { value: 'Attempted overwrite' };

      // pdf-lib silently allows setting read-only fields — it's the PDF viewer
      // that enforces read-only at render time. The engine reports success.
      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.fieldsFilled).toBe(1);

      // The value is written to the PDF bytes even though the field is read-only
      const fields = await reloadAndDiscover(result.pdfBytes);
      const field = fields.find((f) => f.name === 'readOnlyField');
      expect(field?.readOnly).toBe(true);
      expect(field?.currentValue).toBe('Attempted overwrite');
    });
  });

  describe('comprehensive form (multi-field)', () => {
    it('should fill 20+ fields across all types and verify round-trip', async () => {
      const pdfBytes = await createComprehensiveForm();
      const { engine } = createEngine();

      const mapping: FieldMappingEntry[] = [
        { dataKey: 'firstName', pdfField: 'firstName' },
        { dataKey: 'lastName', pdfField: 'lastName' },
        { dataKey: 'email', pdfField: 'email' },
        { dataKey: 'phone', pdfField: 'phone' },
        { dataKey: 'dob', pdfField: 'dateOfBirth', dateFormat: 'DD/MM/YYYY' },
        { dataKey: 'addr.line1', pdfField: 'address.line1' },
        { dataKey: 'addr.line2', pdfField: 'address.line2' },
        { dataKey: 'addr.city', pdfField: 'address.city' },
        { dataKey: 'addr.postcode', pdfField: 'address.postcode' },
        { dataKey: 'country', pdfField: 'country' },
        { dataKey: 'title', pdfField: 'title' },
        { dataKey: 'phase', pdfField: 'supplyPhase' },
        { dataKey: 'contactPref', pdfField: 'contactPreference' },
        { dataKey: 'connType', pdfField: 'connectionType' },
        { dataKey: 'terms', pdfField: 'agreeTerms' },
        { dataKey: 'privacy', pdfField: 'agreePrivacy' },
        { dataKey: 'newConn', pdfField: 'isNewConnection' },
        { dataKey: 'planning', pdfField: 'requiresPlanning' },
        { dataKey: 'appDate', pdfField: 'applicationDate', dateFormat: 'DD/MM/YYYY' },
        { dataKey: 'refNum', pdfField: 'referenceNumber' },
        { dataKey: 'notes', pdfField: 'notes' },
      ];

      const data = {
        firstName: 'Rainer',
        lastName: 'Gaier',
        email: 'rainer@example.com',
        phone: '+44 7700 900000',
        dob: '1985-03-22',
        addr: {
          line1: '123 Test Street',
          line2: 'Suite 4B',
          city: 'London',
          postcode: 'SW1A 1AA',
        },
        country: 'United Kingdom',
        title: 'Dr',
        phase: 'Three',
        contactPref: 'Email',
        connType: 'New',
        terms: true,
        privacy: true,
        newConn: 'yes',
        planning: false,
        appDate: '2026-02-14',
        refNum: 'REF-2026-001',
        notes: 'Integration test — all field types covered.',
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.status).toBe('success');
      expect(result.fieldsFilled).toBe(21);
      expect(result.fieldsMissing).toBe(0);
      expect(result.fieldsSkipped).toBe(0);
      expect(result.fieldsErrored).toBe(0);
      expect(result.warnings).toHaveLength(0);

      // Reload and verify round-trip for all fields
      const fields = await reloadAndDiscover(result.pdfBytes);
      const field = (name: string) => fields.find((f) => f.name === name);

      // Text fields
      expect(field('firstName')?.currentValue).toBe('Rainer');
      expect(field('lastName')?.currentValue).toBe('Gaier');
      expect(field('email')?.currentValue).toBe('rainer@example.com');
      expect(field('phone')?.currentValue).toBe('+44 7700 900000');
      expect(field('dateOfBirth')?.currentValue).toBe('22/03/1985');
      expect(field('address.line1')?.currentValue).toBe('123 Test Street');
      expect(field('address.line2')?.currentValue).toBe('Suite 4B');
      expect(field('address.city')?.currentValue).toBe('London');
      expect(field('address.postcode')?.currentValue).toBe('SW1A 1AA');
      expect(field('referenceNumber')?.currentValue).toBe('REF-2026-001');
      expect(field('notes')?.currentValue).toBe('Integration test — all field types covered.');
      expect(field('applicationDate')?.currentValue).toBe('14/02/2026');

      // Dropdowns
      expect(field('country')?.currentValue).toBe('United Kingdom');
      expect(field('title')?.currentValue).toBe('Dr');
      expect(field('supplyPhase')?.currentValue).toBe('Three');

      // Radio groups
      expect(field('contactPreference')?.currentValue).toBe('Email');
      expect(field('connectionType')?.currentValue).toBe('New');

      // Checkboxes
      expect(field('agreeTerms')?.currentValue).toBe(true);
      expect(field('agreePrivacy')?.currentValue).toBe(true);
      expect(field('isNewConnection')?.currentValue).toBe(true);
      expect(field('requiresPlanning')?.currentValue).toBe(false);
    });

    it('should handle partial fill of comprehensive form', async () => {
      const pdfBytes = await createComprehensiveForm();
      const { engine } = createEngine();

      // Only fill a subset of fields
      const mapping: FieldMappingEntry[] = [
        { dataKey: 'firstName', pdfField: 'firstName' },
        { dataKey: 'lastName', pdfField: 'lastName' },
        { dataKey: 'terms', pdfField: 'agreeTerms' },
        { dataKey: 'missing1', pdfField: 'email' },
        { dataKey: 'missing2', pdfField: 'phone' },
      ];
      const data = {
        firstName: 'Partial',
        lastName: 'Fill',
        terms: true,
      };

      const result = await engine.fillForm(pdfBytes, mapping, data);

      expect(result.fieldsFilled).toBe(3);
      expect(result.fieldsMissing).toBe(2);
      expect(result.warnings).toHaveLength(2);

      const fields = await reloadAndDiscover(result.pdfBytes);
      expect(fields.find((f) => f.name === 'firstName')?.currentValue).toBe('Partial');
      expect(fields.find((f) => f.name === 'lastName')?.currentValue).toBe('Fill');
      expect(fields.find((f) => f.name === 'agreeTerms')?.currentValue).toBe(true);
    });
  });

  describe('discover fields', () => {
    it('should discover all fields in a mixed-fields form', async () => {
      const pdfBytes = await createMixedFieldsForm();
      const { engine } = createEngine();

      const fields = await engine.discoverFields(pdfBytes);

      expect(fields).toHaveLength(5);

      const nameField = fields.find((f) => f.name === 'name');
      expect(nameField?.type).toBe('text');
      expect(nameField?.readOnly).toBe(false);

      const agreeField = fields.find((f) => f.name === 'agree');
      expect(agreeField?.type).toBe('checkbox');

      const colourField = fields.find((f) => f.name === 'colour');
      expect(colourField?.type).toBe('radio');
      expect(colourField?.options).toEqual(['Red', 'Blue']);

      const countryField = fields.find((f) => f.name === 'country');
      expect(countryField?.type).toBe('dropdown');
      expect(countryField?.options).toEqual(['UK', 'US', 'DE']);
    });

    it('should discover all 21 fields in the comprehensive form', async () => {
      const pdfBytes = await createComprehensiveForm();
      const { engine } = createEngine();

      const fields = await engine.discoverFields(pdfBytes);

      expect(fields.length).toBe(21);

      // Verify field type counts
      const textFields = fields.filter((f) => f.type === 'text');
      const checkboxFields = fields.filter((f) => f.type === 'checkbox');
      const radioFields = fields.filter((f) => f.type === 'radio');
      const dropdownFields = fields.filter((f) => f.type === 'dropdown');

      expect(textFields.length).toBe(12);
      expect(checkboxFields.length).toBe(4);
      expect(radioFields.length).toBe(2);
      expect(dropdownFields.length).toBe(3);
    });

    it('should report read-only fields correctly', async () => {
      const pdfBytes = await createReadOnlyFieldForm();
      const { engine } = createEngine();

      const fields = await engine.discoverFields(pdfBytes);

      expect(fields).toHaveLength(1);
      expect(fields[0].name).toBe('readOnlyField');
      expect(fields[0].readOnly).toBe(true);
      expect(fields[0].currentValue).toBe('Pre-filled');
    });

    it('should report pre-filled values correctly', async () => {
      const pdfBytes = await createPreFilledForm();
      const { engine } = createEngine();

      const fields = await engine.discoverFields(pdfBytes);

      expect(fields.find((f) => f.name === 'name')?.currentValue).toBe('Existing Name');
      expect(fields.find((f) => f.name === 'email')?.currentValue).toBe('existing@example.com');
      expect(fields.find((f) => f.name === 'agree')?.currentValue).toBe(true);
      expect(fields.find((f) => f.name === 'country')?.currentValue).toBe('UK');
    });
  });
});
