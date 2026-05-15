import { useState, useEffect, useMemo } from 'react';
import { getTotalCount } from '@services/api';

interface UseSpecimenCountReturn {
  count: number;
  formattedCount: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and format the total specimen count.
 * Formats large numbers in a "Xk+" format (e.g., "47k+").
 */
export const useSpecimenCount = (): UseSpecimenCountReturn => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalCount = await getTotalCount();
        if (!cancelled) {
          setCount(totalCount);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch specimen count:', err);
          setError('Failed to load count');
          // Fall back to a reasonable default if API fails
          setCount(50000);
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