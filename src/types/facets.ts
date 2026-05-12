/**
 * Facet model – designed for easy extensibility.
 *
 * To add a new facet:
 *  1. Add a key to FacetKey
 *  2. Add the corresponding entry to FACET_CONFIG
 *  3. The FacetSidebar will automatically render it via the registry
 *
 * To add a new facet TYPE (e.g. numericRange):
 *  1. Add a new *FacetConfig interface
 *  2. Add it to the FacetConfig union
 *  3. Add a new panel component in src/components/search/facets/
 *  4. Add a one-line `if` in FacetSidebar.tsx
 */

// ─── Facet keys ───────────────────────────────────────────────────────────────

export type FacetKey =
  | 'taxon'
  | 'collector'
  | 'locality'
  | 'genus'
  | 'family'
  | 'country'
  | 'herbarium'
  | 'previousIdentifications'
  | 'catalogNumber'
  | 'institution'
  | 'collectionDate'
  | 'year'
  | 'altitude';

export type FacetType = 'terms' | 'dateRange' | 'numericRange';

// ─── Facet configuration interfaces ──────────────────────────────────────────

export interface TermsFacetConfig {
  key: FacetKey;
  type: 'terms';
  label: string;
  /** Solr field used in fq filter expressions (text_general for case-insensitive match) */
  filterField: string;
  /** Solr field used in facet.field requests (must be docValues=true, StrField) */
  facetField: string;
  hasAutocomplete: boolean;
  suggesterKey?: 'taxonSuggest' | 'creatorSuggest' | 'localitySuggest';
  facetLimit?: number;
  badgeClass: string;
  enabled: boolean;
}

export interface DateRangeFacetConfig {
  key: FacetKey;
  type: 'dateRange';
  label: string;
  /** Solr pdate field used in range queries */
  filterField: string;
  /** Solr pdate field used in facet.range requests (must be docValues=true) */
  facetField: string;
  hasAutocomplete: false;
  /** Solr facet.range.start (ISO date string) */
  rangeStart: string;
  /** Solr facet.range.end (ISO date string) */
  rangeEnd: string;
  /** Solr facet.range.gap (e.g. '+10YEAR', '+1YEAR') */
  rangeGap: string;
  badgeClass: string;
  enabled: boolean;
}

export interface NumericRangeFacetConfig {
  key: FacetKey;
  type: 'numericRange';
  label: string;
  filterField: string;
  facetField: string;
  hasAutocomplete: false;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  badgeClass: string;
  enabled: boolean;
}

export type FacetConfig = TermsFacetConfig | DateRangeFacetConfig | NumericRangeFacetConfig;

// ─── Central facet registry ───────────────────────────────────────────────────

/**
 * FACET_CONFIG is the single place to add/remove/configure facets.
 * Order here determines render order in the sidebar.
 *
 * filterField vs facetField:
 *  - filterField: text_general (tokenized, lowercased) → case-insensitive fq phrase match
 *  - facetField:  StrField + docValues=true → exact bucket counts
 *  These must NOT be swapped (see docs/gotchas.md #7).
 */
export const FACET_CONFIG: FacetConfig[] = [
  // ── Primary search facets (with autocomplete) ──────────────────────────────
  {
    key: 'taxon',
    type: 'terms',
    label: 'Taxon',
    filterField: 'scientific_name',
    facetField: 'scientific_name_facet',
    hasAutocomplete: true,
    suggesterKey: 'taxonSuggest',
    facetLimit: 50,
    badgeClass: 'bg-taxon',
    enabled: true,
  },
  {
    key: 'collector',
    type: 'terms',
    label: 'Collector',
    filterField: 'creator',
    facetField: 'creator_facet',
    hasAutocomplete: true,
    suggesterKey: 'creatorSuggest',
    facetLimit: 50,
    badgeClass: 'bg-collector',
    enabled: true,
  },
  {
    key: 'locality',
    type: 'terms',
    label: 'Locality',
    filterField: 'locality',
    facetField: 'locality_facet',
    hasAutocomplete: true,
    suggesterKey: 'localitySuggest',
    facetLimit: 50,
    badgeClass: 'bg-locality',
    enabled: true,
  },

  // ── Taxonomy ───────────────────────────────────────────────────────────────
  {
    key: 'genus',
    type: 'terms',
    label: 'Genus',
    // genus is already a StrField with docValues=true → can use directly for both
    filterField: 'genus',
    facetField: 'genus',
    hasAutocomplete: false,
    facetLimit: 50,
    badgeClass: 'bg-secondary',
    enabled: true,
  },
  {
    key: 'family',
    type: 'terms',
    label: 'Family',
    filterField: 'family',
    facetField: 'family',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: true,
  },
  {
    key: 'previousIdentifications',
    type: 'terms',
    label: 'Previous identifications',
    // previous_identifications is text_general → use for filter
    filterField: 'previous_identifications',
    // previous_identifications_facet is StrField + docValues → use for counts
    facetField: 'previous_identifications_facet',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: true,
  },

  // ── Geography ──────────────────────────────────────────────────────────────
  {
    key: 'country',
    type: 'terms',
    label: 'Country',
    filterField: 'country',
    facetField: 'country',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: true,
  },

  // ── Institution / collection ───────────────────────────────────────────────
  {
    key: 'herbarium',
    type: 'terms',
    label: 'Herbarium',
    filterField: 'herbarium_acronym_facet',
    facetField: 'herbarium_acronym_facet',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: true,
  },
  {
    key: 'catalogNumber',
    type: 'terms',
    label: 'Catalog number',
    // catalog_number is StrField (no docValues) → use for filter
    filterField: 'catalog_number',
    // catalog_number_facet is StrField + docValues → use for counts
    facetField: 'catalog_number_facet',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: true,
  },

  // ── Date range ─────────────────────────────────────────────────────────────
  {
    key: 'collectionDate',
    type: 'dateRange',
    label: 'Collection date',
    filterField: 'event_date_from',
    facetField: 'event_date_from',
    hasAutocomplete: false,
    rangeStart: '1700-01-01T00:00:00Z',
    rangeEnd: '2026-01-01T00:00:00Z',
    rangeGap: '+10YEAR',
    badgeClass: 'bg-secondary',
    enabled: true,
  },

  // ── Preliminary / future ───────────────────────────────────────────────────
  {
    key: 'institution',
    type: 'terms',
    label: 'Institution (full name)',
    filterField: 'herbarium_acronym_facet',
    facetField: 'herbarium_acronym_facet',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: false,
  },
  {
    key: 'year',
    type: 'dateRange',
    label: 'Collection year (1-year buckets)',
    filterField: 'event_date_from',
    facetField: 'event_date_from',
    hasAutocomplete: false,
    rangeStart: '1700-01-01T00:00:00Z',
    rangeEnd: '2026-01-01T00:00:00Z',
    rangeGap: '+1YEAR',
    badgeClass: 'bg-secondary',
    enabled: false,
  },
  {
    key: 'altitude',
    type: 'numericRange',
    label: 'Altitude (m)',
    filterField: 'altitude',
    facetField: 'altitude',
    hasAutocomplete: false,
    min: 0,
    max: 3000,
    step: 100,
    unit: 'm',
    badgeClass: 'bg-secondary',
    enabled: false,
  },
];

