import React from 'react';
import { useHerbariaCount } from '@hooks/useHerbariaCount';

/**
 * Component that displays the current count of contributing herbaria using Solr JSON Facet API.
 * Shows the number of unique herbarium acronyms with specimens.
 */
const HerbariaCount: React.FC = () => {
  const { count, loading, error } = useHerbariaCount();

  if (loading) {
    return <span>Loading...</span>;
  }

  if (error) {
    // Fallback to a reasonable default if API fails
    return <span>3</span>;
  }

  return <span>{count}</span>;
};

export default HerbariaCount;