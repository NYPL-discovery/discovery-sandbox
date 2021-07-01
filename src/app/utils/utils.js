import { gaUtils } from 'dgx-react-ga';
import axios from 'axios';
import {
  createHistory,
  useQueries,
  createMemoryHistory,
} from 'history';
import {
  mapObject as _mapObject,
  findWhere as _findWhere,
  forEach as _forEach,
  isEmpty as _isEmpty,
  isArray as _isArray,
  extend as _extend,
  chain as _chain,
  flatten as _flatten,
  sortBy as _sortBy,
} from 'underscore';

import appConfig from '../data/appConfig';
import { noticePreferenceMapping } from '../data/constants';

/**
 * ajaxCall
 * Utility function to make ajax requests.
 * @param {string} endpoint The endpoint to call.
 * @param {function} cb The callback function.
 * @param {function} errorcb The error callback function.
 */
const ajaxCall = (
  endpoint,
  cb = () => {},
  errorcb = error => console.error('Error making ajaxCall', error),
) => {
  if (!endpoint) return null;

  return axios
    .get(endpoint)
    .then(cb)
    .catch(errorcb);
};

/**
 * getDefaultFilters
 * Get the default filters needed from the API.
 * @return {object}
 */
const getDefaultFilters = () => _extend({}, appConfig.defaultFilters);

/**
 * createAppHistory
 * Create a history in the browser or server that coincides with react-router.
 */
const createAppHistory = () => {
  if (typeof window !== 'undefined') {
    return useQueries(createHistory)();
  }

  return useQueries(createMemoryHistory)();
};

/**
 * destructureFilters
 * Get filters directly from the URL and parse and combine them into selected filter values.
 * @param {object} filters Filters in the url.
 * @param {object} apiFilters All filters from the API.
 */
function destructureFilters(filters, apiFilters) {
  const selectedFilters = {};
  const filterArrayfromAPI =
    apiFilters && apiFilters.itemListElement && apiFilters.itemListElement.length ?
      apiFilters.itemListElement : [];

  _forEach(filters, (value, key) => {
    const id = key.indexOf('date') !== -1 ?
      // Because filters are in the form of `filters[language][0]`;
      key.substring(8, key.length - 1) : key.substring(8, key.length - 4);

    if (id === 'dateAfter' || id === 'dateBefore') {
      selectedFilters[id] = value;
    } else if (_isArray(value) && value.length) {
      if (!selectedFilters[id]) {
        selectedFilters[id] = [];
      }
      _forEach(value, (filterValue) => {
        const filterObjFromApi = _findWhere(filterArrayfromAPI, { id });
        if (filterObjFromApi && filterObjFromApi.values && filterObjFromApi.values.length) {
          const filter = _findWhere(filterObjFromApi.values, { value: filterValue });
          if (filter) {
            selectedFilters[id].push({
              value: filter.value,
              label: filter.label || filter.value,
            });
          }
        }
      });
    } else if (typeof value === 'string') {
      const filterObjFromApi = _findWhere(filterArrayfromAPI, { id });
      if (filterObjFromApi && filterObjFromApi.values && filterObjFromApi.values.length) {
        const filter = _findWhere(filterObjFromApi.values, { value });
        if (filter) {
          if (!selectedFilters[id]) {
            selectedFilters[id] = [];
          }
          selectedFilters[id].push({
            value: filter.value,
            label: filter.label || filter.value,
          });
        }
      }
    }
  });
  return selectedFilters;
}

/**
 * getSortQuery
 * Get the sort type and order and pass it in URL query form.
 * @param {string} sortBy URL parameter with sort type and order.
 */
const getSortQuery = (sortBy = '') => {
  const reset = sortBy === 'relevance';
  let sortQuery = '';

  if (sortBy && !reset) {
    const [sort, order] = sortBy.split('_');
    sortQuery = `&sort=${sort}&sort_direction=${order}`;
  }

  return sortQuery;
};

