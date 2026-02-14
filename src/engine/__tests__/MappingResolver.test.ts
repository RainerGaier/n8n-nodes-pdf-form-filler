import { MappingResolver } from '../MappingResolver';

describe('MappingResolver', () => {
  describe('simple paths', () => {
    it('should resolve a top-level key', () => {
      const data = { firstName: 'John' };
      expect(MappingResolver.resolve(data, 'firstName')).toBe('John');
    });

    it('should resolve a numeric value', () => {
      const data = { age: 42 };
      expect(MappingResolver.resolve(data, 'age')).toBe(42);
    });

    it('should resolve a boolean value', () => {
      const data = { isActive: true };
      expect(MappingResolver.resolve(data, 'isActive')).toBe(true);
    });

    it('should resolve a false boolean value', () => {
      const data = { isActive: false };
      expect(MappingResolver.resolve(data, 'isActive')).toBe(false);
    });

    it('should resolve a null value', () => {
      const data = { value: null };
      expect(MappingResolver.resolve(data, 'value')).toBeNull();
    });

    it('should resolve an empty string value', () => {
      const data = { name: '' };
      expect(MappingResolver.resolve(data, 'name')).toBe('');
    });

    it('should resolve zero as a value', () => {
      const data = { count: 0 };
      expect(MappingResolver.resolve(data, 'count')).toBe(0);
    });
  });

  describe('nested paths', () => {
    it('should resolve a two-level nested path', () => {
      const data = { applicant: { firstName: 'John' } };
      expect(MappingResolver.resolve(data, 'applicant.firstName')).toBe('John');
    });

    it('should resolve a three-level nested path', () => {
      const data = { a: { b: { c: 'deep' } } };
      expect(MappingResolver.resolve(data, 'a.b.c')).toBe('deep');
    });

    it('should resolve a deeply nested object', () => {
      const data = { level1: { level2: { level3: { level4: 'found' } } } };
      expect(MappingResolver.resolve(data, 'level1.level2.level3.level4')).toBe(
        'found',
      );
    });
  });

  describe('array indices', () => {
    it('should resolve an array index', () => {
      const data = { items: ['a', 'b', 'c'] };
      expect(MappingResolver.resolve(data, 'items.0')).toBe('a');
    });

    it('should resolve a second array index', () => {
      const data = { items: ['a', 'b', 'c'] };
      expect(MappingResolver.resolve(data, 'items.2')).toBe('c');
    });

    it('should resolve a nested property within an array element', () => {
      const data = { items: [{ name: 'first' }, { name: 'second' }] };
      expect(MappingResolver.resolve(data, 'items.0.name')).toBe('first');
      expect(MappingResolver.resolve(data, 'items.1.name')).toBe('second');
    });

    it('should return undefined for an out-of-bounds array index', () => {
      const data = { items: ['a', 'b'] };
      expect(MappingResolver.resolve(data, 'items.5')).toBeUndefined();
    });
  });

  describe('missing paths', () => {
    it('should return undefined for a missing top-level key', () => {
      const data = { firstName: 'John' };
      expect(MappingResolver.resolve(data, 'lastName')).toBeUndefined();
    });

    it('should return undefined for a missing nested key', () => {
      const data = { a: { b: 1 } };
      expect(MappingResolver.resolve(data, 'a.c')).toBeUndefined();
    });

    it('should return undefined when traversing through a non-object', () => {
      const data = { a: { b: 1 } };
      expect(MappingResolver.resolve(data, 'a.b.c')).toBeUndefined();
    });

    it('should return undefined when traversing through a string', () => {
      const data = { a: 'hello' };
      expect(MappingResolver.resolve(data, 'a.b')).toBeUndefined();
    });

    it('should return undefined when traversing through null', () => {
      const data = { a: null };
      expect(MappingResolver.resolve(data, 'a.b')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should return undefined for an empty path', () => {
      const data = { a: 1 };
      expect(MappingResolver.resolve(data, '')).toBeUndefined();
    });

    it('should return undefined for null data', () => {
      expect(
        MappingResolver.resolve(null as unknown as Record<string, unknown>, 'a'),
      ).toBeUndefined();
    });

    it('should return undefined for undefined data', () => {
      expect(
        MappingResolver.resolve(
          undefined as unknown as Record<string, unknown>,
          'a',
        ),
      ).toBeUndefined();
    });

    it('should handle keys with special characters', () => {
      const data = { 'A1-First name': 'John' };
      expect(MappingResolver.resolve(data, 'A1-First name')).toBe('John');
    });

    it('should resolve an object value (not just primitives)', () => {
      const data = { applicant: { name: 'John', age: 30 } };
      const result = MappingResolver.resolve(data, 'applicant');
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should resolve an array value', () => {
      const data = { tags: ['a', 'b', 'c'] };
      const result = MappingResolver.resolve(data, 'tags');
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle an empty data object', () => {
      expect(MappingResolver.resolve({}, 'a')).toBeUndefined();
    });
  });
});
