import express from 'express';

import Bib from './Bib';
import User from './User';
import Hold from './Hold';
import Search from './Search';
import appConfig from '../../app/data/appConfig';
import SubjectHeading from './SubjectHeading';
import SubjectHeadings from './SubjectHeadings';

const router = express.Router();

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

router
  .route(`${appConfig.baseUrl}/api`)
  .get(Search.searchAjax);

router
  .route(`${appConfig.baseUrl}/api/bib`)
  .get(Bib.bibSearchAjax);

router
  .route(`${appConfig.baseUrl}/api/hold/request/:bibId-:itemId`)
  .get(Hold.newHoldRequestAjax);

router
  .route(`${appConfig.baseUrl}/api/patronEligibility`)
  .get(User.eligibility);

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
