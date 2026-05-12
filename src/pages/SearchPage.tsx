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
    selectedDateRanges,
    facetBuckets,
    rangeBuckets,
    anyActiveFilters,
    addFacetValue,
    removeFacetValue,
    clearFacet,
    setDateRange,
    clearDateRange,
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
            selectedDateRanges={selectedDateRanges}
            facetBuckets={facetBuckets}
            rangeBuckets={rangeBuckets}
            onAdd={addFacetValue}
            onRemove={removeFacetValue}
            onClearFacet={clearFacet}
            onDateRangeChange={setDateRange}
            onDateRangeClear={clearDateRange}
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
