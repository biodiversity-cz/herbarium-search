import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecords } from '@services/api';
import { HerbariumRecord, SolrResponse } from '@types';
import {
  FacetKey,
  FacetBuckets,
  SelectedFacetValues,
  FACET_CONFIG,
  parseFacetArray,
  buildFqFilters,
  hasActiveFilters,
} from '@/types/facets';

const RESULTS_PER_PAGE = 10;

/** URL param name for each facet key that is exposed in the URL */
const FACET_URL_PARAMS: Partial<Record<FacetKey, string>> = {
  taxon: 'taxon',
  collector: 'collector',
  locality: 'locality',
};

export interface SearchState {
  results: HerbariumRecord[];
  totalResults: number;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  query: string;
  selectedFacets: SelectedFacetValues;
  facetBuckets: FacetBuckets;
  anyActiveFilters: boolean;
  addFacetValue: (key: FacetKey, value: string) => void;
  removeFacetValue: (key: FacetKey, value: string) => void;
  clearFacet: (key: FacetKey) => void;
  clearAllFacets: () => void;
  setPage: (page: number) => void;
}

/**
 * Encapsulates all search page state: URL params, facet selections,
 * Solr fetching, and pagination.
 *
 * The URL is kept in sync with the selected facets so that:
 *  - F5 / browser refresh restores the current filter state
 *  - Removing a filter also removes it from the URL (no ghost re-appearance)
 *  - Links from IndexPage pre-populate the sidebar via URL params
 */
export const useSearchState = (): SearchState => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive query from URL (read-only; not changed by facet interactions) ───
  const query = searchParams.get('q') || '*:*';

  // ── Initialise facet selections from URL ──────────────────────────────────
  const [selectedFacets, setSelectedFacets] = useState<SelectedFacetValues>(() => {
    const initial: SelectedFacetValues = {};
    for (const [key, param] of Object.entries(FACET_URL_PARAMS) as [FacetKey, string][]) {
      const vals = searchParams.getAll(param);
      if (vals.length > 0) initial[key] = vals;
    }
    return initial;
  });

  const [results, setResults] = useState<HerbariumRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [facetBuckets, setFacetBuckets] = useState<FacetBuckets>({});

  // ── Sync selectedFacets → URL ─────────────────────────────────────────────
  // Runs whenever selectedFacets changes so the URL always reflects reality.
  // Uses `replace: true` to avoid polluting the browser history on every
  // facet toggle.
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);

        // Rebuild only the facet params we manage; leave ?q= and others intact
        for (const [key, param] of Object.entries(FACET_URL_PARAMS) as [FacetKey, string][]) {
          next.delete(param);
          const vals = selectedFacets[key] ?? [];
          vals.forEach((v) => next.append(param, v));
        }

        return next;
      },
      { replace: true }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFacets]);

  // ── Fetch results + facet buckets ─────────────────────────────────────────
  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = buildFqFilters(selectedFacets);
      const start = (currentPage - 1) * RESULTS_PER_PAGE;

      const response: SolrResponse = await searchRecords(
        query,
        filters,
        start,
        RESULTS_PER_PAGE,
        true
      );

      setResults(response.response.docs);
      setTotalResults(response.response.numFound);

      if (response.facet_counts?.facet_fields) {
        const buckets: FacetBuckets = {};
        for (const cfg of FACET_CONFIG) {
          if (!cfg.enabled || cfg.type !== 'terms') continue;
          const raw = response.facet_counts.facet_fields[cfg.facetField];
          if (raw) buckets[cfg.key] = parseFacetArray(raw);
        }
        setFacetBuckets(buckets);
      }
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedFacets, currentPage]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ── Facet mutations ────────────────────────────────────────────────────────
  const addFacetValue = useCallback((key: FacetKey, value: string) => {
    setSelectedFacets((prev) => {
      const current = prev[key] ?? [];
      if (current.includes(value)) return prev;
      return { ...prev, [key]: [...current, value] };
    });
    setCurrentPage(1);
  }, []);

  const removeFacetValue = useCallback((key: FacetKey, value: string) => {
    setSelectedFacets((prev) => {
      const current = prev[key] ?? [];
      return { ...prev, [key]: current.filter((v) => v !== value) };
    });
    setCurrentPage(1);
  }, []);

  const clearFacet = useCallback((key: FacetKey) => {
    setSelectedFacets((prev) => ({ ...prev, [key]: [] }));
    setCurrentPage(1);
  }, []);

  const clearAllFacets = useCallback(() => {
    setSelectedFacets({});
    setCurrentPage(1);
  }, []);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  return {
    results,
    totalResults,
    loading,
    error,
    currentPage,
    totalPages,
    query,
    selectedFacets,
    facetBuckets,
    anyActiveFilters: hasActiveFilters(selectedFacets),
    addFacetValue,
    removeFacetValue,
    clearFacet,
    clearAllFacets,
    setPage,
  };
};
