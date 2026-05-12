import React from 'react';
import { TermsFacetConfig, FacetBucket } from '@/types/facets';
import { useFacetAutocomplete } from '@hooks/useFacetAutocomplete';

interface TermsFacetPanelProps {
  config: TermsFacetConfig;
  selectedValues: string[];
  buckets: FacetBucket[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  onClearAll: () => void;
}

/**
 * Generic terms facet panel.
 * Renders an optional autocomplete input, selected-value chips, and a
 * clickable bucket list with per-term record counts.
 */
const TermsFacetPanel: React.FC<TermsFacetPanelProps> = ({
  config,
  selectedValues,
  buckets,
  onAdd,
  onRemove,
  onClearAll,
}) => {
  const ac = useFacetAutocomplete(config, onAdd);

  return (
    <div className="facet-panel">
      {/* Header */}
      <div className="facet-panel__header">
        <h5 className="facet-panel__title">{config.label}</h5>
        {selectedValues.length > 0 && (
          <span className={`badge ${config.badgeClass}`}>{selectedValues.length}</span>
        )}
      </div>

      {/* Autocomplete input (only for facets that have a suggester) */}
      {config.hasAutocomplete && (
        <div className="facet-autocomplete" ref={ac.dropdownRef}>
          <div className="input-group input-group-sm">
            <input
              ref={ac.inputRef}
              type="text"
              className="form-control"
              placeholder={`Add ${config.label.toLowerCase()}…`}
              value={ac.query}
              onChange={ac.handleInputChange}
              onKeyDown={ac.handleKeyDown}
              autoComplete="off"
              aria-label={`Search ${config.label}`}
              aria-autocomplete="list"
              aria-expanded={ac.showDropdown}
            />
            {ac.loading && (
              <span className="input-group-text">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              </span>
            )}
          </div>

          {/* Suggestions dropdown */}
          {ac.showDropdown && ac.suggestions.length > 0 && (
            <ul className="facet-autocomplete__dropdown" role="listbox">
              {ac.suggestions.map((s, idx) => (
                <li
                  key={`${config.key}-sug-${idx}`}
                  className={`facet-autocomplete__item${idx === ac.highlightedIndex ? ' is-highlighted' : ''}`}
                  role="option"
                  aria-selected={idx === ac.highlightedIndex}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent input blur before click fires
                    ac.selectSuggestion(s);
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: s.term }} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected value chips */}
      {selectedValues.length > 0 && (
        <div className="facet-chips">
          {selectedValues.map((val) => (
            <span key={`chip-${config.key}-${val}`} className={`facet-chip ${config.badgeClass}`}>
              <span className="facet-chip__label">{val}</span>
              <button
                type="button"
                className="btn-close btn-close-white facet-chip__remove"
                aria-label={`Remove ${val}`}
                onClick={() => onRemove(val)}
              />
            </span>
          ))}
          <button
            type="button"
            className="btn btn-link btn-sm facet-chips__clear p-0"
            onClick={onClearAll}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Bucket list */}
      {buckets.length > 0 ? (
        <ul className="facet-bucket-list">
          {buckets.map((bucket) => {
            const isSelected = selectedValues.includes(bucket.value);
            return (
              <li key={`bucket-${config.key}-${bucket.value}`}>
                <button
                  type="button"
                  className={`facet-bucket-item${isSelected ? ' is-selected' : ''}`}
                  onClick={() => (isSelected ? onRemove(bucket.value) : onAdd(bucket.value))}
                  title={bucket.value}
                >
                  <span className="facet-bucket-item__label">{bucket.value}</span>
                  <span className={`facet-bucket-item__count badge ${isSelected ? 'bg-light text-dark' : 'bg-secondary'}`}>
                    {bucket.count.toLocaleString()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="facet-panel__empty">No options available</p>
      )}
    </div>
  );
};

export default TermsFacetPanel;
