import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="container">
        <nav className="navbar navbar-expand-lg">
          <Link className="navbar-brand" to="/">
            HerbCol
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/*<li className="nav-item">*/}
              {/*  <Link*/}
              {/*    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}*/}
              {/*    to="/"*/}
              {/*  >*/}
              {/*    Home*/}
              {/*  </Link>*/}
              {/*</li>*/}

            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
