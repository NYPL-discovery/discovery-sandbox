import express from 'express';

import User from './User';
import Hold from './Hold';
import Search from './Search';
import Bib from './Bib';
import appConfig from '../../app/data/appConfig';
import SubjectHeading from './SubjectHeading';
import SubjectHeadings from './SubjectHeadings';
import dataLoaderUtil from '../../app/utils/dataLoaderUtil';
import routeMethods from './RouteMethods';

const router = express.Router();
const pathInstructions = dataLoaderUtil.pathInstructions;

router
  .route(`${appConfig.baseUrl}/search`)
  .post(Search.searchServerPost);

router
  .route(`${appConfig.baseUrl}/hold/request/:bibId-:itemId-:itemSource`)
  .post(Hold.createHoldRequestServer);

router
  .route(`${appConfig.baseUrl}/hold/request/:bibId-:itemId/edd`)
  .get(Hold.newHoldRequestServerEdd);

router
  .route(`${appConfig.baseUrl}/hold/confirmation/:bibId-:itemId`)
  .get(Hold.confirmRequestServer);

router
  .route(`${appConfig.baseUrl}/edd`)
  .post(Hold.eddServer);

pathInstructions.forEach(({ expression, pathType }) => {
  router
    .route(`${appConfig.baseUrl}/api/${expression}`)
    .get(routeMethods[pathType]);

  router
    .route(`${appConfig.baseUrl}/${expression}`)
    .get((req, res, next) => {
      req.prevParams = req.params;
      next();
    });
});

router
  .route(`${appConfig.baseUrl}/api/patronEligibility`)
  .get(User.eligibility);

router
  .route(`${appConfig.baseUrl}/api/newHold`)
  .get(Hold.createHoldRequestAjax)
  .post(Hold.createHoldRequestEdd);

router
  .route(`${appConfig.baseUrl}/api/subjectHeading/:subjectLiteral/`)
  .get(SubjectHeading.bibsAjax);
/**
 * This wildcard route proxies the following SHEP API routes:
 *  * /api/subjectHeadings/{UUID}/context => /api/v0.1/subject_headings/{UUID}/context
 *  * /api/subjectHeadings/{UUID}/bibs => /api/v0.1/subject_headings/{UUID}/bibs
 *  * /api/subjectHeadings/{UUID}/related => /api/v0.1/subject_headings/{UUID}/related
 */

router
  .route(`${appConfig.baseUrl}/api/subjectHeadings*`)
  .get(SubjectHeadings.proxyRequest);

export default router;
