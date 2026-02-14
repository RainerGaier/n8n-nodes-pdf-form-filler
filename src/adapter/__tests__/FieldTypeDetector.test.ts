import { PDFDocument } from 'pdf-lib';

import { FieldTypeDetector } from '../FieldTypeDetector';

describe('FieldTypeDetector', () => {
  let form: ReturnType<PDFDocument['getForm']>;

  beforeAll(async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    form = pdfDoc.getForm();

    form.createTextField('textField').addToPage(page, { x: 0, y: 0 });
    form.createCheckBox('checkboxField').addToPage(page, { x: 0, y: 0 });

    const radio = form.createRadioGroup('radioField');
    radio.addOptionToPage('A', page, { x: 0, y: 0 });

    const dropdown = form.createDropdown('dropdownField');
    dropdown.addOptions(['X']);
    dropdown.addToPage(page, { x: 0, y: 0 });
  });

  it('should detect a text field', () => {
    const field = form.getField('textField');
    expect(FieldTypeDetector.detect(field)).toBe('text');
  });

  it('should detect a checkbox field', () => {
    const field = form.getField('checkboxField');
    expect(FieldTypeDetector.detect(field)).toBe('checkbox');
  });

  it('should detect a radio group field', () => {
    const field = form.getField('radioField');
    expect(FieldTypeDetector.detect(field)).toBe('radio');
  });

  it('should detect a dropdown field', () => {
    const field = form.getField('dropdownField');
    expect(FieldTypeDetector.detect(field)).toBe('dropdown');
  });
});
