import { useState, useCallback, useEffect, useRef } from 'react';
import { getSuggestions } from '@services/api';
import { SuggesterResponse, SuggestSuggestion } from '@types';
import { TermsFacetConfig } from '@/types/facets';

export interface FacetSuggestion {
  term: string;
}

interface UseFacetAutocompleteReturn {
  query: string;
  suggestions: FacetSuggestion[];
  loading: boolean;
  showDropdown: boolean;
  highlightedIndex: number;
  setQuery: (v: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  selectSuggestion: (s: FacetSuggestion) => void;
  closeDropdown: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const capitalizeWithHtml = (term: string): string => {
  if (term.startsWith('<b>')) {
    const closeIdx = term.indexOf('</b>');
    if (closeIdx > 0) {
      const highlighted = term.substring(3, closeIdx);
      const rest = term.substring(closeIdx + 4);
      return `<b>${highlighted.charAt(0).toUpperCase()}${highlighted.slice(1)}</b>${rest}`;
    }
  }
  return term.charAt(0).toUpperCase() + term.slice(1);
};

/**
 * Autocomplete hook scoped to a single facet.
 * Fetches suggestions from the Solr suggester configured for this facet.
 */
export const useFacetAutocomplete = (
  facetConfig: TermsFacetConfig,
  onSelect: (value: string) => void
): UseFacetAutocompleteReturn => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FacetSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (!facetConfig.suggesterKey || q.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      setLoading(true);
      try {
        const response: SuggesterResponse = await getSuggestions(q);
        const key = facetConfig.suggesterKey;
        const dict = response.suggest[key];
        if (!dict) {
          setSuggestions([]);
          setShowDropdown(false);
          return;
        }
        const queryKey = Object.keys(dict)[0];
        const raw: SuggestSuggestion[] = dict[queryKey]?.suggestions ?? [];
        const items: FacetSuggestion[] = raw.map((s) => ({
          term: capitalizeWithHtml(s.term),
        }));
        setSuggestions(items);
        setShowDropdown(items.length > 0);
        setHighlightedIndex(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [facetConfig.suggesterKey]
  );

  // Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const selectSuggestion = useCallback(
    (s: FacetSuggestion) => {
      const clean = s.term.replace(/<\/?b>/g, '');
      onSelect(clean);
      setQuery('');
      setSuggestions([]);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    },
    [onSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown || suggestions.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((p) => (p > 0 ? p - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          selectSuggestion(suggestions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    },
    [showDropdown, suggestions, highlightedIndex, selectSuggestion]
  );

  const closeDropdown = useCallback(() => setShowDropdown(false), []);

  return {
    query,
    suggestions,
    loading,
    showDropdown,
    highlightedIndex,
    setQuery,
    handleInputChange,
    handleKeyDown,
    selectSuggestion,
    closeDropdown,
    inputRef,
    dropdownRef,
  };
};
