import React from 'react';
import { useAutocomplete, SuggestionOption } from '@hooks/useAutocomplete';
import { SelectedSuggestionsTags } from './SelectedSuggestionsTags';
import { SuggestionsDropdown } from './SuggestionsDropdown';

export type { SuggestionOption };

interface SearchBoxProps {
  onSubmit?: (query: string, selectedSuggestions: SuggestionOption[]) => void;
  /** When true, selected taxon/collector/locality tags are persisted in sessionStorage */
  persist?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSubmit, persist = false }) => {
  const {
    searchQuery,
    selectedSuggestions,
    suggestions,
    loading,
    showDropdown,
    highlightedIndex,
    addSuggestion,
    removeSelection,
    clearAllSelections,
    handleInputChange,
    handleKeyDown,
    inputRef,
    dropdownRef,
  } = useAutocomplete({ persist });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(searchQuery, selectedSuggestions);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-box mt-4">
      <div className="autocomplete-container" ref={dropdownRef}>
        {selectedSuggestions.length > 0 && (
          <SelectedSuggestionsTags
            selectedSuggestions={selectedSuggestions}
            onRemove={removeSelection}
            onClearAll={clearAllSelections}
          />
        )}

        <div className="input-group input-group-lg">
          <input
            ref={inputRef}
            type="text"
            className="form-control"
            placeholder="Type to search by taxon, collector, or locality..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label="Search herbarium specimen images"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            autoComplete="off"
          />
          {loading && (
            <span className="input-group-text">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            </span>
          )}
          <button type="submit" className="btn btn-search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.156a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
            </svg>
            <span className="ms-2">Search</span>
          </button>
        </div>

        {showDropdown && suggestions.length > 0 && (
          <SuggestionsDropdown
            suggestions={suggestions}
            highlightedIndex={highlightedIndex}
            onSelect={addSuggestion}
          />
        )}
      </div>
    </form>
  );
};
