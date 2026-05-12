import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecords } from '@services/api';
import { HerbariumRecord, SolrResponse } from '@types';
import {
  FacetKey,
  FacetBuckets,
  RangeBuckets,
  SelectedFacetValues,
  SelectedDateRanges,
  DateRangeSelection,
  FACET_CONFIG,
  parseFacetArray,
  parseRangeArray,
  buildFqFilters,
  hasActiveFilters,
} from '@/types/facets';

const RESULTS_PER_PAGE = 10;

/** URL param name for each term facet key */
const FACET_URL_PARAMS: Partial<Record<FacetKey, string>> = {
  taxon: 'taxon',
  collector: 'collector',
  locality: 'locality',
  genus: 'genus',
  family: 'family',
  country: 'country',
  herbarium: 'herbarium',
  previousIdentifications: 'prevId',
  catalogNumber: 'catNum',
};

/** URL param names for date range facets: from/to stored as separate params */
const DATE_RANGE_URL_PARAMS: Partial<Record<FacetKey, { from: string; to: string }>> = {
  collectionDate: { from: 'dateFrom', to: 'dateTo' },
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
  selectedDateRanges: SelectedDateRanges;
  facetBuckets: FacetBuckets;
  rangeBuckets: RangeBuckets;
  anyActiveFilters: boolean;
  addFacetValue: (key: FacetKey, value: string) => void;
  removeFacetValue: (key: FacetKey, value: string) => void;
  clearFacet: (key: FacetKey) => void;
  setDateRange: (key: FacetKey, range: DateRangeSelection) => void;
  clearDateRange: (key: FacetKey) => void;
  clearAllFacets: () => void;
  setPage: (page: number) => void;
}

/**
 * Encapsulates all search page state: URL params, facet selections,
 * Solr fetching, and pagination.
 *
 * Design: the URL is the single source of truth.
 * selectedFacets, selectedDateRanges, and currentPage are derived directly
 * from searchParams on every render — no useState for filters, no sync effects.
 *
 * Mutations write directly to the URL via setSearchParams({ replace: true }),
 * which triggers a re-render, re-derives state, and re-fetches.
 */
export const useSearchState = (): SearchState => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Derive everything from URL ─────────────────────────────────────────────
  const query = searchParams.get('q') || '*:*';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Derive term facet selections
  const selectedFacets: SelectedFacetValues = {};
  for (const [key, param] of Object.entries(FACET_URL_PARAMS) as [FacetKey, string][]) {
    const vals = searchParams.getAll(param);
    if (vals.length > 0) selectedFacets[key] = vals;
  }

  // Derive date range selections
  const selectedDateRanges: SelectedDateRanges = {};
  for (const [key, params] of Object.entries(DATE_RANGE_URL_PARAMS) as [FacetKey, { from: string; to: string }][]) {
    const from = searchParams.get(params.from) ?? undefined;
    const to = searchParams.get(params.to) ?? undefined;
    if (from || to) selectedDateRanges[key] = { from, to };
  }

  // ── Local state for async fetch results only ───────────────────────────────
  const [results, setResults] = useState<HerbariumRecord[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facetBuckets, setFacetBuckets] = useState<FacetBuckets>({});
  const [rangeBuckets, setRangeBuckets] = useState<RangeBuckets>({});

  // ── Build filters eagerly (no stale-closure risk) ──────────────────────────
  const filters = buildFqFilters(selectedFacets, selectedDateRanges);
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

        // Parse term facet buckets
        if (response.facet_counts?.facet_fields) {
          const buckets: FacetBuckets = {};
          for (const cfg of FACET_CONFIG) {
            if (!cfg.enabled || cfg.type !== 'terms') continue;
            const raw = response.facet_counts.facet_fields[cfg.facetField];
            if (raw) buckets[cfg.key] = parseFacetArray(raw);
          }
          setFacetBuckets(buckets);
        }

        // Parse date range buckets
        if (response.facet_counts?.facet_ranges) {
          const rBuckets: RangeBuckets = {};
          for (const cfg of FACET_CONFIG) {
            if (!cfg.enabled || cfg.type !== 'dateRange') continue;
            const raw = response.facet_counts.facet_ranges[cfg.facetField];
            if (raw) rBuckets[cfg.key] = parseRangeArray(raw.counts);
          }
          setRangeBuckets(rBuckets);
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

  const setDateRange = useCallback(
    (key: FacetKey, range: DateRangeSelection) => {
      const urlParams = DATE_RANGE_URL_PARAMS[key];
      if (!urlParams) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (range.from) next.set(urlParams.from, range.from);
          else next.delete(urlParams.from);
          if (range.to) next.set(urlParams.to, range.to);
          else next.delete(urlParams.to);
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearDateRange = useCallback(
    (key: FacetKey) => {
      const urlParams = DATE_RANGE_URL_PARAMS[key];
      if (!urlParams) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(urlParams.from);
          next.delete(urlParams.to);
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clearAllFacets = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const param of Object.values(FACET_URL_PARAMS)) {
          if (param) next.delete(param);
        }
        for (const params of Object.values(DATE_RANGE_URL_PARAMS)) {
          if (params) {
            next.delete(params.from);
            next.delete(params.to);
          }
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
          if (page === 1) next.delete('page');
          else next.set('page', String(page));
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
    selectedDateRanges,
    facetBuckets,
    rangeBuckets,
    anyActiveFilters: hasActiveFilters(selectedFacets, selectedDateRanges),
    addFacetValue,
    removeFacetValue,
    clearFacet,
    setDateRange,
    clearDateRange,
    clearAllFacets,
    setPage,
  };
};
