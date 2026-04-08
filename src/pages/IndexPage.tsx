import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IndexPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="index-page">
      <div className="container">
        <div className="index-content">
          <h1>Herbarium Repository</h1>
          <p className="lead">
            Search through our comprehensive collection of herbarium specimens
          </p>
          
          <form onSubmit={handleSearch} className="search-box mt-4">
            <div className="input-group input-group-lg mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search by scientific name, family, collector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search herbarium specimens"
              />
            </div>
            <div className="d-flex gap-2 justify-content-center">
              <button type="submit" className="btn btn-primary btn-lg">
                Search
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-lg"
                onClick={() => navigate('/search')}
              >
                Advanced Search
              </button>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-muted">
              <strong>Quick Tips:</strong> Use scientific names for best results. 
              Try searching for families like "Asteraceae" or "Fagaceae".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