export const FACET_CONFIG_MAP: Record<string, FacetConfig> = Object.fromEntries(
  FACET_CONFIG.map((c) => [c.key, c])
);

// ─── Runtime facet state ──────────────────────────────────────────────────────

export interface FacetBucket {
  value: string;
  count: number;
}

/** Date range selection: { from: '1900', to: '1950' } (year strings) */
export interface DateRangeSelection {
  from?: string;
  to?: string;
}

/** Selected values per facet key */
export type SelectedFacetValues = Partial<Record<FacetKey, string[]>>;

/** Selected date ranges per facet key */
export type SelectedDateRanges = Partial<Record<FacetKey, DateRangeSelection>>;

/** Available term buckets per facet key */
export type FacetBuckets = Partial<Record<FacetKey, FacetBucket[]>>;

/** Available range buckets per facet key */
export type RangeBuckets = Partial<Record<FacetKey, FacetBucket[]>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse the flat Solr facet_fields array [value, count, value, count, …] */
export const parseFacetArray = (arr: Array<string | number>): FacetBucket[] => {
  const result: FacetBucket[] = [];
  for (let i = 0; i + 1 < arr.length; i += 2) {
    const value = arr[i] as string;
    const count = arr[i + 1] as number;
    if (count > 0) result.push({ value, count });
  }
  return result;
};

/** Parse the flat Solr facet_ranges counts array into FacetBucket[] */
export const parseRangeArray = (arr: Array<string | number>): FacetBucket[] => {
  const result: FacetBucket[] = [];
  for (let i = 0; i + 1 < arr.length; i += 2) {
    const isoDate = arr[i] as string;
    const count = arr[i + 1] as number;
    if (count > 0) {
      // Extract year from ISO date string
      const year = isoDate.substring(0, 4);
      result.push({ value: year, count });
    }
  }
  return result;
};

/** Build Solr fq filter strings from selected term facet values */
export const buildFqFilters = (
  selected: SelectedFacetValues,
  dateRanges: SelectedDateRanges = {}
): string[] => {
  const filters: string[] = [];

  for (const cfg of FACET_CONFIG) {
    if (!cfg.enabled) continue;

    if (cfg.type === 'terms') {
      const values = selected[cfg.key];
      if (!values || values.length === 0) continue;
      const quoted = values.map((v) => `"${v}"`).join(' OR ');
      filters.push(`${cfg.filterField}:(${quoted})`);
    }

    if (cfg.type === 'dateRange') {
      const range = dateRanges[cfg.key];
      if (!range || (!range.from && !range.to)) continue;
      const from = range.from ? `${range.from}-01-01T00:00:00Z` : '*';
      const to = range.to ? `${range.to}-12-31T23:59:59Z` : '*';
      filters.push(`${cfg.filterField}:[${from} TO ${to}]`);
    }
  }

  return filters;
};

export const countActiveFilters = (
  selected: SelectedFacetValues,
  dateRanges: SelectedDateRanges = {}
): number => {
  const termCount = Object.values(selected).reduce((sum, vals) => sum + (vals?.length ?? 0), 0);
  const rangeCount = Object.values(dateRanges).filter(
    (r) => r && (r.from || r.to)
  ).length;
  return termCount + rangeCount;
};

export const hasActiveFilters = (
  selected: SelectedFacetValues,
  dateRanges: SelectedDateRanges = {}
): boolean => countActiveFilters(selected, dateRanges) > 0;
