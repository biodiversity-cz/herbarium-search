import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEARCH_STATE_STORAGE_KEY } from '@/types/suggestion';

interface SearchPageHeaderProps {
  query: string;
  totalResults: number;
  loading: boolean;
}

/**
 * Top banner for the search page showing the active query and result count.
 */
const SearchPageHeader: React.FC<SearchPageHeaderProps> = ({ query, totalResults, loading }) => {
  const navigate = useNavigate();

  const handleNewSearch = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Clear session stored search state
    try {
      sessionStorage.removeItem(SEARCH_STATE_STORAGE_KEY);
    } catch {
      // sessionStorage not available – silently ignore
    }
    
    // Navigate to home page
    navigate('/');
  };

  return (
    <div className="search-header">
      <div className="container">
        <div className="search-header__inner">
          <div>
            <h1 className="search-header__title">Search Results</h1>
            {!loading && (
              <p className="search-header__meta mb-0">
                <strong>{totalResults.toLocaleString()}</strong>{' '}
                {totalResults === 1 ? 'image' : 'images'} found
                {query && query !== '*:*' && (
                  <span className="ms-2 text-white-50">
                    for <em>&ldquo;{query}&rdquo;</em>
                  </span>
                )}
              </p>
            )}
          </div>
          <Link to="/" className="btn btn-outline-light btn-sm" onClick={handleNewSearch}>
            ← New search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchPageHeader;
