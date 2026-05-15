import { useState, useEffect } from 'react';
import { getHerbariaCount } from '@services/api';

interface UseHerbariaCountReturn {
  count: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch the count of contributing herbaria using Solr JSON Facet API.
 * Returns the number of unique herbarium acronyms that have at least one specimen.
 */
export const useHerbariaCount = (): UseHerbariaCountReturn => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        setLoading(true);
        setError(null);
        const herbariaCount = await getHerbariaCount();
        if (!cancelled) {
          setCount(herbariaCount);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch herbaria count:', err);
          setError('Failed to load count');
          // Fall back to a reasonable default if API fails
          setCount(3);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    count,
    loading,
    error,
  };
};