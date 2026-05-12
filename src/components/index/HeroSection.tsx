import React from 'react';
import { SearchBox, SuggestionOption } from '@components/search/SearchBox';

interface HeroSectionProps {
  onSearch: (query: string, selectedSuggestions: SuggestionOption[]) => void;
}

/**
 * Full-viewport hero section with the main search box.
 * Selected suggestions are persisted across page refreshes via sessionStorage.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  return (
    <section className="hero-section" aria-label="Herbarium search">
      <div className="hero-overlay" />
      <div className="hero-content container">
        <div className="hero-text">
          <h1 className="hero-title">Herbarium Repository</h1>
          <p className="hero-subtitle">
            Czech Repository of Herbarium Specimen Images — search through our comprehensive
            collection of digitalised herbarium specimens
          </p>
        </div>

        <div className="hero-search-wrapper">
          <SearchBox onSubmit={onSearch} persist />
          <p className="hero-hint mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1" aria-hidden="true">
              <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
            </svg>
            Start typing to get suggestions — select multiple taxa, collectors, or localities
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
