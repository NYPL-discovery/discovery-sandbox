import Actions from '@Actions';
import { ajaxCall } from '@utils';
import appConfig from '@appConfig';
import Store from '@Store';

const pathInstructions = [
  {
    expression: /\/research\/collections\/shared-collection-catalog\/bib\/([cp]?b\d*)/,
    pathType: 'bib',
  },
  {
    expression: /\/research\/collections\/shared-collection-catalog\/search\?(.*)/,
    pathType: 'search',
  },
  {
    expression: /\/research\/collections\/shared-collection-catalog\/hold\/request\/([^/]*)/,
    pathType: 'holdRequest',
  },
];

const routesGenerator = (location, next) => ({
  bib: {
    apiRoute: matchData => `${next ? 'http://localhost:3001' : ''}${appConfig.baseUrl}/api/bib?bibId=${matchData[1]}`,
    actions: [Actions.updateBib],
    errorMessage: 'Error attempting to make an ajax request to fetch a bib record from ResultsList',
  },
  search: {
    apiRoute: matchData => `${next ? 'http://localhost:3001' : ''}${appConfig.baseUrl}/api?${matchData[1]}`,
    actions: [
      data => Actions.updateSearchResults(data.searchResults),
      () => Actions.updatePage(location.query.page || 1),
      () => Actions.updateSearchKeywords(location.query.q),
      data => Actions.updateFilters(data.filters),
      () => {
        const {
          sort,
          sort_direction,
        } = location.query;
        Actions.updateSortBy(`${sort}_${sort_direction}`);
      },
    ],
    errorMessage: 'Error attempting to make an ajax request to search',
  },
  holdRequest: {
    apiRoute: matchData => `${next ? 'http://localhost:3001' : ''}${appConfig.baseUrl}/api/hold/request/${matchData[1]}`,
    actions: [
      data => Actions.updateBib(data.bib),
      data => Actions.updateDeliveryLocations(data.deliveryLocations),
      data => Actions.updateIsEddRequestable(data.isEddRequestable),
    ],
    errorMessage: 'Error attempting to make ajax request for hold request',
  },
});

const reducePathExpressions = location => (acc, instruction) => {
  const {
    pathname,
    search,
  } = location;

  const {
    matchData,
    pathType,
  } = acc;

  const newMatchData = (pathname + search).match(instruction.expression);
  return {
    matchData: matchData || newMatchData,
    pathType: pathType || (newMatchData ? instruction.pathType : null),
  };
};

function loadDataForRoutes(location, next) {
  const routes = routesGenerator(location, next);
  const {
    matchData,
    pathType,
  } = pathInstructions
    .reduce(reducePathExpressions(location), { matchData: null, pathType: null });

  if (routes[pathType]) {
    const {
      apiRoute,
      actions,
      errorMessage,
    } = routes[pathType];
    Actions.updateLoadingStatus(true);
    return ajaxCall(apiRoute(matchData),
      (response) => {
        actions.forEach(action => action(response.data));
        Actions.updateLoadingStatus(false);
      },
      (error) => {
        Actions.updateLoadingStatus(false);
        console.error(
          errorMessage,
          error,
        );
      },
    );
  }

  return new Promise(resolve => resolve());
}

export default loadDataForRoutes;
