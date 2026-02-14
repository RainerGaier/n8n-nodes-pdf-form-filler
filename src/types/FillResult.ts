/** Result of a single field fill attempt. */
export interface FieldFillResult {
  pdfField: string;
  dataKey: string;
  status: 'filled' | 'missing' | 'skipped' | 'error';
  message?: string;
}

/** Overall result of a fill operation. */
export interface FillFormResult {
  pdfBytes: Uint8Array;
  status: 'success' | 'partial' | 'error';
  fieldsFilled: number;
  fieldsMissing: number;
  fieldsSkipped: number;
  fieldsErrored: number;
  warnings: string[];
  details: FieldFillResult[];
}
