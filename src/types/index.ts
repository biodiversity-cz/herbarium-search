/**
 * Herbarium Specimen Image Record – matches actual Solr document fields.
 *
 * Multivalued Solr fields are typed as string[] | string to handle both
 * single-value and multi-value responses gracefully.
 */
export interface HerbariumRecord {
  // ── Core identifiers ──────────────────────────────────────────────────────
  id: string;
  catalog_number?: string;
  collection_code?: string[];
  material_sample_id?: string;   // URL to the source record (e.g. JACQ)
  basis_of_record?: string;

  // ── Taxonomy ──────────────────────────────────────────────────────────────
  title?: string[];              // usually the scientific name with author
  scientific_name?: string[];
  scientific_name_suggest?: string;
  genus?: string;
  family?: string;
  specific_epithet?: string;
  previous_identifications?: string[];

  // ── People ────────────────────────────────────────────────────────────────
  creator?: string[];            // collector(s)
  recorded_by?: string[];

  // ── Location ──────────────────────────────────────────────────────────────
  locality?: string[];
  country?: string;
  country_code?: string;

  // ── Dates ─────────────────────────────────────────────────────────────────
  event_date_raw?: string;
  event_date_from?: string;
  event_date_to?: string;

  // ── Institution ───────────────────────────────────────────────────────────
  herbarium_acronym?: string[];
  description?: string[];

  // ── Facet copy-fields (stored=false, not shown in detail) ─────────────────
  scientific_name_facet?: string[];
  creator_facet?: string[];
  locality_facet?: string[];
  herbarium_acronym_facet?: string[];
}

/** Helper: safely get the first value from a string | string[] field */
export const firstValue = (field: string | string[] | undefined): string | undefined => {
  if (!field) return undefined;
  return Array.isArray(field) ? field[0] : field;
};

/** Helper: always return an array (normalise single-value fields) */
export const asArray = (field: string | string[] | undefined): string[] => {
  if (!field) return [];
  return Array.isArray(field) ? field : [field];
};

/** One bucket in a Solr facet.range response */
export interface SolrRangeBucket {
  /** ISO date string (start of the range bucket) */
  start: string;
  count: number;
}

/**
 * Solr Search Response
 */
export interface SolrResponse {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string>;
  };
  response: {
    numFound: number;
    start: number;
    docs: HerbariumRecord[];
  };
  facet_counts?: {
    facet_fields?: Record<string, Array<string | number>>;
    facet_queries?: Record<string, number>;
    facet_ranges?: Record<string, {
      counts: Array<string | number>;
      gap: string;
      start: string;
      end: string;
    }>;
  };
  // JSON Facet API response (when using json.facet parameter)
  facets?: {
    count?: number;
    [key: string]: any; // Allows for custom facet names like unique_species
  };
}

/**
 * Facet Data Response (from /select endpoint with facet=true, rows=0)
 */
export interface FacetData {
  responseHeader: {
    status: number;
    QTime: number;
    params: Record<string, string>;
  };
  response: {
    numFound: number;
    start: number;
    docs: HerbariumRecord[];
  };
  facet_counts: {
    facet_fields: Record<string, Array<string | number>>;
    facet_ranges?: Record<string, {
      counts: Array<string | number>;
      gap: string;
      start: string;
      end: string;
    }>;
  };
}

/**
 * Solr Suggestion Response
 */
export interface SuggestSuggestion {
  term: string;
  weight: number;
  payload: string;
}

export interface SuggestDictionaryResult {
  [query: string]: {
    numFound: number;
    suggestions: SuggestSuggestion[];
  };
}

export interface SuggesterResponse {
  responseHeader: {
    status: number;
    QTime: number;
  };
  suggest: {
    creatorSuggest?: SuggestDictionaryResult;
    localitySuggest?: SuggestDictionaryResult;
    taxonSuggest?: SuggestDictionaryResult;
  };
}
