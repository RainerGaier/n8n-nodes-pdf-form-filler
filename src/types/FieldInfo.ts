/** Metadata about a discovered PDF form field. */
export interface FieldInfo {
  /** The field's full name in the PDF. */
  name: string;
  /** Detected field type. */
  type: PdfFieldType;
  /** Whether the field is marked as required in the PDF. */
  required: boolean;
  /** Current value (if any). */
  currentValue: string | boolean | null;
  /** Available options (for radio groups and dropdowns). */
  options: string[] | null;
  /** Read-only flag. */
  readOnly: boolean;
}

export type PdfFieldType =
  | 'text'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'optionList'
  | 'signature'
  | 'button'
  | 'unknown';