/**
 * getFilterParam
 * Get the search params from the filter values.
 * @param {object} filters Key/value pair of filter and the selected value.
 */
const getFilterParam = (filters) => {
  let strSearch = '';

  if (!_isEmpty(filters)) {
    _mapObject(filters, (val, key) => {
      // Property contains an array of its selected filter values:
      if (val && val.length && _isArray(val)) {
        _forEach(val, (filter, index) => {
          if (filter.value && filter.value !== '') {
            strSearch += `&filters[${key}][${index}]=${encodeURIComponent(filter.value)}`;
          } else if (typeof filter === 'string') {
            strSearch += `&filters[${key}][${index}]=${encodeURIComponent(filter)}`;
          }
        });
      } else if (val && val.value && val.value !== '') {
        strSearch += `&filters[${key}]=${encodeURIComponent(val.value)}`;
      } else if (val && typeof val === 'string') {
        strSearch += `&filters[${key}]=${encodeURIComponent(val)}`;
      }
    });
  }

  return strSearch;
};

/**
 * getFieldParam
 * Get the search param from the field selected.
 * @param {string} field Value of field to query against.
 */
const getFieldParam = (field = '') => {
  if (!field || field.trim() === 'all') {
    return '';
  }
  return `&search_scope=${field}`;
};

/**
 * Tracks Google Analytics (GA) events. `.trackEvent` returns a function with
 * 'Discovery' set as the GA Category. `trackDiscovery` will then log the defined
 * actions and labels under the 'Discovery' category.
 * @param {string} action The GA action.
 * @param {string} label The GA label.
 */
const trackDiscovery = gaUtils.trackEvent('Discovery');

/**
 * basicQuery
 * A curry function that will take in the application's props and return a function that will
 * overwrite whatever values it needs to overwrite to create the needed API query.
 * @example
 * const apiQueryFunc = basicQuery(this.props);
 * const apiQuery = apiQueryFunc();
 * // apiQuery === 'q='
 * const apiQuery2 = apiQueryFunc({ page: 3 });
 * // apiQuery2 === 'q=&page=3'
 * const apiQuery3 = apiQueryFunc({ page: 3, q: 'hamlet' });
 * // apiQuery3 === 'q=hamlet&page=3'
 * @param {object} props The application props.
 */
const basicQuery = (props = {}) => {
  return ({
    sortBy,
    field,
    selectedFilters,
    searchKeywords,
    contributor,
    title,
    subject,
    page,
    clearTitle,
    clearSubject,
    clearContributor,
  }) => {
    const sortQuery = getSortQuery(sortBy || props.sortBy);
    const fieldQuery = getFieldParam(field || props.field);
    const filterQuery = getFilterParam(selectedFilters || props.selectedFilters);
    // `searchKeywords` can be an empty string, so check if it's undefined instead.
    const query = searchKeywords !== undefined ? searchKeywords : props.searchKeywords;
    const searchKeywordsQuery = query ? `${encodeURIComponent(query)}` : '';
    let pageQuery = props.page && props.page !== '1' ? `&page=${props.page}` : '';
    pageQuery = page && page !== '1' ? `&page=${page}` : pageQuery;
    pageQuery = page === '1' ? '' : pageQuery;
    const contributorQuery = (contributor || props.contributor) && !clearContributor ? `&contributor=${contributor || props.contributor}` : '';
    const titleQuery = (title || props.title) && !clearTitle ? `&title=${title || props.title}` : '';
    const subjectQuery = (subject || props.subject) && !clearSubject ? `&subject=${subject || props.subject}` : '';
    const advancedQuery = `${contributorQuery}${titleQuery}${subjectQuery}`;

    const completeQuery = `${searchKeywordsQuery}${advancedQuery}${filterQuery}${sortQuery}${fieldQuery}${pageQuery}`;

    return completeQuery ? `q=${completeQuery}` : null;
  };
};

/**
 * getReqParams
 * Read the query param from the request object from Express and returns its value or
 * default values for each. It also returns a string representation of all the selected
 * filters in the url from the `filter` query.
 * @param {object} query The request query object from Express.
 */
