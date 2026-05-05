/**
 * Herbarium Specimen Record
 */
export interface HerbariumRecord {
  id: string;
  catalogNumber: string;
  scientificName: string;
  family?: string;
  genus?: string;
  species?: string;
  author?: string;
  collector?: string;
  collectionDate?: string;
  country?: string;
  locality?: string;
  habitat?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  institution?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  determiner?: string;
  determinationDate?: string;
  notes?: string;
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
  };
}

/**
 * Search Filters
 */
export interface SearchFilters {
  scientificName?: string;
  family?: string;
  genus?: string;
  species?: string;
  collector?: string;
  country?: string;
  locality?: string;
  yearFrom?: number;
  yearTo?: number;
  institution?: string;
}

/**
 * Facet Configuration
 */
export interface FacetConfig {
  field: string;
  label: string;
  type: 'list' | 'range' | 'date';
  showCount?: boolean;
  size?: number;
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

/**
 * Selected Suggestion with prefix type
 */
export interface SelectedSuggestion {
  id: string;
  label: string;
  type: 'taxon' | 'collector' | 'locality';
  value: string;
}
