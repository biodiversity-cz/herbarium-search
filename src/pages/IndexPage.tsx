import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBox, SuggestionOption } from '@components/search/SearchBox';

const IndexPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string, selectedSuggestions: SuggestionOption[]) => {
    const params = new URLSearchParams();
    
    // Add main search query if present
    if (query.trim()) {
      params.set('q', query.trim());
    }
    
    // Add selected suggestions as preset filters
    selectedSuggestions.forEach((suggestion) => {
      if (suggestion.type === 'taxon') {
        const cleanTerm = suggestion.term.replace(/<\/?b>/g, '');
        params.append('taxon', cleanTerm);
      } else if (suggestion.type === 'collector') {
        const cleanTerm = suggestion.term.replace(/<\/?b>/g, '');
        params.append('collector', cleanTerm);
      } else if (suggestion.type === 'locality') {
        const cleanTerm = suggestion.term.replace(/<\/?b>/g, '');
        params.append('locality', cleanTerm);
      }
    });
    
    const queryString = params.toString();
    navigate(`/search?${queryString}`);
  };

  return (
    <div className="index-page">
      <div className="container">
        <div className="index-content">
          <h1>Herbarium Repository</h1>
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