function getReqParams(query = {}) {
  const page = query.page || '1';
  const perPage = query.per_page || '50';
  const q = query.q || '';
  const sort = query.sort || '';
  const order = query.sort_direction || '';
  const sortQuery = query.sort_scope || '';
  const fieldQuery = query.search_scope || '';
  const filters = query.filters || {};
  const contributor = query.contributor;
  const title = query.title;
  const subject = query.subject;

  return { page, perPage, q, contributor, title, subject, sort, order, sortQuery, fieldQuery, filters };
}

/*
 * parseServerSelectedFilters(filters)
 * For no-js situations, we need to parse and modify the data structure that is POSTed
 * to the server for filters. The structure is modified to better fit the searching function.
 * The dateAfter and dateBefore are strings which can be added after the data structure is set.
 * Example of data coming in:
 * [ '{"field":"materialType","value":"resourcetypes:txt","count":4298,"label":"Text"}',
 *   '{"field":"owner","value":"orgs:1101","count":580,"label":"General Research Division"}',
 *   '{"field":"language","value":"lang:eng","count":228,"label":"English"}',
 *   '{"field":"language","value":"lang:spa","count":69,"label":"Spanish"}' ]
 *
 * Modified data:
 * { materialType: [ { id: 'resourcetypes:txt', value: 'Text' } ],
 *   owner: [ { id: 'orgs:1101', value: 'General Research Division' } ],
 *   language: [
 *     { id: 'lang:eng', value: 'English' },
 *     { id: 'lang:spa', value: 'Spanish' }
 *   ]
 * }
 * @param {array} filters The selected filters
 * @param {string} dateAfter The filter date to search after.
 * @param {string} dateBefore The filter date to search before.
 * @return {object}
 */
function parseServerSelectedFilters(filters, dateAfter, dateBefore) {
  const selectedFilters = {
    materialType: [],
    language: [],
    dateAfter: {},
    dateBefore: {},
  };

  if (_isArray(filters) && filters.length && !_isEmpty(filters[0])) {
    _chain(filters)
      // Each incoming filter is in JSON string format so it needs to be parsed first.
      .map(filter => JSON.parse(filter))
      // Group selected filters into arrays according to their field.
      .groupBy('field')
      // Created the needed data structure.
      .mapObject((filterArray, key) => {
        if (key) {
          selectedFilters[key] =
            filterArray.map(filter => ({
              value: filter.value,
              label: filter.label,
              count: filter.count,
              selected: true,
            }));
        }
      });
  }

  if (dateAfter) {
    selectedFilters.dateAfter = { id: dateAfter, value: dateAfter };
  }

  if (dateBefore) {
    selectedFilters.dateBefore = { id: dateBefore, value: dateBefore };
  }

  return selectedFilters;
}

/**
 * getAggregatedElectronicResources(items)
 * Get an aggregated array of electronic items from each item if available.
 * @param {array} items
 * @return {object}
 */
function getAggregatedElectronicResources(items = []) {
  if (!items && !items.length) {
    return [];
  }

  const electronicResources = [];

  _forEach(items, (item) => {
    if (item.isElectronicResource) {
      electronicResources.push(item.electronicResources);
    }
  });

  return _flatten(electronicResources);
}

/**
 * getUpdatedFilterValues(props)
 * Get an array of filter values based on one filter. If any filters are selected, they'll
 * be `true` in their object property `selected`.
 * @param {object} props
 * @return {array}
 */
