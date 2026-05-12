import React, { useState, useEffect } from 'react';
import { DateRangeFacetConfig, FacetBucket, DateRangeSelection } from '@/types/facets';

interface DateRangeFacetPanelProps {
  config: DateRangeFacetConfig;
  selection: DateRangeSelection;
  buckets: FacetBucket[];
  onChange: (range: DateRangeSelection) => void;
  onClear: () => void;
}

/**
 * Date range facet panel.
 *
 * Shows:
 *  - A bar chart of decade/year buckets (click to set from/to)
 *  - Two year inputs for manual from/to entry
 *  - Active selection chip with clear button
 */
const DateRangeFacetPanel: React.FC<DateRangeFacetPanelProps> = ({
  config,
  selection,
  buckets,
  onChange,
  onClear,
}) => {
  const [fromInput, setFromInput] = useState(selection.from ?? '');
  const [toInput, setToInput] = useState(selection.to ?? '');

  // Keep inputs in sync when selection changes externally (e.g. clear)
  useEffect(() => {
    setFromInput(selection.from ?? '');
    setToInput(selection.to ?? '');
  }, [selection.from, selection.to]);

  const hasSelection = !!(selection.from || selection.to);
  const maxCount = buckets.length > 0 ? Math.max(...buckets.map((b) => b.count)) : 1;

  const applyRange = () => {
    const from = fromInput.trim() || undefined;
    const to = toInput.trim() || undefined;
    if (from || to) {
      onChange({ from, to });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applyRange();
  };

  const handleBucketClick = (bucket: FacetBucket) => {
    // Clicking a bucket sets the range to that decade/year
    const year = parseInt(bucket.value, 10);
    // Determine bucket width from rangeGap (e.g. '+10YEAR' → 10)
    const gapMatch = config.rangeGap.match(/\+(\d+)YEAR/);
    const gapYears = gapMatch ? parseInt(gapMatch[1], 10) : 10;
    onChange({ from: String(year), to: String(year + gapYears - 1) });
  };

  return (
    <div className="facet-panel">
      {/* Header */}
      <div className="facet-panel__header">
        <h5 className="facet-panel__title">{config.label}</h5>
        {hasSelection && (
          <span className={`badge ${config.badgeClass}`}>active</span>
        )}
      </div>

      {/* Active selection chip */}
      {hasSelection && (
        <div className="facet-chips mb-2">
          <span className="facet-chip bg-secondary">
            <span className="facet-chip__label">
              {selection.from ?? '…'} – {selection.to ?? '…'}
            </span>
            <button
              type="button"
              className="btn-close btn-close-white facet-chip__remove"
              aria-label="Clear date range"
              onClick={onClear}
            />
          </span>
        </div>
      )}

      {/* Bar chart of buckets */}
      {buckets.length > 0 && (
        <div className="date-range-bars" aria-label="Collection date distribution">
          {buckets.map((bucket) => {
            const heightPct = Math.max(4, Math.round((bucket.count / maxCount) * 100));
            const isInRange =
              hasSelection &&
              (!selection.from || bucket.value >= selection.from) &&
              (!selection.to || bucket.value <= selection.to);
            return (
              <button
                key={bucket.value}
                type="button"
                className={`date-range-bar${isInRange ? ' is-selected' : ''}`}
                style={{ height: `${heightPct}%` }}
                title={`${bucket.value}: ${bucket.count.toLocaleString()} specimens`}
                onClick={() => handleBucketClick(bucket)}
                aria-label={`${bucket.value}: ${bucket.count} specimens`}
              />
            );
          })}
        </div>
      )}

      {/* Year inputs */}
      <div className="date-range-inputs">
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="From year"
          value={fromInput}
          min="1700"
          max="2026"
          onChange={(e) => setFromInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="From year"
        />
        <span className="date-range-inputs__sep">–</span>
        <input
          type="number"
          className="form-control form-control-sm"
          placeholder="To year"
          value={toInput}
          min="1700"
          max="2026"
          onChange={(e) => setToInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="To year"
        />
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={applyRange}
          disabled={!fromInput && !toInput}
          aria-label="Apply date range"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateRangeFacetPanel;
