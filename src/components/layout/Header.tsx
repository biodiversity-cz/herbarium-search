import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Fixed top navigation bar.
 * Becomes opaque once the user scrolls past the hero section.
 */
const Header: React.FC = () => {
  const location = useLocation();
  const isIndex = location.pathname === '/';
  const [scrolled, setScrolled] = useState(!isIndex);

  useEffect(() => {
    if (!isIndex) {
      setScrolled(true);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // initialise
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isIndex]);

  // Reset when navigating back to index
  useEffect(() => {
    if (isIndex) {
      setScrolled(window.scrollY > 60);
    } else {
      setScrolled(true);
    }
  }, [isIndex]);

  return (
    <header className={`app-header${scrolled ? ' app-header--scrolled' : ''}`}>
      <div className="container-fluid">
        {/* Unified gradient background spanning both logos */}
        <div className="logos-gradient-overlay" />

        <nav className="navbar navbar-expand-lg" aria-label="Main navigation">
          {/* Brand / logo */}
          <Link className="navbar-brand" to="/">
            <img src="/assets/logo.png" alt="HerbCol" className="brand-logo" />
          </Link>

          <a
              href="https://eosc.cz"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-brand"
              aria-label="EOSC CZ - opens in new tab"
          >
            <img src="/assets/eosc-logo.png" alt="EOSC CZ" className="eosc-logo" />
          </a>
          {/* Mobile toggler */}
          <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          {/* Nav links (currently minimal – extend as needed) */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto text-sm-end">
              {/* Placeholder nav items – uncomment / extend when pages are ready */}
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <a
                    href="https://biodiversity-cz.github.io/herbarium-documentation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    aria-label="Documentation"
                >
                  Docs
                </a>
              </li>
              <li className="nav-item">
                <a
                    href="https://herbarium.biodiversity.cz/home/contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    aria-label="Contacts"
                >
                  Contacts
                </a>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${location.pathname === '/apidoc' ? 'active' : ''}`} to="/apidoc">
                  Api
                </Link>
              </li>
              <li className="nav-item">
                <a
                    href="https://herbarium.biodiversity.cz/sign/in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link"
                    aria-label="Admin interface for curators"
                >
                  Sign in
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
