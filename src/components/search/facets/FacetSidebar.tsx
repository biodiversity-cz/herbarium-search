import React from 'react';
import {
  FACET_CONFIG,
  FacetBuckets,
  RangeBuckets,
  SelectedFacetValues,
  SelectedDateRanges,
  DateRangeSelection,
  FacetKey,
  countActiveFilters,
  hasActiveFilters,
  TermsFacetConfig,
  DateRangeFacetConfig,
} from '@/types/facets';
import TermsFacetPanel from './TermsFacetPanel';
import DateRangeFacetPanel from './DateRangeFacetPanel';

interface FacetSidebarProps {
  selectedFacets: SelectedFacetValues;
  selectedDateRanges: SelectedDateRanges;
  facetBuckets: FacetBuckets;
  rangeBuckets: RangeBuckets;
  onAdd: (key: FacetKey, value: string) => void;
  onRemove: (key: FacetKey, value: string) => void;
  onClearFacet: (key: FacetKey) => void;
  onDateRangeChange: (key: FacetKey, range: DateRangeSelection) => void;
  onDateRangeClear: (key: FacetKey) => void;
  onClearAll: () => void;
}

/**
 * Sidebar that renders all enabled facets from the FACET_CONFIG registry.
 * Adding a new facet only requires updating the registry – no changes here.
 */
const FacetSidebar: React.FC<FacetSidebarProps> = ({
  selectedFacets,
  selectedDateRanges,
  facetBuckets,
  rangeBuckets,
  onAdd,
  onRemove,
  onClearFacet,
  onDateRangeChange,
  onDateRangeClear,
  onClearAll,
}) => {
  const totalActive = countActiveFilters(selectedFacets, selectedDateRanges);
  const anyActive = hasActiveFilters(selectedFacets, selectedDateRanges);
  const enabledFacets = FACET_CONFIG.filter((c) => c.enabled);

  return (
    <aside className="facets-sidebar" aria-label="Filter results">
      <div className="facets-sidebar__card card">
        <div className="card-body">
          <div className="facets-sidebar__header">
            <h4 className="facets-sidebar__heading">Filter Results</h4>
            {anyActive && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClearAll}
                aria-label="Clear all filters"
              >
                Clear all ({totalActive})
              </button>
            )}
          </div>

          {enabledFacets.map((cfg) => {
            if (cfg.type === 'terms') {
              return (
                <TermsFacetPanel
                  key={cfg.key}
                  config={cfg as TermsFacetConfig}
                  selectedValues={selectedFacets[cfg.key] ?? []}
                  buckets={facetBuckets[cfg.key] ?? []}
                  onAdd={(val) => onAdd(cfg.key, val)}
                  onRemove={(val) => onRemove(cfg.key, val)}
                  onClearAll={() => onClearFacet(cfg.key)}
                />
              );
            }

            if (cfg.type === 'dateRange') {
              return (
                <DateRangeFacetPanel
                  key={cfg.key}
                  config={cfg as DateRangeFacetConfig}
                  selection={selectedDateRanges[cfg.key] ?? {}}
                  buckets={rangeBuckets[cfg.key] ?? []}
                  onChange={(range) => onDateRangeChange(cfg.key, range)}
                  onClear={() => onDateRangeClear(cfg.key)}
                />
              );
            }

            // numericRange: placeholder for future implementation
            return null;
          })}
        </div>
      </div>
    </aside>
  );
};

export default FacetSidebar;
