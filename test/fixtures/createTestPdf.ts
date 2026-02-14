import { PDFDocument } from 'pdf-lib';

/**
 * Create a minimal PDF with only text fields.
 *
 * @returns PDF bytes containing two text fields: 'name' and 'email'.
 */
export async function createTextOnlyForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const form = pdfDoc.getForm();

  form.createTextField('name').addToPage(page, { x: 50, y: 700, width: 200, height: 20 });
  form.createTextField('email').addToPage(page, { x: 50, y: 650, width: 200, height: 20 });

  return pdfDoc.save();
}

/**
 * Create a PDF with all supported field types.
 *
 * @returns PDF bytes containing text, checkbox, radio, and dropdown fields.
 */
export async function createMixedFieldsForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const form = pdfDoc.getForm();

  form.createTextField('name').addToPage(page, { x: 50, y: 700, width: 200, height: 20 });
  form.createTextField('email').addToPage(page, { x: 50, y: 650, width: 200, height: 20 });

  const cb = form.createCheckBox('agree');
  cb.addToPage(page, { x: 50, y: 600, width: 15, height: 15 });

  const radio = form.createRadioGroup('colour');
  radio.addOptionToPage('Red', page, { x: 50, y: 550, width: 15, height: 15 });
  radio.addOptionToPage('Blue', page, { x: 50, y: 500, width: 15, height: 15 });

  const dropdown = form.createDropdown('country');
  dropdown.addOptions(['UK', 'US', 'DE']);
  dropdown.addToPage(page, { x: 50, y: 450, width: 200, height: 20 });

  return pdfDoc.save();
}

/**
 * Create a PDF with no form fields (just a blank page).
 *
 * @returns PDF bytes with no AcroForm data.
 */
export async function createNoFieldsForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage();
  return pdfDoc.save();
}

/**
 * Create a PDF with a read-only text field.
 *
 * @returns PDF bytes with one read-only text field.
 */
export async function createReadOnlyFieldForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const form = pdfDoc.getForm();

  const field = form.createTextField('readOnlyField');
  field.addToPage(page, { x: 50, y: 700, width: 200, height: 20 });
  field.setText('Pre-filled');
  field.enableReadOnly();

  return pdfDoc.save();
}

/**
 * Create a comprehensive multi-field PDF simulating a real-world application form.
 *
 * Contains 20+ fields across all supported types:
 * - 12 text fields (personal info, addresses, dates)
 * - 4 checkboxes (agreements, options)
 * - 2 radio groups (preferences)
 * - 3 dropdowns (selections)
 *
 * @returns PDF bytes with a realistic set of form fields.
 */
export async function createComprehensiveForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage();
  const page2 = pdfDoc.addPage();
  const form = pdfDoc.getForm();

  let y = 750;
  const spacing = 30;

  // Page 1: Personal info
  form.createTextField('firstName').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('lastName').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('email').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('phone').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('dateOfBirth').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('address.line1').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('address.line2').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('address.city').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('address.postcode').addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });

  // Dropdowns
  const countryDd = form.createDropdown('country');
  countryDd.addOptions(['United Kingdom', 'United States', 'Germany', 'France', 'Australia']);
  countryDd.addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });

  const titleDd = form.createDropdown('title');
  titleDd.addOptions(['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']);
  titleDd.addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });

  const phaseDd = form.createDropdown('supplyPhase');
  phaseDd.addOptions(['Single', 'Three']);
  phaseDd.addToPage(page1, { x: 50, y: y -= spacing, width: 200, height: 20 });

  // Page 2: Preferences and agreements
  y = 750;

  // Radio groups
  const contactPref = form.createRadioGroup('contactPreference');
  contactPref.addOptionToPage('Email', page2, { x: 50, y: y -= spacing, width: 15, height: 15 });
  contactPref.addOptionToPage('Phone', page2, { x: 120, y, width: 15, height: 15 });
  contactPref.addOptionToPage('Post', page2, { x: 190, y, width: 15, height: 15 });

  const connectionType = form.createRadioGroup('connectionType');
  connectionType.addOptionToPage('New', page2, { x: 50, y: y -= spacing, width: 15, height: 15 });
  connectionType.addOptionToPage('Existing', page2, { x: 120, y, width: 15, height: 15 });

  // Checkboxes
  form.createCheckBox('agreeTerms').addToPage(page2, { x: 50, y: y -= spacing, width: 15, height: 15 });
  form.createCheckBox('agreePrivacy').addToPage(page2, { x: 50, y: y -= spacing, width: 15, height: 15 });
  form.createCheckBox('isNewConnection').addToPage(page2, { x: 50, y: y -= spacing, width: 15, height: 15 });
  form.createCheckBox('requiresPlanning').addToPage(page2, { x: 50, y: y -= spacing, width: 15, height: 15 });

  // More text fields
  form.createTextField('applicationDate').addToPage(page2, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('referenceNumber').addToPage(page2, { x: 50, y: y -= spacing, width: 200, height: 20 });
  form.createTextField('notes').addToPage(page2, { x: 50, y: y -= spacing, width: 200, height: 40 });

  return pdfDoc.save();
}

/**
 * Create a PDF with pre-filled field values.
 *
 * @returns PDF bytes with fields that already have values set.
 */
export async function createPreFilledForm(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const form = pdfDoc.getForm();

  const name = form.createTextField('name');
  name.addToPage(page, { x: 50, y: 700, width: 200, height: 20 });
  name.setText('Existing Name');

  const email = form.createTextField('email');
  email.addToPage(page, { x: 50, y: 650, width: 200, height: 20 });
  email.setText('existing@example.com');

  const agree = form.createCheckBox('agree');
  agree.addToPage(page, { x: 50, y: 600, width: 15, height: 15 });
  agree.check();

  const country = form.createDropdown('country');
  country.addOptions(['UK', 'US', 'DE']);
  country.addToPage(page, { x: 50, y: 550, width: 200, height: 20 });
  country.select('UK');

  return pdfDoc.save();
}
