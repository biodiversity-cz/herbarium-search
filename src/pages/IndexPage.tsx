import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SuggestionOption } from '@components/search/SearchBox';
import HeroSection from '@components/index/HeroSection';
import ProjectInfoSection from '@components/index/ProjectInfoSection';

/**
 * Home / landing page.
 *
 * Structure:
 *  1. HeroSection  – full-viewport search area (persists taxon/collector/locality selections)
 *  2. ProjectInfoSection – stats, about text, features, partners (below the fold)
 */
const IndexPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string, selectedSuggestions: SuggestionOption[]) => {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('q', query.trim());
    }

    selectedSuggestions.forEach((suggestion) => {
      const cleanTerm = suggestion.term.replace(/<\/?b>/g, '');
      if (suggestion.type === 'taxon') {
        params.append('taxon', cleanTerm);
      } else if (suggestion.type === 'collector') {
        params.append('collector', cleanTerm);
      } else if (suggestion.type === 'locality') {
        params.append('locality', cleanTerm);
      }
    });

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="index-page">
      <HeroSection onSearch={handleSearch} />
      <ProjectInfoSection />
    </div>
  );
};

export default IndexPage;
