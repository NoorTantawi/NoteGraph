/**
 * React hook that debounces a rapidly-changing value.
 *
 * Returns a value that only updates after the specified delay has
 * elapsed since the last change. Useful for deferring expensive
 * operations like search filtering or preview rendering.
 *
 * @example
 * const debouncedQuery = useDebounce(searchQuery, 300);
 * useEffect(() => { performSearch(debouncedQuery); }, [debouncedQuery]);
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
