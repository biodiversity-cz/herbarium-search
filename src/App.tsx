import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import IndexPage from '@pages/IndexPage';
import SearchPage from '@pages/SearchPage';
import DetailPage from '@pages/DetailPage';
import ApiDocPage from "@pages/ApiDocPage.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="detail/:id" element={<DetailPage />} />
          <Route path="apidoc" element={<ApiDocPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
