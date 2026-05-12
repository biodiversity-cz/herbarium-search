/**
 * Suggestion option returned from Solr suggesters
 */
export interface SuggestionOption {
  term: string;
  type: 'taxon' | 'collector' | 'locality';
}

/**
 * Persisted search state stored in sessionStorage
 */
export interface PersistedSearchState {
  selectedSuggestions: SuggestionOption[];
}

export const SEARCH_STATE_STORAGE_KEY = 'herbarium_search_state';
