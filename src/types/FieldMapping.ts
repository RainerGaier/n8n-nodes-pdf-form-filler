/** A single entry in the field mapping configuration. */
export interface FieldMappingEntry {
  /** Dot-notation path into the data payload. */
  dataKey: string;
  /** Exact PDF form field name. */
  pdfField: string;
  /** Optional date format override (e.g. "DD/MM/YYYY"). */
  dateFormat?: string;
}
