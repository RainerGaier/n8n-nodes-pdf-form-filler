/** Base error class for all PDF Form Filler errors. */
export class PdfFormFillerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfFormFillerError';
  }
}

/** Thrown when PDF bytes are invalid, corrupted, or password-protected. */
export class PdfLoadError extends PdfFormFillerError {
  constructor(detail: string) {
    super(`Failed to load PDF: ${detail}`);
    this.name = 'PdfLoadError';
  }
}

/** Thrown when the PDF has no AcroForm data. */
export class NoFormError extends PdfFormFillerError {
  constructor() {
    super(
      'This PDF does not contain any form fields (AcroForm). XFA forms are not supported.',
    );
    this.name = 'NoFormError';
  }
}

/** Thrown when the mapping JSON is malformed or missing required fields. */
export class InvalidMappingError extends PdfFormFillerError {
  constructor(detail: string) {
    super(`Invalid field mapping: ${detail}`);
    this.name = 'InvalidMappingError';
  }
}

/** Thrown when a mapping references a pdfField that doesn't exist in the PDF. */
export class FieldNotFoundError extends PdfFormFillerError {
  constructor(fieldName: string) {
    super(`PDF field '${fieldName}' not found in the document`);
    this.name = 'FieldNotFoundError';
  }
}

/** Thrown when a value cannot be coerced to the target field type. */
export class CoercionError extends PdfFormFillerError {
  constructor(fieldName: string, detail: string) {
    super(`Cannot coerce value for field '${fieldName}': ${detail}`);
    this.name = 'CoercionError';
  }
}

/** Thrown when a radio/dropdown value doesn't match any available option. */
export class OptionMismatchError extends PdfFormFillerError {
  constructor(fieldName: string, value: string, availableOptions: string[]) {
    super(
      `Value '${value}' not in options for '${fieldName}'. Available: ${availableOptions.join(', ')}`,
    );
    this.name = 'OptionMismatchError';
  }
}
