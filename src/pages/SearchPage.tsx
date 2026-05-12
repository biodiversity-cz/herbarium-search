import React from 'react';
import { useSearchState } from '@hooks/useSearchState';
import SearchPageHeader from '@components/search/SearchPageHeader';
import FacetSidebar from '@components/search/facets/FacetSidebar';
import SearchResultsList from '@components/search/SearchResultsList';
import SearchPagination from '@components/search/SearchPagination';

/**
 * Search / results page.
 *
 * Layout:
 *  ┌─────────────────────────────────────────────┐
 *  │  SearchPageHeader (green banner)            │
 *  ├──────────────┬──────────────────────────────┤
 *  │ FacetSidebar │ SearchResultsList            │
 *  │              │ SearchPagination             │
 *  └──────────────┴──────────────────────────────┘
 *
 * All state is managed by useSearchState hook.
 * All facet configuration lives in src/types/facets.ts.
 */
const SearchPage: React.FC = () => {
  const {
    results,
    totalResults,
    loading,
    error,
    currentPage,
    totalPages,
    query,
    selectedFacets,
    facetBuckets,
    anyActiveFilters,
    addFacetValue,
    removeFacetValue,
    clearFacet,
    clearAllFacets,
    setPage,
  } = useSearchState();

  return (
    <div className="search-page">
      <SearchPageHeader
        query={query === '*:*' ? '' : query}
        totalResults={totalResults}
        loading={loading}
      />

      <div className="container">
        <div className="search-layout">
          <FacetSidebar
            selectedFacets={selectedFacets}
            facetBuckets={facetBuckets}
            onAdd={addFacetValue}
            onRemove={removeFacetValue}
            onClearFacet={clearFacet}
            onClearAll={clearAllFacets}
          />

          <section className="search-results" aria-label="Search results" aria-live="polite">
            <SearchResultsList
              results={results}
              loading={loading}
              error={error}
              totalResults={totalResults}
              hasActiveFilters={anyActiveFilters}
            />

            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
