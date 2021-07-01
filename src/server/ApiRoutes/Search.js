import {
  isArray as _isArray,
  pick as _pick,
} from 'underscore';
import appConfig from '../../app/data/appConfig';
import {
  getReqParams,
  basicQuery,
  parseServerSelectedFilters,
} from '../../app/utils/utils';
import extractFeatures from '../../app/utils/extractFeatures';
import { buildQueryDataFromForm } from '../../app/utils/advancedSearchUtils';
import nyplApiClient from '../routes/nyplApiClient';
import logger from '../../../logger';
import ResearchNow from './ResearchNow';
import createSelectedFiltersHash from '../../app/utils/createSelectedFiltersHash';
import { searchResultItemsListLimit as itemTableLimit } from '../../app/data/constants';
import {
  addHoldingDefinition,
  addCheckInItems,
  fetchLocationUrls,
  findUrl,
} from './Bib';

const createAPIQuery = basicQuery({
  searchKeywords: '',
  sortBy: 'relevance',
  field: 'all',
  selectedFilters: {},
});

const nyplApiClientCall = (query, urlEnabledFeatures = []) => {
  const requestOptions = appConfig.features.includes('on-site-edd') || urlEnabledFeatures.includes('on-site-edd') ? { headers: { 'X-Features': 'on-site-edd' } } : {};

  return nyplApiClient()
    .then(client =>
      client.get(`/discovery/resources${query}`, requestOptions),
    );
};

function fetchResults(searchKeywords = '', contributor, title, subject, page, sortBy, order, field, filters, cb, errorcb, features) {
  const encodedResultsQueryString = createAPIQuery({
    searchKeywords,
    contributor,
    title,
    subject,
    sortBy: sortBy ? `${sortBy}_${order}` : '',
    selectedFilters: filters,
    field,
    page,
  });
  const encodedAggregationsQueryString = createAPIQuery({
    searchKeywords,
    selectedFilters: filters,
    field,
  });

  const aggregationQuery = `/aggregations?${encodedAggregationsQueryString}`;
  const resultsQuery = `?${encodedResultsQueryString}&per_page=50`;
  const queryObj = {
    query: { q: searchKeywords, sortBy, order, field, filters },
  };

  let drbRequesting = true;
  const drbPromise = appConfig.features.includes('drb-integration') ?
    Promise.race([
      new Promise((resolve) => {
        setTimeout(() => {
          if (drbRequesting) logger.error('Drb timeout');
          return resolve([]);
        }, 5000);
      }),
      ResearchNow.search(queryObj)
        .then((res) => { drbRequesting = false; return res; })
        .catch((e) => {
          drbRequesting = false;
          logger.error('Drb error: ', e);
          return [];
        }),
    ])
    :
    null;

  // Get the following in parallel:
  //  - search results
  //  - aggregations
  //  - drb results
  Promise.all([
    nyplApiClientCall(resultsQuery, features),
    nyplApiClientCall(aggregationQuery, features),
    drbPromise,
  ])
    .then((response) => {
      const [results, aggregations, drbbResults] = response;
      const locationCodes = new Set();
      const { itemListElement } = results;
      if (!itemListElement) {
        return cb(
          aggregations,
          results,
          page,
          drbbResults);
      }
      itemListElement.forEach((resultObj) => {
        const { result } = resultObj;
        const { holdings } = resultObj.result;
        if (!result.items || !result.holdings) return;
        if (holdings) {
          addCheckInItems(result);
          holdings.slice(0, itemTableLimit).forEach((holding) => {
            addHoldingDefinition(holding);
            if (holding.location) locationCodes.add(holding.location[0].code);
          });
          if (holdings.length < itemTableLimit) {
            result.items.slice(0, itemTableLimit - holdings.length).forEach((item) => {
              if (item.holdingLocation) item.holdingLocation.forEach((holdingLocation) => {
                locationCodes.add(holdingLocation['@id']);
              });
            });
          }
        } else if (result.items) {
          result.items.slice(0, itemTableLimit).forEach((item) => {
            if (item.holdingLocation) locationCodes.add(item.holdingLocation[0]['@id']);
          });
        }
      });
      const codes = Array.from(locationCodes).join(',');
      return fetchLocationUrls(codes).then((resp) => {
        itemListElement.forEach((resultObj) => {
          const { result } = resultObj;
          const items = (result.checkInItems || []).concat(result.items);
          items.slice(0, itemTableLimit).forEach((item) => {
            if (!item) return;
            if (item.holdingLocation) item.holdingLocation[0].url = findUrl({ code: item.holdingLocation[0]['@id'] }, resp);
            if (item.location) item.locationUrl = findUrl({code: item.holdingLocationCode }, resp);
          });
        });
        return results;
      })
        .then(processedResults => cb(
          aggregations,
          processedResults,
          page,
          drbbResults))
        .catch((error) => {
          logger.error('Error making server search call in search function', error);
          errorcb(error);
        });
    })
    .catch(console.error);
}

