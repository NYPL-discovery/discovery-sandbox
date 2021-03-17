import React from 'react';
import DocumentTitle from 'react-document-title';
import { Link } from 'react-router';

import appConfig from '../../data/appConfig';

const NotFound404 = () => (
  <DocumentTitle title={`404 | ${appConfig.displayTitle} | NYPL`}>
    <main id="mainContent" className="not-found-404">
      <div className="nypl-full-width-wrapper">
        <div className="nypl-row">
          <div className="nypl-column-three-quarters">
            <h1>404 Not Found</h1>
            <p>We're sorry...</p>
            <p>The page you were looking for doesn't exist.</p>
            <p>
              Search the <Link to={`${appConfig.baseUrl}/`}>
              {appConfig.displayTitle}</Link> or our <a href={appConfig.legacyCatalog}>
              Legacy Catalog</a> for research materials.</p>
          </div>
        </div>
      </div>
    </main>
  </DocumentTitle>
);

export default NotFound404;
