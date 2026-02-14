/**
 * Resolves dot-notation paths against nested JSON objects.
 *
 * Used by the engine to extract values from a data payload
 * based on the `dataKey` in each field mapping entry.
 */
export class MappingResolver {
  /**
   * Resolve a dot-notation key against a data object.
   * Returns undefined if any segment along the path is missing.
   *
   * @param data - The data object to resolve against.
   * @param path - Dot-notation path (e.g. "applicant.firstName", "items.0.name").
   * @returns The resolved value, or undefined if the path cannot be resolved.
   *
   * @example
   *   resolve({ a: { b: 1 } }, "a.b")     // => 1
   *   resolve({ a: { b: 1 } }, "a.c")     // => undefined
   *   resolve({ a: { b: 1 } }, "a.b.c")   // => undefined
   *   resolve({ x: [1, 2] }, "x.0")       // => 1
   */
  static resolve(data: Record<string, unknown>, path: string): unknown {
    if (data == null || path === '') {
      return undefined;
    }

    const segments = path.split('.');
    let current: unknown = data;

    for (const segment of segments) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }
}