const getUpdatedFilterValues = (props) => {
  const {
    filter,
    selectedFilters,
  } = props;
  const filterValues = filter && filter.values && filter.values.length ? filter.values : [];
  // Just want to add the `selected` property here.
  const defaultFilterValues = filterValues.map(value => _extend({ selected: false }, value));
  let updatedFilterValues = defaultFilterValues;

  // If there are selected filters, then we want to update the filter values with those
  // filters already selected. That way, the checkboxes will be checked.
  if (selectedFilters) {
    updatedFilterValues = defaultFilterValues.map((defaultFilterValue) => {
      const defaultFilter = defaultFilterValue;
      selectedFilters.forEach((selectedFilter) => {
        if (selectedFilter.value === defaultFilter.value) {
          defaultFilter.selected = true;
        }
      });

      return defaultFilter;
    });
  }

  updatedFilterValues = _sortBy(updatedFilterValues, f => f.label);

  return updatedFilterValues;
};

// This function is used in `ResultsCount`, primarily.
/*
   * displayContext({ searchKeywords, selectedFilters, field, count })
   * @param {object} takes keys `searchKeywords` {string}, `selectedFilters` {object}, `field` {string}, `count` {integer}.
   * Displays where the results are coming from. This currently only allows for one
   * option at a time due to constraints on the front end not allowing for multiple
   * selections to occur.
   *
   * @returns {string} A phrase like "for (keyword|title|author) TERM"
   */
function displayContext({ searchKeywords, contributor, title, subject, selectedFilters, field, count }) {
  const keyMapping = {
    // Currently from links on the bib page:
    creatorLiteral: 'author',
    contributorLiteral: 'author',
    titleDisplay: 'title',
    // From the search field dropdown:
    contributor: 'author/contributor',
    title: 'title',
    standard_number: 'standard number',
    journal_title: 'journal title',
  };

  // Build up an array of human-readable "clauses" representing the query:
  const clauses = [];

  // Build a hash of active, non-empty filters:
  const activeFilters = Object.keys((selectedFilters || {}))
    .reduce((map, key) => {
      const label = keyMapping[key];
      const filter = selectedFilters[key];
      if (label
        && Array.isArray(filter)
        && filter[0]
        && filter[0].value
      ) {
        return Object.assign({ [label]: selectedFilters[key][0].value }, map);
      }
      return map;
    }, {});

  // Are there any filters at work?
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // If there are filters, build a clause like 'author "Shakespeare", title "Hamlet"'
  if (hasActiveFilters) {
    clauses.push(
      Object.keys(activeFilters)
        .map(label => `${label} "${activeFilters[label]}"`)
        .join(', '),
    );
  }

  // Mention keywords if keywords used (or no results):
  if (searchKeywords || count === 0) {
    // We call `q` something different depending on search_scope (i.e.
    // "field") and the number of results.

    // By default, call it 'keywords':
    const plural = /\s/.test(searchKeywords) ? 's' : '';
    let fieldLabel = `keyword${plural}`;
    // Special case 1: If 0 results, call it "the keywords":
    if (count === 0) {
      fieldLabel = `the ${fieldLabel}`;
    }
    // Special case 2: if a search_scope used, use a friendly name for that:
    if (field && field !== 'all') {
      fieldLabel = keyMapping[field];
    }
    clauses.push(`${fieldLabel} "${searchKeywords}"`);
  }

  if (contributor) {
    clauses.push(`Author: ${contributor}`);
  }

  if (title) {
    clauses.push(`Title: ${title}`);
  }

  if (subject) {
    clauses.push(`Subject: ${subject}`);
  }

  // Now join the accumlated (0-2) "clauses" together into a phrase like:
  // 'for author "Shakespeare" and keywords "romeo and juliet"'
  return clauses.length ? `for ${clauses.join(' and ')}` : '';
}

/**
 * truncateStringOnWhitespace(str, maxLength)
 * Return a version of the string shortened to the provided maxLength param. This includes
 * the three characters for the ellipsis that is appended. If the string is shorter than the
 * max length it is returned as is. If the string contains no whitespace before the max
 * length it is truncated at that point regardless of word breaks.
 * @param {string} str - The string to be shortened (or returned without change)
 * @param {int} maxLength - The maximum length of the returned string to be applied
 */
