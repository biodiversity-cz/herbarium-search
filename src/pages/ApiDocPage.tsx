import React from 'react';
import SwaggerUI from 'swagger-ui-react';

import 'swagger-ui-react/swagger-ui.css';

/**
 * API Swagger page.
 */
const ApiDocPage: React.FC = () => {
  return (
      <div style={{ height: '100vh' }}>
        <SwaggerUI url="https://herbarium.biodiversity.cz/api/public/v1/openapi/meta" />
      </div>
  );
};

export default ApiDocPage;