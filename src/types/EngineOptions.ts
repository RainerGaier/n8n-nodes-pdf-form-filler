export interface EngineOptions {
  /** Emit warnings for mapped fields with no data value. Default: true. */
  warnOnMissingValues?: boolean;
  /** Global default date format. Default: "DD/MM/YYYY". */
  defaultDateFormat?: string;
}
