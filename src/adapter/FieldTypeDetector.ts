import {
  PDFField,
  PDFTextField,
  PDFCheckBox,
  PDFRadioGroup,
  PDFDropdown,
  PDFOptionList,
  PDFSignature,
  PDFButton,
} from 'pdf-lib';

import { PdfFieldType } from '../types';

/**
 * Determines the field type of a pdf-lib PDFField instance
 * using instanceof checks against the known pdf-lib field classes.
 */
export class FieldTypeDetector {
  /**
   * Detect the type of a pdf-lib field.
   *
   * @param field - A PDFField instance from pdf-lib.
   * @returns The corresponding PdfFieldType string.
   */
  static detect(field: PDFField): PdfFieldType {
    if (field instanceof PDFTextField) return 'text';
    if (field instanceof PDFCheckBox) return 'checkbox';
    if (field instanceof PDFRadioGroup) return 'radio';
    if (field instanceof PDFDropdown) return 'dropdown';
    if (field instanceof PDFOptionList) return 'optionList';
    if (field instanceof PDFSignature) return 'signature';
    if (field instanceof PDFButton) return 'button';
    return 'unknown';
  }
}
