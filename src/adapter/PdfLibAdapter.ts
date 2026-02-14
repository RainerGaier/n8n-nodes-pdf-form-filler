import {
  PDFDocument,
  PDFForm,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
} from 'pdf-lib';

import { FieldInfo, IPdfAdapter, PdfFieldType } from '../types';
import { PdfLoadError, NoFormError, FieldNotFoundError } from '../errors/PdfFormFillerError';
import { FieldTypeDetector } from './FieldTypeDetector';

/**
 * Wraps the pdf-lib library behind the IPdfAdapter interface.
 *
 * Handles PDF loading, field discovery, value setting, and saving.
 * All pdf-lib specifics are isolated in this class — the rest of the
 * codebase interacts only through IPdfAdapter.
 */
export class PdfLibAdapter implements IPdfAdapter {
  private pdfDoc: PDFDocument | null = null;
  private form: PDFForm | null = null;

  /**
   * Load a PDF document from bytes.
   *
   * @param pdfBytes - The raw PDF file bytes.
   * @throws PdfLoadError if the bytes are invalid or the PDF cannot be loaded.
   */
  async loadDocument(pdfBytes: Uint8Array): Promise<void> {
    try {
      this.pdfDoc = await PDFDocument.load(pdfBytes, {
        ignoreEncryption: true,
        updateMetadata: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new PdfLoadError(message);
    }

    try {
      this.form = this.pdfDoc.getForm();
    } catch {
      throw new NoFormError();
    }
  }

  /**
   * Discover all form fields in the loaded PDF.
   *
   * @returns An array of FieldInfo objects describing each field.
   * @throws NoFormError if no document has been loaded or the PDF has no form.
   */
  discoverFields(): FieldInfo[] {
    const form = this.getForm();
    const fields = form.getFields();

    return fields.map((field) => {
      const type = FieldTypeDetector.detect(field);
      const name = field.getName();

      return {
        name,
        type,
        required: false,
        currentValue: this.getCurrentValue(field, type),
        options: this.getFieldOptionsFromField(field, type),
        readOnly: field.isReadOnly(),
      };
    });
  }

  /**
   * Get the type of a specific field by name.
   *
   * @param fieldName - The PDF field name.
   * @returns The field type, or null if the field does not exist.
   */
  getFieldType(fieldName: string): PdfFieldType | null {
    const form = this.getForm();
    try {
      const field = form.getField(fieldName);
      return FieldTypeDetector.detect(field);
    } catch {
      return null;
    }
  }

  /**
   * Get the available options for a radio/dropdown field.
   *
   * @param fieldName - The PDF field name.
   * @returns An array of option strings, or null if not applicable.
   */
  getFieldOptions(fieldName: string): string[] | null {
    const form = this.getForm();
    try {
      const field = form.getField(fieldName);
      const type = FieldTypeDetector.detect(field);
      return this.getFieldOptionsFromField(field, type);
    } catch {
      return null;
    }
  }

  /**
   * Set a text field value.
   *
   * @param fieldName - The PDF field name.
   * @param value - The text value to set.
   * @throws FieldNotFoundError if the field does not exist.
   */
  setTextField(fieldName: string, value: string): void {
    const form = this.getForm();
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
    } catch (error) {
      if (error instanceof FieldNotFoundError) throw error;
      throw new FieldNotFoundError(fieldName);
    }
  }

  /**
   * Check or uncheck a checkbox.
   *
   * @param fieldName - The PDF field name.
   * @param checked - Whether to check or uncheck.
   * @throws FieldNotFoundError if the field does not exist.
   */
  setCheckbox(fieldName: string, checked: boolean): void {
    const form = this.getForm();
    try {
      const field = form.getCheckBox(fieldName);
      if (checked) {
        field.check();
      } else {
        field.uncheck();
      }
    } catch (error) {
      if (error instanceof FieldNotFoundError) throw error;
      throw new FieldNotFoundError(fieldName);
    }
  }

  /**
   * Select a radio group option.
   *
   * @param fieldName - The PDF field name.
   * @param optionValue - The option value to select.
   * @throws FieldNotFoundError if the field does not exist.
   */
  setRadioGroup(fieldName: string, optionValue: string): void {
    const form = this.getForm();
    try {
      const field = form.getRadioGroup(fieldName);
      field.select(optionValue);
    } catch (error) {
      if (error instanceof FieldNotFoundError) throw error;
      throw new FieldNotFoundError(fieldName);
    }
  }

  /**
   * Select a dropdown option.
   *
   * @param fieldName - The PDF field name.
   * @param optionValue - The option value to select.
   * @throws FieldNotFoundError if the field does not exist.
   */
  setDropdown(fieldName: string, optionValue: string): void {
    const form = this.getForm();
    try {
      const field = form.getDropdown(fieldName);
      field.select(optionValue);
    } catch (error) {
      if (error instanceof FieldNotFoundError) throw error;
      throw new FieldNotFoundError(fieldName);
    }
  }

  /**
   * Save the document and return the PDF bytes.
   *
   * @returns The filled PDF as a Uint8Array.
   */
  async saveDocument(): Promise<Uint8Array> {
    if (!this.pdfDoc) {
      throw new PdfLoadError('No document loaded');
    }
    // Regenerate field appearance streams so filled values are visible
    // in viewers. Essential for PDFs with pre-existing appearances
    // (e.g. forms created in Adobe Acrobat).
    const form = this.form;
    if (form) {
      try {
        form.updateFieldAppearances();
      } catch {
        // Non-fatal: some fonts or fields may not support appearance updates.
        // The values are still stored in the field data.
      }
    }
    return this.pdfDoc.save();
  }

  /**
   * Get the currently loaded form, throwing if none is loaded.
   */
  private getForm(): PDFForm {
    if (!this.form) {
      throw new NoFormError();
    }
    return this.form;
  }

  /**
   * Extract the current value of a field based on its type.
   */
  private getCurrentValue(
    field: import('pdf-lib').PDFField,
    type: PdfFieldType,
  ): string | boolean | null {
    try {
      switch (type) {
        case 'text':
          return (field as PDFTextField).getText() ?? null;
        case 'checkbox':
          return (field as PDFCheckBox).isChecked();
        case 'radio':
          return (field as PDFRadioGroup).getSelected() ?? null;
        case 'dropdown':
          return (field as PDFDropdown).getSelected()[0] ?? null;
        case 'optionList':
          return (field as PDFOptionList).getSelected()[0] ?? null;
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Extract available options from a field if it is a radio, dropdown, or optionList.
   */
  private getFieldOptionsFromField(
    field: import('pdf-lib').PDFField,
    type: PdfFieldType,
  ): string[] | null {
    try {
      switch (type) {
        case 'radio':
          return (field as PDFRadioGroup).getOptions();
        case 'dropdown':
          return (field as PDFDropdown).getOptions();
        case 'optionList':
          return (field as PDFOptionList).getOptions();
        default:
          return null;
      }
    } catch {
      return null;
    }
  }
}
