/**
 * Manual test script — generates filled PDFs for visual inspection.
 *
 * Usage:
 *   npx ts-node test/manual/generateFilledPdf.ts
 *
 * Output:
 *   test/manual/output/mixed-fields-filled.pdf
 *   test/manual/output/comprehensive-filled.pdf
 *
 * Open the output files in Adobe Reader, Chrome, or Preview to verify:
 *   - Text fields display correct values
 *   - Checkboxes show checked/unchecked state
 *   - Radio buttons show correct selection
 *   - Dropdowns show correct selection
 *   - Date fields are formatted correctly
 */

import * as fs from 'fs';
import * as path from 'path';
import { PdfFormFillerEngine } from '../../src/engine/PdfFormFillerEngine';
import { PdfLibAdapter } from '../../src/adapter/PdfLibAdapter';
import { createMixedFieldsForm, createComprehensiveForm } from '../fixtures/createTestPdf';

const OUTPUT_DIR = path.join(__dirname, 'output');

async function generateMixedFieldsPdf(): Promise<void> {
  const pdfBytes = await createMixedFieldsForm();
  const adapter = new PdfLibAdapter();
  const engine = new PdfFormFillerEngine(adapter);

  const result = await engine.fillForm(
    pdfBytes,
    [
      { dataKey: 'name', pdfField: 'name' },
      { dataKey: 'email', pdfField: 'email' },
      { dataKey: 'agree', pdfField: 'agree' },
      { dataKey: 'colour', pdfField: 'colour' },
      { dataKey: 'country', pdfField: 'country' },
    ],
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      agree: true,
      colour: 'Blue',
      country: 'UK',
    },
  );

  const outPath = path.join(OUTPUT_DIR, 'mixed-fields-filled.pdf');
  fs.writeFileSync(outPath, result.pdfBytes);
  console.log(`[OK] ${outPath}`);
  console.log(`     Status: ${result.status}, Filled: ${result.fieldsFilled}`);
}

async function generateComprehensivePdf(): Promise<void> {
  const pdfBytes = await createComprehensiveForm();
  const adapter = new PdfLibAdapter();
  const engine = new PdfFormFillerEngine(adapter, { defaultDateFormat: 'DD/MM/YYYY' });

  const result = await engine.fillForm(
    pdfBytes,
    [
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
    ],
    {
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
      newConn: true,
      planning: false,
      appDate: '2026-02-14',
      refNum: 'REF-2026-001',
      notes: 'Manual test — verify all field types render correctly in your PDF viewer.',
    },
  );

  const outPath = path.join(OUTPUT_DIR, 'comprehensive-filled.pdf');
  fs.writeFileSync(outPath, result.pdfBytes);
  console.log(`[OK] ${outPath}`);
  console.log(`     Status: ${result.status}, Filled: ${result.fieldsFilled}, Warnings: ${result.warnings.length}`);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Generating filled PDFs for manual inspection...\n');

  await generateMixedFieldsPdf();
  await generateComprehensivePdf();

  console.log('\nDone. Open the files above in Adobe Reader, Chrome, or Preview.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
