import React from 'react';
import { useSpecimenCount } from '@hooks/useSpecimenCount';

/**
 * Component that displays the current specimen count from the Solr API.
 * Shows a formatted count like "47k+" for numbers over 1000.
 */
const SpecimenCount: React.FC = () => {
  const { formattedCount, loading, error } = useSpecimenCount();

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    // Fallback to a reasonable default if API fails
    return <span>50k+</span>;
  }

  return <span>{formattedCount}</span>;
};

export default SpecimenCount;