const truncateStringOnWhitespace = (str, maxLength) => {
  if (str.length < maxLength) { return str; }
  const truncStr = str.substr(0, maxLength - 3);
  const truncArray = truncStr.split(/\s+/).slice(0, -1);
  if (truncArray.length === 0) { return `${truncStr}...`; }
  return `${truncArray.join(' ')}...`;
};

/**
  this is used for the item Filters
  @param {array | string} filterValue
  @param {string} itemValue
  @return {boolean}
*/
const isOptionSelected = (filterValue, itemValue) => {
  const itemValues = Array.isArray(itemValue) ? itemValue : [itemValue];
  const filterValues = Array.isArray(filterValue) ? filterValue : [filterValue];
  return filterValues.some(filter => itemValues.includes(filter));
};

/**
 * hasValidFilters (filters)
 *
 * Returns true if the hash of filters contains at least one valid filter value.
 *
 * @example
 * // The following returns false:
 * hasValidFilters({
 *   materialType: [],
 *   language: [],
 *   dateAfter: '',
 *   dateBefore: '',
 *   subjectLiteral: []
 * })
 *
 * @example
 * // The following returns true:
 * hasValidFilters({
 *   language: [],
 *   dateAfter: '0',
 *   dateBefore: '',
 *   subjectLiteral: []
 * })
 *
 * @example
 * // The following returns true:
 * hasValidFilters({
 *   materialType: [
 *     { selected: true,
 *       value: 'resourcetypes:aud',
 *       label: 'Audio',
 *       count: 400314
 *     }
 *   ],
 *   language: [],
 *   dateAfter: '',
 *   dateBefore: '',
 *   subjectLiteral: []
 * })
 *
 * @param {object} filters - A hash of filter names mapped to filter values
 * @return {boolean}
 */
const hasValidFilters = (selectedFilters) => {
  return Object.values(selectedFilters || {}).some((v) => Array.isArray(v) ? v.length > 0 : v );
};


/**
 * encodeHTML(str, maxLength)
 * Return a version of the string sanitized to protect against XSS.
 * @param {string} str - The string to be sanitized
 */
function encodeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

/**
 * extractNoticePreference(fixedFields)
 * Returns 'None', 'Email', or 'Telephone'.
 * @param {string} fixedFields - Object coming from patron object `fixedFields` property
 */
function extractNoticePreference(fixedFields) {
  if (!fixedFields) return 'None';
  const noticePreferenceField = fixedFields['268'];
  if (!noticePreferenceField || !noticePreferenceField.value) return 'None';
  return noticePreferenceMapping[noticePreferenceField.value] || 'None';
}

/**
 * Converts camel case string to shish kabob case
 *
 * e.g. camelToShishKabobCase("RecapPul")
 *        => "recap-pul"
 *      camelToShishKabobCase("firstCharCanBeLowerCase")
 *        => "first-char-can-be-lower-case"
 */
function camelToShishKabobCase(s) {
  return s
    // Change capital letters into "-{lowercase letter}"
    .replace(/([A-Z])/g, (c, p1, i) => {
      // If capital letter is not first character, precede with '-':
      return (i > 0 ? '-' : '')
        + c.toLowerCase();
    })
}

/**
 * Given an nypl-source (e.g. 'recap-pul') returns a short institution name
 * (e.g. "Princeton")
 */
function institutionNameByNyplSource(nyplSource) {
  return {
    'recap-pul': 'Princeton',
    'recap-cul': 'Columbia',
    'recap-hl': 'Harvard',
    'sierra-nypl': 'NYPL'
  }[nyplSource];
}

export {
  trackDiscovery,
  ajaxCall,
  getSortQuery,
  createAppHistory,
  getFieldParam,
  getFilterParam,
  destructureFilters,
  getDefaultFilters,
  basicQuery,
  getReqParams,
  parseServerSelectedFilters,
  getAggregatedElectronicResources,
  getUpdatedFilterValues,
  displayContext,
  truncateStringOnWhitespace,
  isOptionSelected,
  hasValidFilters,
  encodeHTML,
  extractNoticePreference,
  camelToShishKabobCase,
  institutionNameByNyplSource,
};
