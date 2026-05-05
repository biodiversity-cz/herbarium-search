import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecords, getSuggestions } from '@services/api';
import { HerbariumRecord, SolrResponse, SuggesterResponse, SuggestSuggestion } from '@types';
import ResultCard from '@components/search/CustomReactiveList';

interface SelectedFacetValues {
  taxon: string[];
  collector: string[];
  locality: string[];
}

interface TaxonSuggestion {
  term: string;
}

const parseFacetArray = (facetArray: Array<string | number>): { value: string; count: number }[] => {
  const result: { value: string; count: number }[] = [];
  for (let i = 0; i < facetArray.length; i += 2) {
    result.push({
      value: facetArray[i] as string,
      count: facetArray[i + 1] as number
    });
  }
  return result;
};

const capitalizeWithHtml = (term: string): string => {
  if (term.startsWith('<b>')) {
    const closeIdx = term.indexOf('</b>');
    if (closeIdx > 0) {
      const highlightedContent = term.substring(3, closeIdx);
      const restOfTerm = term.substring(closeIdx + 4);
      const capitalizedFirst = highlightedContent.charAt(0).toUpperCase();
      return `<b>${capitalizedFirst}${highlightedContent.slice(1)}</b>${restOfTerm}`;
    }
  }
  return term.charAt(0).toUpperCase() + term.slice(1);
};

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<HerbariumRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query] = useState(searchParams.get('q') || '');
  
  // Initialize facet selections from URL parameters (includes preset filters)
  const [selectedFacets, setSelectedFacets] = useState<SelectedFacetValues>(() => ({
    taxon: searchParams.getAll('taxon'),
    collector: searchParams.getAll('collector'),
    locality: searchParams.getAll('locality')
  }));
  
  // Available facet options from Solr (filtered by current selection)
  const [facetOptions, setFacetOptions] = useState<{
    taxon: { value: string; count: number }[];
    collector: { value: string; count: number }[];
    locality: { value: string; count: number }[];
  }>({
    taxon: [],
    collector: [],
    locality: []
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  
  // Taxon autocomplete state
  const [taxonQuery, setTaxonQuery] = useState('');
  const [taxonSuggestions, setTaxonSuggestions] = useState<TaxonSuggestion[]>([]);
  const [taxonLoading, setTaxonLoading] = useState(false);
  const [showTaxonDropdown, setShowTaxonDropdown] = useState(false);
  const [highlightedTaxonIndex, setHighlightedTaxonIndex] = useState(-1);
  const taxonDropdownRef = useRef<HTMLDivElement>(null);
  const taxonInputRef = useRef<HTMLInputElement>(null);
  const taxonDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close taxon dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taxonDropdownRef.current && !taxonDropdownRef.current.contains(event.target as Node)) {
        setShowTaxonDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch taxon suggestions
  const fetchTaxonSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setTaxonSuggestions([]);
      setShowTaxonDropdown(false);
      return;
    }

    setTaxonLoading(true);
    try {
      const response: SuggesterResponse = await getSuggestions(query);
      const options: TaxonSuggestion[] = [];

      if (response.suggest.taxonSuggest) {
        const queryKey = Object.keys(response.suggest.taxonSuggest)[0];
        if (queryKey && response.suggest.taxonSuggest[queryKey]?.suggestions) {
          response.suggest.taxonSuggest[queryKey].suggestions.forEach((option: SuggestSuggestion) => {
            options.push({ term: capitalizeWithHtml(option.term) });
          });
        }
      }

      setTaxonSuggestions(options);
      setShowTaxonDropdown(options.length > 0);
      setHighlightedTaxonIndex(-1);
    } catch (error) {
      console.error('Error fetching taxon suggestions:', error);
      setTaxonSuggestions([]);
    } finally {
      setTaxonLoading(false);
    }
  }, []);

  // Debounced taxon suggestion fetching
  useEffect(() => {
    if (taxonDebounceRef.current) {
      clearTimeout(taxonDebounceRef.current);
    }

    if (taxonQuery.length >= 2) {
      taxonDebounceRef.current = setTimeout(() => {
        fetchTaxonSuggestions(taxonQuery);
      }, 300);
    } else {
      setTaxonSuggestions([]);
      setShowTaxonDropdown(false);
    }

    return () => {
      if (taxonDebounceRef.current) {
        clearTimeout(taxonDebounceRef.current);
      }
    };
  }, [taxonQuery, fetchTaxonSuggestions]);

  // Add taxon from autocomplete
  const addTaxonFromAutocomplete = useCallback((suggestion: TaxonSuggestion) => {
    const cleanTerm = suggestion.term.replace(/<\/?b>/g, '');
    
    setSelectedFacets(prev => {
      if (prev.taxon.includes(cleanTerm)) return prev;
      return { ...prev, taxon: [...prev.taxon, cleanTerm] };
    });
    
    setTaxonQuery('');
    setTaxonSuggestions([]);
    setShowTaxonDropdown(false);
    setCurrentPage(1);
  }, []);

  // Remove taxon filter
  const removeTaxonFilter = useCallback((taxon: string) => {
    setSelectedFacets(prev => ({
      ...prev,
      taxon: prev.taxon.filter(t => t !== taxon)
    }));
  }, []);

  // Clear all taxon filters
  const clearAllTaxonFilters = useCallback(() => {
    setSelectedFacets(prev => ({ ...prev, taxon: [] }));
  }, []);

  // Handle taxon input keydown
  const handleTaxonKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showTaxonDropdown && taxonSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedTaxonIndex(prev => 
          prev < taxonSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedTaxonIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedTaxonIndex >= 0 && taxonSuggestions[highlightedTaxonIndex]) {
          addTaxonFromAutocomplete(taxonSuggestions[highlightedTaxonIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowTaxonDropdown(false);
      }
    }
  }, [showTaxonDropdown, taxonSuggestions, highlightedTaxonIndex, addTaxonFromAutocomplete]);

  // Build all filters (preset + user-selected)
  const buildFilters = useCallback((): string[] => {
    const filters: string[] = [];
    
    // Build OR filter for taxon values (multiple taxa should match ANY of them)
    if (selectedFacets.taxon.length > 0) {
      const taxonValues = selectedFacets.taxon.map(t => `"${t}"`).join(' OR ');
      filters.push(`scientific_name:(${taxonValues})`);
    }
    
    // Build OR filter for collector values
    if (selectedFacets.collector.length > 0) {
      const collectorValues = selectedFacets.collector.map(c => `"${c}"`).join(' OR ');
      filters.push(`collector:(${collectorValues})`);
    }
    
    // Build OR filter for locality values
    if (selectedFacets.locality.length > 0) {
      const localityValues = selectedFacets.locality.map(l => `"${l}"`).join(' OR ');
      filters.push(`locality:(${localityValues})`);
    }
    
    return filters;
  }, [selectedFacets]);

  // Combined fetch function - gets both results and facets in one API call
  const fetchResultsAndFacets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = buildFilters();
      const start = (currentPage - 1) * resultsPerPage;
      
      const response: SolrResponse = await searchRecords(
        query || '*:*',
        filters,
        start,
        resultsPerPage,
        true // Include facets in the same call
      );

      setResults(response.response.docs);
      setTotalResults(response.response.numFound);

      // Parse and set facet options from the same response
      if (response.facet_counts?.facet_fields) {
        setFacetOptions({
          taxon: response.facet_counts.facet_fields.taxon 
            ? parseFacetArray(response.facet_counts.facet_fields.taxon)
            : [],
          collector: response.facet_counts.facet_fields.collector 
            ? parseFacetArray(response.facet_counts.facet_fields.collector)
            : [],
          locality: response.facet_counts.facet_fields.locality 
            ? parseFacetArray(response.facet_counts.facet_fields.locality)
            : []
        });
      }
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, buildFilters, currentPage]);

  // Single effect that fetches both results and facets
  useEffect(() => {
    fetchResultsAndFacets();
  }, [fetchResultsAndFacets]);


  const toggleFacetValue = (facetType: 'taxon' | 'collector' | 'locality', value: string) => {
    setSelectedFacets(prev => {
      const current = prev[facetType];
      const exists = current.includes(value);
      
      return {
        ...prev,
        [facetType]: exists 
          ? current.filter(v => v !== value)
          : [...current, value]
      };
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedFacets({ taxon: [], collector: [], locality: [] });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const hasActiveFilters = selectedFacets.taxon.length > 0 || 
                           selectedFacets.collector.length > 0 || 
                           selectedFacets.locality.length > 0;

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="container">
          <h1>Advanced Search</h1>
          <p className="mb-0">Explore our herbarium collection</p>
        </div>
      </div>

      <div className="container">

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
                
                {hasActiveFilters && (
                  <button
                    className="btn btn-sm btn-outline-secondary w-100 mb-3"
                    onClick={clearAllFilters}
                  >
                    Clear All Filters ({selectedFacets.taxon.length + selectedFacets.collector.length + selectedFacets.locality.length} selected)
                  </button>
                )}

                {/* Taxon Facet */}
                <div className="facet-group mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="h6 mb-0">Taxon</h5>
                    {selectedFacets.taxon.length > 0 && (
                      <span className="badge bg-success">{selectedFacets.taxon.length}</span>
                    )}
                  </div>
                  
                  {/* Taxon Autocomplete */}
                  <div className="mb-3" ref={taxonDropdownRef}>
                    <div className="input-group input-group-sm">
                      <input
                        ref={taxonInputRef}
                        type="text"
                        className="form-control"
                        placeholder="Add taxon..."
                        value={taxonQuery}
                        onChange={(e) => setTaxonQuery(e.target.value)}
                        onKeyDown={handleTaxonKeyDown}
                        autoComplete="off"
                      />
                      {taxonLoading && (
                        <span className="input-group-text">
                          <span className="spinner-border spinner-border-sm" role="status" />
                        </span>
                      )}
                    </div>
                    
                    {/* Selected taxon tags */}
                    {selectedFacets.taxon.length > 0 && (
                      <div className="mt-2">
                        {selectedFacets.taxon.map((taxon) => (
                          <span
                            key={`selected-taxon-${taxon}`}
                            className="badge bg-success me-1 mb-1 d-inline-flex align-items-center"
                          >
                            <span>{taxon}</span>
                            <button
                              type="button"
                              className="btn-close btn-close-white ms-1 p-0"
                              style={{ fontSize: '0.6rem', lineHeight: 1 }}
                              onClick={() => removeTaxonFilter(taxon)}
                              aria-label="Remove"
                            />
                          </span>
                        ))}
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none p-0 ms-2"
                          onClick={clearAllTaxonFilters}
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                    
                    {/* Suggestions dropdown */}
                    {showTaxonDropdown && taxonSuggestions.length > 0 && (
                      <ul className="list-group position-absolute z-index-1" style={{ maxWidth: '100%', zIndex: 1000 }}>
                        {taxonSuggestions.map((suggestion, index) => (
                          <li
                            key={`suggestion-${suggestion.term}-${index}`}
                            className={`list-group-item list-group-item-action cursor-pointer ${index === highlightedTaxonIndex ? 'active' : ''}`}
                            onClick={() => addTaxonFromAutocomplete(suggestion)}
                            style={{ cursor: 'pointer' }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: suggestion.term }} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {/* Taxon facet list */}
                  <div className="facet-list">
                    {facetOptions.taxon.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {facetOptions.taxon.map((item) => {
                          const isSelected = selectedFacets.taxon.includes(item.value);
                          return (
                            <button
                              key={`taxon-${item.value}`}
                              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleFacetValue('taxon', item.value)}
                            >
                              <span className="text-truncate">{item.value}</span>
                              <span className={`badge ${isSelected ? 'bg-light text-dark' : 'bg-secondary'}`}>
                                {item.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No taxon options available</p>
                    )}
                  </div>
                </div>

                {/* Collector Facet */}
                <div className="facet-group mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="h6 mb-0">Collector</h5>
                    {selectedFacets.collector.length > 0 && (
                      <span className="badge bg-warning text-dark">{selectedFacets.collector.length}</span>
                    )}
                  </div>
                  <div className="facet-list">
                    {facetOptions.collector.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {facetOptions.collector.map((item) => {
                          const isSelected = selectedFacets.collector.includes(item.value);
                          return (
                            <button
                              key={`collector-${item.value}`}
                              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleFacetValue('collector', item.value)}
                            >
                              <span className="text-truncate">{item.value}</span>
                              <span className={`badge ${isSelected ? 'bg-light text-dark' : 'bg-secondary'}`}>
                                {item.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No collector options available</p>
                    )}
                  </div>
                </div>

                {/* Locality Facet */}
                <div className="facet-group mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="h6 mb-0">Locality</h5>
                    {selectedFacets.locality.length > 0 && (
                      <span className="badge bg-primary">{selectedFacets.locality.length}</span>
                    )}
                  </div>
                  <div className="facet-list">
                    {facetOptions.locality.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {facetOptions.locality.map((item) => {
                          const isSelected = selectedFacets.locality.includes(item.value);
                          return (
                            <button
                              key={`locality-${item.value}`}
                              className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isSelected ? 'active' : ''}`}
                              onClick={() => toggleFacetValue('locality', item.value)}
                            >
                              <span className="text-truncate">{item.value}</span>
                              <span className={`badge ${isSelected ? 'bg-light text-dark' : 'bg-secondary'}`}>
                                {item.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No locality options available</p>
                    )}
                  </div>
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
                <div className="search-stats mb-3">
                  <strong>
                    {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  </strong>
                  {hasActiveFilters && (
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
                      <nav aria-label="Search results pagination" className="mt-4">
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
