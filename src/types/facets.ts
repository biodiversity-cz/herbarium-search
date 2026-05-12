/**
 * Facet model – designed for easy extensibility.
 *
 * To add a new facet (e.g. institution, altitude range, date range):
 *  1. Add a key to FacetKey
 *  2. Add the corresponding entry to FACET_CONFIG
 *  3. Add the key to SelectedFacetValues (with appropriate value type)
 *  4. The FacetSidebar will automatically render it via the registry
 */

// ─── Facet keys ───────────────────────────────────────────────────────────────

/** All supported facet identifiers. Extend this union to add new facets. */
export type FacetKey =
  | 'taxon'
  | 'collector'
  | 'locality'
  // Preliminary – will be wired up when Solr fields are ready:
  | 'family'
  | 'country'
  | 'institution'
  // Future range facets:
  | 'year'
  | 'altitude';

/** Facet types that determine how the UI renders and how filters are built */
export type FacetType = 'terms' | 'dateRange' | 'numericRange';

// ─── Facet configuration registry ────────────────────────────────────────────

export interface TermsFacetConfig {
  key: FacetKey;
  type: 'terms';
  label: string;
  /** Solr field used in fq filter expressions */
  filterField: string;
  /** Solr field used in facet.field requests (must be docValues=true) */
  facetField: string;
  /** Whether to show an autocomplete input above the facet list */
  hasAutocomplete: boolean;
  /** Solr suggester name used for autocomplete (if hasAutocomplete=true) */
  suggesterKey?: 'taxonSuggest' | 'creatorSuggest' | 'localitySuggest';
  /** Max facet values to request from Solr */
  facetLimit?: number;
  /** Badge colour class (Bootstrap) */
  badgeClass: string;
  enabled: boolean;
}

export interface DateRangeFacetConfig {
  key: FacetKey;
  type: 'dateRange';
  label: string;
  filterField: string;
  facetField: string;
  hasAutocomplete: false;
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

/**
 * Central facet registry.
 * Order here determines render order in the sidebar.
 *
 * NOTE on Solr fields:
 *  - taxon/collector/locality use *_facet copy-fields (string + docValues=true)
 *    that must be present in managed-schema.xml and data re-indexed.
 *  - family/country/institution already have docValues=true in the schema.
 *  - year/altitude are future range facets (event_date_from, altitude fields TBD).
 */
export const FACET_CONFIG: FacetConfig[] = [
  {
    key: 'taxon',
    type: 'terms',
    label: 'Taxon',
    filterField: 'scientific_name_facet',
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
    filterField: 'creator_facet',
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
    filterField: 'locality_facet',
    facetField: 'locality_facet',
    hasAutocomplete: true,
    suggesterKey: 'localitySuggest',
    facetLimit: 50,
    badgeClass: 'bg-locality',
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
  // ── Preliminary – enable when Solr field is ready ──────────────────────────
  {
    key: 'institution',
    type: 'terms',
    label: 'Institution',
    filterField: 'herbarium_acronym_facet',
    facetField: 'herbarium_acronym_facet',
    hasAutocomplete: false,
    facetLimit: 30,
    badgeClass: 'bg-secondary',
    enabled: false, // flip to true after re-index
  },
  // ── Future range facets ────────────────────────────────────────────────────
  {
    key: 'year',
    type: 'dateRange',
    label: 'Collection year',
    filterField: 'event_date_from',
    facetField: 'event_date_from',
    hasAutocomplete: false,
    badgeClass: 'bg-secondary',
    enabled: false, // enable when UI is built
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
    enabled: false, // enable when Solr field exists
  },
];

/** Convenience lookup: config by key */
export const FACET_CONFIG_MAP: Record<string, FacetConfig> = Object.fromEntries(
  FACET_CONFIG.map((c) => [c.key, c])
);

// ─── Runtime facet state ──────────────────────────────────────────────────────

/** One facet bucket returned by Solr */
export interface FacetBucket {
  value: string;
  count: number;
}

/** Selected values per facet key (terms facets use string[]) */
export type SelectedFacetValues = Partial<Record<FacetKey, string[]>>;

/** Available buckets per facet key */
export type FacetBuckets = Partial<Record<FacetKey, FacetBucket[]>>;

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

/** Build Solr fq filter strings from selected facet values */
export const buildFqFilters = (selected: SelectedFacetValues): string[] => {
  const filters: string[] = [];

  for (const cfg of FACET_CONFIG) {
    if (!cfg.enabled) continue;
    const values = selected[cfg.key];
    if (!values || values.length === 0) continue;

    if (cfg.type === 'terms') {
      const quoted = values.map((v) => `"${v}"`).join(' OR ');
      filters.push(`${cfg.filterField}:(${quoted})`);
    }
    // dateRange / numericRange filters will be added here when implemented
  }

  return filters;
};

/** Total count of all active filter values */
export const countActiveFilters = (selected: SelectedFacetValues): number =>
  Object.values(selected).reduce((sum, vals) => sum + (vals?.length ?? 0), 0);

/** Returns true if any facet has a selection */
export const hasActiveFilters = (selected: SelectedFacetValues): boolean =>
  countActiveFilters(selected) > 0;
