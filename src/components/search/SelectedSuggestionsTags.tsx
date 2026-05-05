import React from 'react';
import { SuggestionOption } from '@hooks/useAutocomplete';

interface SelectedSuggestionsTagsProps {
  selectedSuggestions: SuggestionOption[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
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

export const SelectedSuggestionsTags: React.FC<SelectedSuggestionsTagsProps> = ({
  selectedSuggestions,
  onRemove,
  onClearAll,
}) => {
  const cleanTerm = (term: string): string => term.replace(/<\/?b>/g, '');

  return (
    <div className="selected-tags mb-2">
      {selectedSuggestions.map((selection, index) => (
        <span
          key={`${selection.type}-${selection.term}-${index}`}
          className={`badge me-1 mb-1 d-inline-flex align-items-center ${getBadgeColor(selection.type)}`}
        >
          <span className="me-1">{getCategoryLabel(selection.type)}</span>
          <span>{cleanTerm(selection.term)}</span>
          <button
            type="button"
            className="btn-close btn-close-white ms-1 p-0"
            style={{ fontSize: '0.6rem', lineHeight: 1 }}
            onClick={() => onRemove(index)}
            aria-label="Remove"
          />
        </span>
      ))}
      <button
        type="button"
        className="btn btn-sm btn-link text-decoration-none p-0 ms-2"
        onClick={onClearAll}
      >
        Clear all
      </button>
    </div>
  );
};