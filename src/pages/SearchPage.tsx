import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecords } from '@services/api';
import { HerbariumRecord, SolrResponse } from '@types/index';
import ResultCard from '@components/search/CustomReactiveList';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<HerbariumRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedGenus, setSelectedGenus] = useState<string>('');
  const [facets, setFacets] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  useEffect(() => {
    performSearch();
  }, [query, selectedFamily, selectedCountry, selectedGenus, currentPage]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: string[] = [];
      if (selectedFamily) filters.push(`family:"${selectedFamily}"`);
      if (selectedCountry) filters.push(`country:"${selectedCountry}"`);
      if (selectedGenus) filters.push(`genus:"${selectedGenus}"`);

      const start = (currentPage - 1) * resultsPerPage;
      const response: SolrResponse = await searchRecords(
        query || '*:*',
        filters,
        start,
        resultsPerPage,
        true
      );

      setResults(response.response.docs);
      setTotalResults(response.response.numFound);
      setFacets(response.facet_counts?.facet_fields);
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  const clearFilters = () => {
    setSelectedFamily('');
    setSelectedCountry('');
    setSelectedGenus('');
    setCurrentPage(1);
  };

  const parseFacetArray = (facetArray: Array<string | number>): Array<{value: string, count: number}> => {
    const result: Array<{value: string, count: number}> = [];
    for (let i = 0; i < facetArray.length; i += 2) {
      result.push({
        value: facetArray[i] as string,
        count: facetArray[i + 1] as number
      });
    }
    return result;
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container">
          <h1>Advanced Search</h1>
          <p className="mb-0">Explore our herbarium collection</p>
        </div>
      </div>

      <div className="container">
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search specimens..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="search-container">
          <div className="facets-sidebar">
            <div className="card">
              <div className="card-body">
                <h4 className="h6 mb-3">Filter Results</h4>
                
                <button
                  className="btn btn-sm btn-outline-secondary w-100 mb-3"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>

                {/* Family Facet */}
                <div className="facet-group">
                  <h5>Family</h5>
                  <select
                    className="form-select form-select-sm"
                    value={selectedFamily}
                    onChange={(e) => {
                      setSelectedFamily(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Families</option>
                    {facets?.family && parseFacetArray(facets.family).map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Genus Facet */}
                <div className="facet-group">
                  <h5>Genus</h5>
                  <select
                    className="form-select form-select-sm"
                    value={selectedGenus}
                    onChange={(e) => {
                      setSelectedGenus(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Genera</option>
                    {facets?.genus && parseFacetArray(facets.genus).map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country Facet */}
                <div className="facet-group">
                  <h5>Country</h5>
                  <select
                    className="form-select form-select-sm"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">All Countries</option>
                    {facets?.country && parseFacetArray(facets.country).map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.value} ({item.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="search-results">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="search-stats">
                  <strong>
                    {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  </strong>
                  {(selectedFamily || selectedCountry || selectedGenus) && (
                    <span className="ms-2 text-muted">(filtered)</span>
                  )}
                </div>

                {results.length > 0 ? (
                  <>
                    {results.map((record) => (
                      <ResultCard key={record.id} record={record} />
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav aria-label="Search results pagination">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {[...Array(totalPages)].map((_, index) => (
                            <li
                              key={index + 1}
                              className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setCurrentPage(index + 1)}
                              >
                                {index + 1}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                ) : (
                  <div className="alert alert-info">
                    No results found. Try adjusting your search criteria.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
