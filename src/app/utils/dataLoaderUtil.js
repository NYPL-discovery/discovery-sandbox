/* global window */
import { ajaxCall } from '@utils';
import {
  updateBibPage,
  updateSearchResultsPage,
  updateHoldRequestPage,
  resetState,
  updateLastLoaded,
  updateAccountPage,
} from '@Actions';
import appConfig from '@appConfig';
import { updateLoadingStatus } from '../actions/Actions';

const baseUrl = appConfig.baseUrl;

// For each named route type, we need to know what path corresponds to that route,
// which action to use to load that data when it is received, and which params
// are required in the relevant routes.
// Note that the path is used in two places: 1. Frontend routes and 2. ApiRoutes, and
// the only difference is the addition of /api/ in the route.

const routes = {
  bib: {
    action: updateBibPage,
    path: 'bib',
    params: '/:bibId',
  },
  search: {
    action: updateSearchResultsPage,
    path: 'search',
    params: '',
  },
  holdRequest: {
    action: updateHoldRequestPage,
    path: 'hold/request',
    params: '/:bibId-:itemId',
  },
  account: {
    action: updateAccountPage,
    path: 'account',
    params: '/:content?',
  },
};

// A simple function for loading data into the store. The only reason it is broken
// out separately is because it is used front-end and back-end
const successCb = (pathType, dispatch) => (response) => {
  const { data } = response;
  if (data && data.redirect) {
    if (window) {
      const fullUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
    }
    return { redirect: true };
  }

  dispatch(routes[pathType].action(data));
  return data;
};


// This function is called only on the front end, by the DataLoader, when a location changes.
// Its sole responsibility is to check if any of the configured paths match
// the current location, and if so, make an api call and pass the resulting data
// on. Note that it makes use of the fact that now for every frontend route, the
// corresponding api route can be found simply by adding /api/

function loadDataForRoutes(location, dispatch) {
  const { pathname, search } = location;
  if (pathname === `${baseUrl}/` || pathname.includes('/account')) {
    dispatch(resetState());
  }

  const matchingPath = Object.entries(routes).find(([pathKey, pathValue]) => {
    const { path } = pathValue;
    return pathname.match(`${baseUrl}/${path}`);
  });

  if (!matchingPath || pathname.match('edd')) return new Promise(() => dispatch(updateLoadingStatus(false)));

  const pathType = matchingPath[0];

  const errorCb = (error) => {
    console.error(
      `Error attempting to make ajax request for ${pathType}`,
      error,
    );
  };

  dispatch(updateLoadingStatus(true));

  const path = `${pathname}${search}`;

  return ajaxCall(
    location.pathname.replace(baseUrl, `${baseUrl}/api`) + location.search,
    successCb(pathType, dispatch),
    errorCb,
  ).then((resp) => {
    if (!resp || (resp && !resp.redirect)) dispatch(updateLastLoaded(path));
    dispatch(updateLoadingStatus(false));
    return resp;
  }).catch((error) => {
    console.error(error);
    dispatch(updateLoadingStatus(false));
  });
}

export default {
  loadDataForRoutes,
  routes,
  successCb,
};
