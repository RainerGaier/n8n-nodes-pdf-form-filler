import { FieldInfo, PdfFieldType } from './FieldInfo';

/** Interface for PDF adapter implementations. */
export interface IPdfAdapter {
  /** Load a PDF document from bytes. */
  loadDocument(pdfBytes: Uint8Array): Promise<void>;

  /** Discover all form fields. */
  discoverFields(): FieldInfo[];

  /** Get the type of a specific field. */
  getFieldType(fieldName: string): PdfFieldType | null;

  /** Get the available options for a radio/dropdown field. */
  getFieldOptions(fieldName: string): string[] | null;

  /** Set a text field value. */
  setTextField(fieldName: string, value: string): void;

  /** Check or uncheck a checkbox. */
  setCheckbox(fieldName: string, checked: boolean): void;

  /** Select a radio group option. */
  setRadioGroup(fieldName: string, optionValue: string): void;

  /** Select a dropdown option. */
  setDropdown(fieldName: string, optionValue: string): void;

  /** Save the document and return bytes. */
  saveDocument(): Promise<Uint8Array>;
}
