import express from 'express';

import Bib from './Bib.js';
import Hold from './Hold.js';
import Search from './Search.js';

const router = express.Router();

function MainApp(req, res, next) {
  res.locals.data.Store = {
    searchResults: {},
    selectedFacets: {},
    searchKeywords: '',
    facets: {},
    page: '1',
    sortBy: 'relevance',
    field: 'all',
    error: {},
  };

  next();
}

router
  .route('/search')
  .get(Search.searchServer)
  .post(Search.searchServerPost);

router
  .route('/advanced')
  .get(Search.searchServer);

router
  .route('/hold/request/:bibId-:itemId')
  .get(Hold.newHoldRequestServer)
  .post(Hold.createHoldRequestServer);

router
  .route('/hold/request/:bibId-:itemId/edd')
  .get(Hold.newHoldRequestServerEdd);

router
  .route('/hold/confirmation/:bibId-:itemId')
  .get(Hold.confirmRequestServer);

router
  .route('/bib/:bibId')
  .get(Bib.bibSearchServer);

router
  .route('/bib/:bibId/all')
  .get(Bib.bibSearchServer);

router
  .route('/edd')
  .post(Hold.eddServer);

router
  .route('/api')
  .get(Search.searchAjax);

router
  .route('/api/bib')
  .get(Bib.bibSearchAjax);

router
  .route('/api/hold/request/:bibId-:itemId')
  .get(Hold.newHoldRequestAjax);

router
  .route('/api/newHold')
  .get(Hold.createHoldRequestAjax)
  .post(Hold.createHoldRequestAjaxPost);

router
  .route('/')
  .get(MainApp);

export default router;
