import React from 'react';
import { useAutocomplete } from '@hooks/useAutocomplete';
import { SelectedSuggestionsTags } from './SelectedSuggestionsTags';
import { SuggestionsDropdown } from './SuggestionsDropdown';

interface SearchBoxProps {
  onSubmit?: (query: string) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSubmit }) => {
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
  } = useAutocomplete();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(searchQuery);
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
            aria-label="Search herbarium specimens"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            autoComplete="off"
          />
          {loading && (
            <span className="input-group-text">
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            </span>
          )}
          <button type="submit" className="btn btn-primary">
            Search
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