import { useState, useEffect, useMemo } from 'react';
import { getSpeciesCount } from '@services/api';

interface UseSpeciesCountReturn {
  count: number;
  formattedCount: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and format the unique species count.
 * Formats large numbers in a "Xk+" format (e.g., "3k+").
 */
export const useSpeciesCount = (): UseSpeciesCountReturn => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        setLoading(true);
        setError(null);
        const speciesCount = await getSpeciesCount();
        if (!cancelled) {
          setCount(speciesCount);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch species count:', err);
          setError('Failed to load count');
          // Fall back to a reasonable default if API fails
          setCount(9000);
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

  // Format the count: round down to thousands and add "k+"
  const formattedCount = useMemo(() => {
    if (count < 1000) return count.toString();
    const thousands = Math.floor(count / 1000);
    return `${thousands}k+`;
  }, [count]);

  return {
    count,
    formattedCount,
    loading,
    error,
  };
};