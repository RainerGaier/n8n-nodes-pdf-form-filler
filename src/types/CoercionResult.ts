export interface CoercionResult {
  success: boolean;
  value?: string | boolean;
  warning?: string;
}

export interface CoercionOptions {
  dateFormat?: string;
  /** Available options for radio/dropdown fields. */
  fieldOptions?: string[];
}
