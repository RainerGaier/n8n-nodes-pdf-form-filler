import { ValueCoercer } from '../ValueCoercer';
import { CoercionOptions } from '../../types';

describe('ValueCoercer', () => {
  describe('text fields', () => {
    it('should pass through a string value', () => {
      const result = ValueCoercer.coerce('hello', 'text', {});
      expect(result).toEqual({ success: true, value: 'hello' });
    });

    it('should stringify a number value', () => {
      const result = ValueCoercer.coerce(42, 'text', {});
      expect(result).toEqual({ success: true, value: '42' });
    });

    it('should stringify zero', () => {
      const result = ValueCoercer.coerce(0, 'text', {});
      expect(result).toEqual({ success: true, value: '0' });
    });

    it('should stringify a boolean true', () => {
      const result = ValueCoercer.coerce(true, 'text', {});
      expect(result).toEqual({ success: true, value: 'true' });
    });

    it('should stringify a boolean false', () => {
      const result = ValueCoercer.coerce(false, 'text', {});
      expect(result).toEqual({ success: true, value: 'false' });
    });

    it('should pass through an empty string', () => {
      const result = ValueCoercer.coerce('', 'text', {});
      expect(result).toEqual({ success: true, value: '' });
    });

    it('should pass through an ISO date without dateFormat as plain string', () => {
      const result = ValueCoercer.coerce('2025-06-15', 'text', {});
      expect(result).toEqual({ success: true, value: '2025-06-15' });
    });
  });

  describe('text fields — date formatting', () => {
    it('should format an ISO date with DD/MM/YYYY', () => {
      const result = ValueCoercer.coerce('2025-06-15', 'text', {
        dateFormat: 'DD/MM/YYYY',
      });
      expect(result).toEqual({ success: true, value: '15/06/2025' });
    });

    it('should format an ISO date with MM/DD/YYYY', () => {
      const result = ValueCoercer.coerce('2025-06-15', 'text', {
        dateFormat: 'MM/DD/YYYY',
      });
      expect(result).toEqual({ success: true, value: '06/15/2025' });
    });

    it('should format an ISO date with YYYY-MM-DD (passthrough format)', () => {
      const result = ValueCoercer.coerce('2025-06-15', 'text', {
        dateFormat: 'YYYY-MM-DD',
      });
      expect(result).toEqual({ success: true, value: '2025-06-15' });
    });

    it('should format with two-digit year (YY)', () => {
      const result = ValueCoercer.coerce('2025-06-15', 'text', {
        dateFormat: 'DD/MM/YY',
      });
      expect(result).toEqual({ success: true, value: '15/06/25' });
    });

    it('should format with non-padded day and month (D, M)', () => {
      const result = ValueCoercer.coerce('2025-06-05', 'text', {
        dateFormat: 'D/M/YYYY',
      });
      expect(result).toEqual({ success: true, value: '5/6/2025' });
    });

    it('should format a date with time component (ISO datetime)', () => {
      const result = ValueCoercer.coerce('2025-06-15T14:30:00Z', 'text', {
        dateFormat: 'DD/MM/YYYY',
      });
      expect(result).toEqual({ success: true, value: '15/06/2025' });
    });

    it('should zero-pad day and month in DD/MM format', () => {
      const result = ValueCoercer.coerce('2025-01-03', 'text', {
        dateFormat: 'DD/MM/YYYY',
      });
      expect(result).toEqual({ success: true, value: '03/01/2025' });
    });

    it('should not format a non-ISO string even with dateFormat set', () => {
      const result = ValueCoercer.coerce('not-a-date', 'text', {
        dateFormat: 'DD/MM/YYYY',
      });
      expect(result).toEqual({ success: true, value: 'not-a-date' });
    });

    it('should not format a number even with dateFormat set', () => {
      const result = ValueCoercer.coerce(20250615, 'text', {
        dateFormat: 'DD/MM/YYYY',
      });
      expect(result).toEqual({ success: true, value: '20250615' });
    });

    it('should format with dot separator', () => {
      const result = ValueCoercer.coerce('2025-12-25', 'text', {
        dateFormat: 'DD.MM.YYYY',
      });
      expect(result).toEqual({ success: true, value: '25.12.2025' });
    });

    it('should format with dash separator', () => {
      const result = ValueCoercer.coerce('2025-12-25', 'text', {
        dateFormat: 'DD-MM-YYYY',
      });
      expect(result).toEqual({ success: true, value: '25-12-2025' });
    });
  });

  describe('checkbox fields', () => {
    it('should coerce boolean true to checked', () => {
      const result = ValueCoercer.coerce(true, 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce boolean false to unchecked', () => {
      const result = ValueCoercer.coerce(false, 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });

    it('should coerce string "true" to checked', () => {
      const result = ValueCoercer.coerce('true', 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce string "false" to unchecked', () => {
      const result = ValueCoercer.coerce('false', 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });

    it('should coerce string "yes" to checked (case-insensitive)', () => {
      const result = ValueCoercer.coerce('YES', 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce string "no" to unchecked (case-insensitive)', () => {
      const result = ValueCoercer.coerce('No', 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });

    it('should coerce string "1" to checked', () => {
      const result = ValueCoercer.coerce('1', 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce string "0" to unchecked', () => {
      const result = ValueCoercer.coerce('0', 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });

    it('should coerce number 1 to checked', () => {
      const result = ValueCoercer.coerce(1, 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce number 0 to unchecked', () => {
      const result = ValueCoercer.coerce(0, 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });

    it('should warn on non-boolean value for checkbox', () => {
      const result = ValueCoercer.coerce('banana', 'checkbox', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('Cannot coerce');
    });

    it('should warn on number 2 for checkbox', () => {
      const result = ValueCoercer.coerce(2, 'checkbox', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('Cannot coerce');
    });

    it('should coerce string "True" to checked (case-insensitive)', () => {
      const result = ValueCoercer.coerce('True', 'checkbox', {});
      expect(result).toEqual({ success: true, value: true });
    });

    it('should coerce string "FALSE" to unchecked (case-insensitive)', () => {
      const result = ValueCoercer.coerce('FALSE', 'checkbox', {});
      expect(result).toEqual({ success: true, value: false });
    });
  });

  describe('dropdown fields', () => {
    const options: CoercionOptions = {
      fieldOptions: ['Single', 'Three', 'Other'],
    };

    it('should match an exact option', () => {
      const result = ValueCoercer.coerce('Single', 'dropdown', options);
      expect(result).toEqual({ success: true, value: 'Single' });
    });

    it('should match case-insensitively and return original case', () => {
      const result = ValueCoercer.coerce('single', 'dropdown', options);
      expect(result).toEqual({ success: true, value: 'Single' });
    });

    it('should match uppercase input and return original case', () => {
      const result = ValueCoercer.coerce('THREE', 'dropdown', options);
      expect(result).toEqual({ success: true, value: 'Three' });
    });

    it('should warn when value does not match any option', () => {
      const result = ValueCoercer.coerce('Four', 'dropdown', options);
      expect(result.success).toBe(false);
      expect(result.warning).toContain("Value 'Four' not in options");
    });

    it('should warn when no options are available', () => {
      const result = ValueCoercer.coerce('Single', 'dropdown', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('No options available');
    });

    it('should warn when options array is empty', () => {
      const result = ValueCoercer.coerce('Single', 'dropdown', {
        fieldOptions: [],
      });
      expect(result.success).toBe(false);
      expect(result.warning).toContain('No options available');
    });

    it('should stringify a number before matching', () => {
      const opts: CoercionOptions = { fieldOptions: ['1', '2', '3'] };
      const result = ValueCoercer.coerce(2, 'dropdown', opts);
      expect(result).toEqual({ success: true, value: '2' });
    });
  });

  describe('radio fields', () => {
    const options: CoercionOptions = {
      fieldOptions: ['Red', 'Blue', 'Green'],
    };

    it('should match an exact radio option', () => {
      const result = ValueCoercer.coerce('Red', 'radio', options);
      expect(result).toEqual({ success: true, value: 'Red' });
    });

    it('should match case-insensitively and return original case', () => {
      const result = ValueCoercer.coerce('blue', 'radio', options);
      expect(result).toEqual({ success: true, value: 'Blue' });
    });

    it('should warn when value does not match any radio option', () => {
      const result = ValueCoercer.coerce('Yellow', 'radio', options);
      expect(result.success).toBe(false);
      expect(result.warning).toContain("Value 'Yellow' not in options");
    });
  });

  describe('optionList fields', () => {
    const options: CoercionOptions = {
      fieldOptions: ['Alpha', 'Beta', 'Gamma'],
    };

    it('should match an optionList value case-insensitively', () => {
      const result = ValueCoercer.coerce('beta', 'optionList', options);
      expect(result).toEqual({ success: true, value: 'Beta' });
    });

    it('should warn on no match', () => {
      const result = ValueCoercer.coerce('Delta', 'optionList', options);
      expect(result.success).toBe(false);
      expect(result.warning).toContain("Value 'Delta' not in options");
    });
  });

  describe('null and undefined', () => {
    it('should return missing for null value', () => {
      const result = ValueCoercer.coerce(null, 'text', {});
      expect(result.success).toBe(false);
      expect(result.warning).toBe('Value is missing');
    });

    it('should return missing for undefined value', () => {
      const result = ValueCoercer.coerce(undefined, 'text', {});
      expect(result.success).toBe(false);
      expect(result.warning).toBe('Value is missing');
    });

    it('should return missing for null on checkbox', () => {
      const result = ValueCoercer.coerce(null, 'checkbox', {});
      expect(result.success).toBe(false);
      expect(result.warning).toBe('Value is missing');
    });

    it('should return missing for undefined on dropdown', () => {
      const result = ValueCoercer.coerce(undefined, 'dropdown', {
        fieldOptions: ['A'],
      });
      expect(result.success).toBe(false);
      expect(result.warning).toBe('Value is missing');
    });
  });

  describe('unsupported field types', () => {
    it('should warn for signature field type', () => {
      const result = ValueCoercer.coerce('value', 'signature', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('Unsupported field type');
    });

    it('should warn for button field type', () => {
      const result = ValueCoercer.coerce('value', 'button', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('Unsupported field type');
    });

    it('should warn for unknown field type', () => {
      const result = ValueCoercer.coerce('value', 'unknown', {});
      expect(result.success).toBe(false);
      expect(result.warning).toContain('Unsupported field type');
    });
  });
});
