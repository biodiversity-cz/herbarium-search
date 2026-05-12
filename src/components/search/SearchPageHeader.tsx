import React from 'react';
import { Link } from 'react-router-dom';

interface SearchPageHeaderProps {
  query: string;
  totalResults: number;
  loading: boolean;
}

/**
 * Top banner for the search page showing the active query and result count.
 */
const SearchPageHeader: React.FC<SearchPageHeaderProps> = ({ query, totalResults, loading }) => {
  return (
    <div className="search-header">
      <div className="container">
        <div className="search-header__inner">
          <div>
            <h1 className="search-header__title">Search Results</h1>
            {!loading && (
              <p className="search-header__meta mb-0">
                <strong>{totalResults.toLocaleString()}</strong>{' '}
                {totalResults === 1 ? 'specimen' : 'specimens'} found
                {query && query !== '*:*' && (
                  <span className="ms-2 text-white-50">
                    for <em>&ldquo;{query}&rdquo;</em>
                  </span>
                )}
              </p>
            )}
          </div>
          <Link to="/" className="btn btn-outline-light btn-sm">
            ← New search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchPageHeader;
