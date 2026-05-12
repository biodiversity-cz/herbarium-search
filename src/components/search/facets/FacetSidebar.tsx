import React from 'react';
import {
  FACET_CONFIG,
  FacetBuckets,
  SelectedFacetValues,
  FacetKey,
  countActiveFilters,
  hasActiveFilters,
  TermsFacetConfig,
} from '@/types/facets';
import TermsFacetPanel from './TermsFacetPanel';

interface FacetSidebarProps {
  selectedFacets: SelectedFacetValues;
  facetBuckets: FacetBuckets;
  onAdd: (key: FacetKey, value: string) => void;
  onRemove: (key: FacetKey, value: string) => void;
  onClearFacet: (key: FacetKey) => void;
  onClearAll: () => void;
}

/**
 * Sidebar that renders all enabled facets from the FACET_CONFIG registry.
 * Adding a new facet only requires updating the registry – no changes here.
 */
const FacetSidebar: React.FC<FacetSidebarProps> = ({
  selectedFacets,
  facetBuckets,
  onAdd,
  onRemove,
  onClearFacet,
  onClearAll,
}) => {
  const totalActive = countActiveFilters(selectedFacets);
  const anyActive = hasActiveFilters(selectedFacets);

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
            const selected = selectedFacets[cfg.key] ?? [];
            const buckets = facetBuckets[cfg.key] ?? [];

            if (cfg.type === 'terms') {
              return (
                <TermsFacetPanel
                  key={cfg.key}
                  config={cfg as TermsFacetConfig}
                  selectedValues={selected}
                  buckets={buckets}
                  onAdd={(val) => onAdd(cfg.key, val)}
                  onRemove={(val) => onRemove(cfg.key, val)}
                  onClearAll={() => onClearFacet(cfg.key)}
                />
              );
            }

            // Placeholder for future range facets
            // if (cfg.type === 'dateRange') return <DateRangeFacetPanel key={cfg.key} ... />;
            // if (cfg.type === 'numericRange') return <NumericRangeFacetPanel key={cfg.key} ... />;

            return null;
          })}
        </div>
      </div>
    </aside>
  );
};

export default FacetSidebar;
