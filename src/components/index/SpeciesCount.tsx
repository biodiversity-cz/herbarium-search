import React from 'react';
import { useSpeciesCount } from '@hooks/useSpeciesCount';

/**
 * Component that displays the current unique species count from the Solr API.
 * Shows a formatted count like "3k+" for numbers over 1000.
 */
const SpeciesCount: React.FC = () => {
  const { formattedCount, loading, error } = useSpeciesCount();

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    // Fallback to a reasonable default if API fails
    return <span>9k+</span>;
  }

  return <span>{formattedCount}</span>;
};

export default SpeciesCount;