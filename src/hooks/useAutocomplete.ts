import { useState, useCallback, useEffect, useRef } from 'react';
import { getSuggestions } from '@services/api';
import { SuggesterResponse, SuggestSuggestion } from '@types';

export interface SuggestionOption {
  term: string;
  type: 'taxon' | 'collector' | 'locality';
}

interface UseAutocompleteReturn {
  searchQuery: string;
  selectedSuggestions: SuggestionOption[];
  suggestions: SuggestionOption[];
  loading: boolean;
  showDropdown: boolean;
  highlightedIndex: number;
  setSearchQuery: (value: string) => void;
  addSuggestion: (suggestion: SuggestionOption) => void;
  removeSelection: (index: number) => void;
  clearAllSelections: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  dropdownRef: React.MutableRefObject<HTMLDivElement | null>;
}

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

export const useAutocomplete = (): UseAutocompleteReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<SuggestionOption[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response: SuggesterResponse = await getSuggestions(query);
      const options: SuggestionOption[] = [];

      // Parse taxonSuggest (taxon) suggestions - first priority
      if (response.suggest.taxonSuggest) {
        const queryKey = Object.keys(response.suggest.taxonSuggest)[0];
        if (queryKey && response.suggest.taxonSuggest[queryKey]?.suggestions) {
          response.suggest.taxonSuggest[queryKey].suggestions.forEach((option: SuggestSuggestion) => {
            options.push({
              term: capitalizeWithHtml(option.term),
              type: 'taxon'
            });
          });
        }
      }

      // Parse creatorSuggest (collector) suggestions - second priority
      if (response.suggest.creatorSuggest) {
        const queryKey = Object.keys(response.suggest.creatorSuggest)[0];
        if (queryKey && response.suggest.creatorSuggest[queryKey]?.suggestions) {
          response.suggest.creatorSuggest[queryKey].suggestions.forEach((option: SuggestSuggestion) => {
            options.push({
              term: capitalizeWithHtml(option.term),
              type: 'collector'
            });
          });
        }
      }

      // Parse localitySuggest (locality) suggestions - last priority
      if (response.suggest.localitySuggest) {
        const queryKey = Object.keys(response.suggest.localitySuggest)[0];
        if (queryKey && response.suggest.localitySuggest[queryKey]?.suggestions) {
          response.suggest.localitySuggest[queryKey].suggestions.forEach((option: SuggestSuggestion) => {
            options.push({
              term: capitalizeWithHtml(option.term),
              type: 'locality'
            });
          });
        }
      }

      setSuggestions(options);
      setShowDropdown(options.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced suggestion fetching
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, fetchSuggestions]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const addSuggestion = useCallback((suggestion: SuggestionOption) => {
    const exists = selectedSuggestions.some(s => s.term === suggestion.term && s.type === suggestion.type);
    if (!exists) {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
    
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  }, [selectedSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          addSuggestion(suggestions[highlightedIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    }
  }, [showDropdown, suggestions, highlightedIndex, addSuggestion]);

  const removeSelection = useCallback((index: number) => {
    setSelectedSuggestions(selectedSuggestions.filter((_, i) => i !== index));
  }, [selectedSuggestions]);

  const clearAllSelections = useCallback(() => {
    setSelectedSuggestions([]);
  }, []);

  return {
    searchQuery,
    selectedSuggestions,
    suggestions,
    loading,
    showDropdown,
    highlightedIndex,
    setSearchQuery,
    addSuggestion,
    removeSelection,
    clearAllSelections,
    handleInputChange,
    handleKeyDown,
    inputRef,
    dropdownRef,
  };
};