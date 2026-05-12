import { useCallback, useEffect, useState } from 'react';
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
 * Design: the URL is the single source of truth for selected facets.
 * `selectedFacets` is derived directly from `searchParams` on every render —
 * no separate useState for facets, no sync effect, no race conditions.
 *
 * Mutations write directly to the URL via setSearchParams({ replace: true }),
 * which triggers a re-render, re-derives selectedFacets, and re-fetches.
 */
export const useSearchState = (): SearchState => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive everything from URL (single source of truth) ───────────────────
  const query = searchParams.get('q') || '*:*';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Derive selectedFacets directly from URL params on every render
  const selectedFacets: SelectedFacetValues = {};
  for (const [key, param] of Object.entries(FACET_URL_PARAMS) as [FacetKey, string][]) {
    const vals = searchParams.getAll(param);
    if (vals.length > 0) selectedFacets[key] = vals;
  }

  // ── Local state only for async fetch results ───────────────────────────────
  const [results, setResults] = useState<HerbariumRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facetBuckets, setFacetBuckets] = useState<FacetBuckets>({});

  // ── Fetch whenever URL-derived state changes ───────────────────────────────
  // Build filters eagerly (outside the effect) so the closure always has
  // the current values — no stale-closure risk.
  const filters = buildFqFilters(selectedFacets);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const start = (currentPage - 1) * RESULTS_PER_PAGE;

        const response: SolrResponse = await searchRecords(
          query,
          filters,
          start,
          RESULTS_PER_PAGE,
          true
        );

        if (cancelled) return;

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
        if (!cancelled) {
          setError('Failed to fetch search results. Please try again.');
          console.error('Search error:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filtersKey, currentPage]);

  // ── URL mutation helpers ───────────────────────────────────────────────────

  /** Write updated facet values + optional page reset into the URL */
  const updateFacetInUrl = useCallback(
    (key: FacetKey, newValues: string[], resetPage = true) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const param = FACET_URL_PARAMS[key];
          if (!param) return next;
          next.delete(param);
          newValues.forEach((v) => next.append(param, v));
          if (resetPage) next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const addFacetValue = useCallback(
    (key: FacetKey, value: string) => {
      const current = selectedFacets[key] ?? [];
      if (current.includes(value)) return;
      updateFacetInUrl(key, [...current, value]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey, updateFacetInUrl]
  );

  const removeFacetValue = useCallback(
    (key: FacetKey, value: string) => {
      const current = selectedFacets[key] ?? [];
      updateFacetInUrl(key, current.filter((v) => v !== value));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtersKey, updateFacetInUrl]
  );

  const clearFacet = useCallback(
    (key: FacetKey) => updateFacetInUrl(key, []),
    [updateFacetInUrl]
  );

  const clearAllFacets = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const param of Object.values(FACET_URL_PARAMS)) {
          if (param) next.delete(param);
        }
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const setPage = useCallback(
    (page: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (page === 1) {
            next.delete('page');
          } else {
            next.set('page', String(page));
          }
          return next;
        },
        { replace: true }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

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
