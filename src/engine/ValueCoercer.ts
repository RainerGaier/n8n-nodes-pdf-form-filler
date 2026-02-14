import { CoercionOptions, CoercionResult, PdfFieldType } from '../types';

/** ISO 8601 date pattern: YYYY-MM-DD with optional time component. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(T.*)?$/;

/** Values treated as boolean true for checkbox coercion. */
const TRUTHY_VALUES = new Set(['true', 'yes', '1']);

/** Values treated as boolean false for checkbox coercion. */
const FALSY_VALUES = new Set(['false', 'no', '0']);

/**
 * Converts raw JavaScript values to the format expected by each PDF field type.
 *
 * Handles text pass-through, checkbox boolean coercion, radio/dropdown
 * option matching (case-insensitive), and ISO 8601 date formatting.
 */
export class ValueCoercer {
  /**
   * Coerce a raw value into the format needed for a specific field type.
   *
   * @param value - The raw value from the data payload.
   * @param targetType - The PDF field type to coerce for.
   * @param options - Coercion options (dateFormat, fieldOptions).
   * @returns A CoercionResult indicating success/failure and the coerced value.
   */
  static coerce(
    value: unknown,
    targetType: PdfFieldType,
    options: CoercionOptions = {},
  ): CoercionResult {
    if (value === null || value === undefined) {
      return { success: false, warning: 'Value is missing' };
    }

    switch (targetType) {
      case 'text':
        return ValueCoercer.coerceText(value, options);
      case 'checkbox':
        return ValueCoercer.coerceCheckbox(value);
      case 'radio':
      case 'dropdown':
      case 'optionList':
        return ValueCoercer.coerceOption(value, targetType, options);
      default:
        return {
          success: false,
          warning: `Unsupported field type '${targetType}'`,
        };
    }
  }

  /**
   * Coerce a value for a text field.
   *
   * @param value - The raw value.
   * @param options - Coercion options with optional dateFormat.
   * @returns The coerced string value.
   */
  private static coerceText(
    value: unknown,
    options: CoercionOptions,
  ): CoercionResult {
    const str = String(value);

    if (options.dateFormat && typeof value === 'string' && ISO_DATE_PATTERN.test(value)) {
      return ValueCoercer.formatDate(value, options.dateFormat);
    }

    return { success: true, value: str };
  }

  /**
   * Coerce a value for a checkbox field.
   *
   * @param value - The raw value.
   * @returns A boolean CoercionResult.
   */
  private static coerceCheckbox(value: unknown): CoercionResult {
    if (typeof value === 'boolean') {
      return { success: true, value };
    }

    if (typeof value === 'number') {
      if (value === 1) return { success: true, value: true };
      if (value === 0) return { success: true, value: false };
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (TRUTHY_VALUES.has(lower)) return { success: true, value: true };
      if (FALSY_VALUES.has(lower)) return { success: true, value: false };
    }

    return {
      success: false,
      warning: `Cannot coerce '${String(value)}' to checkbox state`,
    };
  }

  /**
   * Coerce a value for a radio, dropdown, or optionList field.
   * Performs case-insensitive matching and returns the original-case option from the PDF.
   *
   * @param value - The raw value.
   * @param targetType - The specific field type.
   * @param options - Must include fieldOptions.
   * @returns The matched option string.
   */
  private static coerceOption(
    value: unknown,
    targetType: PdfFieldType,
    options: CoercionOptions,
  ): CoercionResult {
    const str = String(value);
    const available = options.fieldOptions;

    if (!available || available.length === 0) {
      return {
        success: false,
        warning: `No options available for ${targetType} field`,
      };
    }

    const match = available.find(
      (opt) => opt.toLowerCase() === str.toLowerCase(),
    );

    if (match) {
      return { success: true, value: match };
    }

    return {
      success: false,
      warning: `Value '${str}' not in options: ${available.join(', ')}`,
    };
  }

  /**
   * Parse an ISO 8601 date string and format it using the given format pattern.
   *
   * Supported tokens: DD, D, MM, M, YYYY, YY.
   *
   * @param isoDate - The ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...).
   * @param format - The format pattern (e.g. "DD/MM/YYYY").
   * @returns The formatted date string.
   */
  private static formatDate(
    isoDate: string,
    format: string,
  ): CoercionResult {
    const datePart = isoDate.substring(0, 10);
    const parts = datePart.split('-');

    if (parts.length !== 3) {
      return {
        success: false,
        warning: `Invalid date format: '${isoDate}'`,
      };
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return {
        success: false,
        warning: `Invalid date components in: '${isoDate}'`,
      };
    }

    // Replace tokens — order matters: longer tokens first to avoid partial matches
    let result = format;
    result = result.replace('YYYY', String(year));
    result = result.replace('YY', String(year).slice(-2));
    result = result.replace('DD', String(day).padStart(2, '0'));
    result = result.replace('D', String(day));
    result = result.replace('MM', String(month).padStart(2, '0'));
    result = result.replace('M', String(month));

    return { success: true, value: result };
  }
}
