import React from 'react';

import { IndexRoute, Route, Redirect } from 'react-router';

/*
 * Pages
 */
import BibPage from '../pages/BibPage';
import Home from '../pages/Home';
import ElectronicDelivery from '../pages/ElectronicDelivery';
import HoldRequest from '../pages/HoldRequest';
import SearchResults from '../pages/SearchResultsPage';
import SubjectHeadingShowPage from '../pages/SubjectHeadingShowPage';
import SubjectHeadingsIndexPage from '../pages/SubjectHeadingsIndexPage';
import HoldConfirmation from '../pages/HoldConfirmation';
import AccountPage from '../pages/AccountPage';
import AdvancedSearch from '../components/AdvancedSearch/AdvancedSearch';

/*
 * Components
 */
import Application from '../components/Application/Application';
import NotFound404 from '../components/NotFound404/NotFound404';
import Redirect404 from '../components/Redirect404/Redirect404';
import AccountError from '../components/AccountError/AccountError';

import appConfig from '../data/appConfig';

const { baseUrl } = appConfig;
const routes = {
  // Routes used in the Express server:
  server: (
    <Route path="/" component={Application}>
      <IndexRoute component={Home} />
      <Route path="/search/advanced" component={AdvancedSearch} />
      <Route path="/search" component={SearchResults} />
      <Route path="/bib/:bibId" component={BibPage} />
      <Route path="/bib/:bibId/all" component={BibPage} />
      <Route path="/hold/request/:bibId-:itemId" component={HoldRequest} />
      <Route path="/hold/request/:bibId-:itemId/edd" component={ElectronicDelivery} />
      <Route path="/hold/confirmation/:bibId-:itemId" component={HoldConfirmation} />
      <Route path="/subject_headings/:subjectHeadingUuid" component={SubjectHeadingShowPage} />
      <Route path="/subject_headings" component={SubjectHeadingsIndexPage} />
      <Route path="/account(/:content)" component={AccountPage} />
      <Route path="/accountError" component={AccountError} />
      <Route path="/404/redirect" component={Redirect404} />
      <Route path="/404" component={NotFound404} />
      <Redirect from="*" to="/404" />
    </Route>
  ),
  // Routes used in the client-side React-Router:
  client: (
    <Route path={`${baseUrl}/`} component={Application}>
      <IndexRoute component={Home} />
      <Route path={`${baseUrl}/search/advanced`} component={AdvancedSearch} />
      <Route path={`${baseUrl}/search`} component={SearchResults} />
      <Route path={`${baseUrl}/bib/:bibId`} component={BibPage} />
      <Route path={`${baseUrl}/bib/:bibId/all`} component={BibPage} />
      <Route path={`${baseUrl}/hold/request/:bibId-:itemId`} component={HoldRequest} />
      <Route path={`${baseUrl}/hold/request/:bibId-:itemId/edd`} component={ElectronicDelivery} />
      <Route path={`${baseUrl}/hold/confirmation/:bibId-:itemId`} component={HoldConfirmation} />
      <Route path={`${baseUrl}/subject_headings/:subjectHeadingUuid`} component={SubjectHeadingShowPage} />
      <Route path={`${baseUrl}/subject_headings`} component={SubjectHeadingsIndexPage} />
      <Route path={`${baseUrl}/account(/:content)`} component={AccountPage} />
      <Route path={`${baseUrl}/accountError`} component={AccountError} />
      <Route path={`${baseUrl}/404/redirect`} component={Redirect404} />
      <Route path={`${baseUrl}/404`} component={NotFound404} />
      <Redirect from="*" to={`${baseUrl}/404`} />
    </Route>
  ),
};

export default routes;
