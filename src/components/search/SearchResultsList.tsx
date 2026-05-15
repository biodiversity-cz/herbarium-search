import React from 'react';
import { HerbariumRecord } from '@types';
import ResultCard from './ResultCard';

interface SearchResultsListProps {
  results: HerbariumRecord[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  hasActiveFilters: boolean;
}

/**
 * Renders the list of search result cards, loading spinner, and empty/error states.
 */
const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  loading,
  error,
  totalResults,
  hasActiveFilters,
}) => {
  if (loading) {
    return (
      <div className="search-results__loading" role="status" aria-live="polite">
        <div className="spinner-border text-success" aria-hidden="true" />
        <span className="visually-hidden">Loading results…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="alert alert-info" role="status">
        No results found.{hasActiveFilters ? ' Try removing some filters.' : ' Try a different search term.'}
      </div>
    );
  }

  return (
    <>
      <div className="search-stats" aria-live="polite">
        <strong>{totalResults.toLocaleString()}</strong>{' '}
        {totalResults === 1 ? 'result' : 'results'} found
        {hasActiveFilters && <span className="ms-2 text-muted">(filtered)</span>}
      </div>

      <div className="search-results__list">
        {results.map((record) => (
          <ResultCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
};

export default SearchResultsList;
