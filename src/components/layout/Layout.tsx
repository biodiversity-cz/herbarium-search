import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * Root layout wrapper.
 * On the index page the hero section sits directly under the transparent fixed header,
 * so we skip the top-padding offset there. All other pages get the header-height offset.
 */
const Layout: React.FC = () => {
  const location = useLocation();
  const isIndex = location.pathname === '/';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      {/* Push content below the fixed header on non-index pages */}
      <main className={`flex-grow-1${isIndex ? '' : ' page-content-offset'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
