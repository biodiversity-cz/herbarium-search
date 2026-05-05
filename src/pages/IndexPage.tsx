import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBox } from '@components/search/SearchBox';

const IndexPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="index-page">
      <div className="container">
        <div className="index-content">
          <p className="lead">
            Czech Repository of Herbarium Specimen Images: search through our comprehensive collection of digitalised herbarium specimens
          </p>
          <SearchBox onSubmit={handleSearch} />
           <div className="mt-5">
            <p className="text-muted">
              <strong>Quick Tip:</strong> Start typing. You can add multiple suggestions by selecting from the autocomplete dropdown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;