function search(req, res, resolve) {
  const { page, q, contributor, title, subject, sort, order, fieldQuery, filters } = getReqParams(req.query);

  const sortBy = sort.length ? [sort, order].filter(field => field.length).join('_') : 'relevance';

  // If user is making a search for periodicals,
  // add an issuance filter on the serial field and
  // switch field from 'journal_title' to 'title'
  let apiQueryField = fieldQuery;
  const additionalFilters = {};
  if (fieldQuery === 'journal_title') {
    additionalFilters.issuance = ['urn:biblevel:s'];
    apiQueryField = 'title';
  }
  const apiQueryFilters = { ...filters, ...additionalFilters };
  const urlEnabledFeatures = extractFeatures(req.query.features);

  fetchResults(
    q,
    contributor,
    title,
    subject,
    page,
    sort,
    order,
    apiQueryField,
    apiQueryFilters,
    (apiFilters, searchResults, pageQuery, drbbResults) => resolve({
      filters: apiFilters,
      searchResults,
      page: pageQuery,
      drbbResults,
      selectedFilters: createSelectedFiltersHash(filters, apiFilters),
      searchKeywords: q,
      sortBy,
      field: fieldQuery,
      contributor,
      title,
      subject,
    }),
    error => resolve(error),
    urlEnabledFeatures,
  );
}

function searchServerPost(req, res) {
  if (req.body.advancedSearch) {
    return res.redirect(`${appConfig.baseUrl}/search?${createAPIQuery(buildQueryDataFromForm(Object.entries(req.body)))}`);
  }

  const { fieldQuery, q, filters, sortQuery } = getReqParams(req.body);
  const { dateAfter, dateBefore } = req.body;
  // The filters from req.body may be an array of selected filters, or just an object
  // with one selected filter.
  const reqFilters = _isArray(filters) ? filters : [filters];

  const selectedFilters = parseServerSelectedFilters(reqFilters, dateAfter, dateBefore);
  let searchKeywords = q;
  let field = fieldQuery;
  let sortBy = sortQuery;

  if (req.query.q) {
    searchKeywords = req.query.q;
  }

  if (dateAfter && dateBefore) {
    if (Number(dateAfter) > Number(dateBefore)) {
      return res.redirect(`${appConfig.baseUrl}/search?q=${searchKeywords}&` +
        'error=dateFilterError#popup-no-js');
    }
  }

  if (req.query.search_scope) {
    field = req.query.search_scope;
  }
  if (req.query.sort && req.query.sort_direction) {
    sortBy = `${req.query.sort}_${req.query.sort_direction}`;
  }

  const apiQuery = createAPIQuery({
    searchKeywords: encodeURIComponent(searchKeywords),
    selectedFilters,
    field,
    sortBy,
  });

  return res.redirect(`${appConfig.baseUrl}/search?${apiQuery}`);
}

export default {
  searchServerPost,
  search,
};
