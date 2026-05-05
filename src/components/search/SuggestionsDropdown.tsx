import React from 'react';
import { SuggestionOption } from '@hooks/useAutocomplete';

interface SuggestionsDropdownProps {
  suggestions: SuggestionOption[];
  highlightedIndex: number;
  onSelect: (suggestion: SuggestionOption) => void;
}

const getBadgeColor = (type: SuggestionOption['type']): string => {
  switch (type) {
    case 'taxon':
      return 'bg-success';
    case 'collector':
      return 'bg-warning';
    case 'locality':
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
};

const getCategoryLabel = (type: SuggestionOption['type']): string => {
  switch (type) {
    case 'taxon':
      return 'taxon:';
    case 'collector':
      return 'collector:';
    case 'locality':
      return 'locality:';
  }
};

export const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  suggestions,
  highlightedIndex,
  onSelect,
}) => {
  return (
    <ul className="autocomplete-dropdown mt-1" role="listbox">
      {suggestions.map((suggestion, index) => (
        <li
          key={`${suggestion.type}-${suggestion.term}-${index}`}
          className={`autocomplete-item ${index === highlightedIndex ? 'highlighted' : ''}`}
          onClick={() => onSelect(suggestion)}
          role="option"
          aria-selected={index === highlightedIndex}
        >
          <span className={`badge me-2 ${getBadgeColor(suggestion.type)}`}>
            {getCategoryLabel(suggestion.type)}
          </span>
          <span
            className="term"
            dangerouslySetInnerHTML={{ __html: suggestion.term }}
          />
        </li>
      ))}
    </ul>
  );
};