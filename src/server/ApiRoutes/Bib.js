import axios from 'axios';

import nyplApiClient from '../routes/nyplApiClient';
import logger from '../../../logger';
import appConfig from '../../app/data/appConfig';
import extractFeatures from '../../app/utils/extractFeatures';
import { itemBatchSize } from '../../app/data/constants';

const nyplApiClientCall = (query, urlEnabledFeatures, itemFrom) => {
  // If on-site-edd feature enabled in front-end, enable it in discovery-api:
  const queryForItemPage = typeof itemFrom !== 'undefined' ? `?items_size=${itemBatchSize}&items_from=${itemFrom}` : '';
  const requestOptions = appConfig.features.includes('on-site-edd') || urlEnabledFeatures.includes('on-site-edd') ? { headers: { 'X-Features': 'on-site-edd' } } : {};
  return nyplApiClient().then(client => client.get(`/discovery/resources/${query}${queryForItemPage}`, requestOptions));
};

const shepApiCall = bibId => axios({
  method: 'get',
  url: `${appConfig.shepApi}/bibs/${bibId}/subject_headings`,
  timeout: 5000,
});

const holdingsMappings = {
  Location: 'location',
  Format: 'format',
  'Call Number': 'shelfMark',
  'Library Has': 'holdingStatement',
  Notes: 'notes',
};

export const addHoldingDefinition = (holding) => {
  holding.holdingDefinition = Object.entries(holdingsMappings)
    .map(([key, value]) => ({ term: key, definition: holding[value] }))
    .filter(data => data.definition);
};

export const findUrl = (location, urls) => {
  const matches = urls[location.code] || [];
  const longestMatch = matches.reduce(
    (acc, el) => (el.code.length > acc.code.length ? el : acc), matches[0]);
  if (!longestMatch || !longestMatch.url) return undefined;
  return longestMatch.url;
};

const checkInItemsForHolding = (holding) => {
  let location = '';
  let holdingLocationCode = '';
  let locationUrl;
  if (holding.location && holding.location.length) {
    holdingLocationCode = holding.location[0].code;
    location = holding.location[0].label;
    locationUrl = holding.location[0].url;
  }
  const format = holding.format || '';
  if (!holding.checkInBoxes) return [];
  return holding.checkInBoxes.map(box => (
    {
      location,
      locationUrl,
      holdingLocationCode,
      format,
      position: box.position || 0,
      status: { prefLabel: box.status || '' },
      accessMessage: { '@id': 'accessMessage: 1', prefLabel: 'Use in library' },
      volume: box.coverage || '',
      callNumber: box.shelfMark || '',
      available: true,
      isSerial: true,
      requestable: false,
    }
  ));
};

export const addCheckInItems = (bib) => {
  bib.checkInItems = bib
    .holdings
    .map(holding => checkInItemsForHolding(holding))
    .reduce((acc, el) => acc.concat(el), [])
    .filter(box => !['Expected', 'Late', 'Removed'].includes(box.status.prefLabel))
    .sort((box1, box2) => box2.position - box1.position);
};

export const fetchLocationUrls = codes => nyplApiClient()
  .then(client => client.get(`/locations?location_codes=${codes}`));

const addLocationUrls = (bib) => {
  const { holdings } = bib;
  const holdingCodes = holdings ?
    holdings
      .map(holding => (holding.location || []).map(location => location.code))
      .reduce((acc, el) => acc.concat(el), [])
    : [];

  const itemCodes = bib.items ?
    bib.items.map(item =>
      (item.holdingLocation || []).map(location => location['@id'] || location.code),
    ).reduce((acc, el) => acc.concat(el), [])
    : [];

  const codes = holdingCodes.concat(itemCodes).join(',');
  // get locations data by codes
  return fetchLocationUrls(codes)
    .then((resp) => {
      // add location urls for holdings
      if (Array.isArray(bib.holdings)) {
        bib.holdings.forEach((holding) => {
          if (holding.location) {
            holding.location.forEach((location) => {
              location.url = findUrl(location, resp);
            });
          };
        });
      }
      // add item location urls;
      if (Array.isArray(bib.items)) {
        bib.items.forEach((item) => {
          if (item.holdingLocation) {
            item.holdingLocation.forEach((holdingLocation) => {
              if (holdingLocation['@id']) {
                holdingLocation.url = findUrl({ code: holdingLocation['@id'] }, resp);
              }
            });
          }
        });
      }
      return bib;
    })
    .catch((err) => { console.log('catching nypl client ', err); });
};

function fetchBib(bibId, cb, errorcb, reqOptions, res) {
  const options = Object.assign({
    fetchSubjectHeadingData: true,
    features: [],
  }, reqOptions);
  // Determine if it's an NYPL bibId by prefix:
  const isNYPL = /^b/.test(bibId);
  return Promise.all([
    nyplApiClientCall(bibId, options.features, reqOptions.itemFrom || 0),
    // Don't fetch annotated-marc for partner records:
    isNYPL ? nyplApiClientCall(`${bibId}.annotated-marc`, options.features) : null,
  ])
    .then((response) => {
      // First response is jsonld formatting:
      const data = response[0];
      // Assign second response (annotated-marc formatting) as property of bib:
      data.annotatedMarc = response[1];
      // Make sure retrieved annotated-marc document is valid:
      if (!data.annotatedMarc || !data.annotatedMarc.bib) data.annotatedMarc = null;

      return data;
    })
    .then((bib) => {
      const status = (!bib || !bib.uri || bib.uri !== bibId) ? '404' : '200';
      if (status === '404') {
        return nyplApiClient()
          .then(client => client.get(`/bibs/sierra-nypl/${bibId.slice(1)}`))
          .then((resp) => {
            const classic = appConfig.legacyBaseUrl;
            if (resp.statusCode === 200) { res.redirect(`${appConfig.circulatingCatalog}/iii/encore/record/C__R${bibId}`); }
          })
          .catch((err) => {
            console.log('error: ', err);
            console.log('bib not found');
          })
          .then(() => {
            res.status(404);
            return Object.assign({ status }, bib);
          });
      }
      return Object.assign({ status }, bib);
    })
    .then(bib => addLocationUrls(bib))
    .then((bib) => {
      if (bib.holdings) {
        addCheckInItems(bib);
      }
      return bib;
    })
    .then((bib) => {
      if (bib.holdings) {
        bib.holdings.forEach(holding => addHoldingDefinition(holding));
      }
      if (options.fetchSubjectHeadingData && bib.subjectLiteral && bib.subjectLiteral.length) {
        return shepApiCall(bibId)
          .then((shepRes) => {
            bib.subjectHeadingData = shepRes.data.subject_headings;
            return { bib };
          })
          .catch((error) => {
            logger.error(`Error in shepApiCall API error, bib_id: ${bibId}`, error);
            return { bib };
          });
      }
      return { bib };
    })
    .then(bib => cb(bib))
    .catch((error) => {
      logger.error(`Error attemping to fetch a Bib in fetchBib, id: ${bibId}`, error);

      errorcb(error);
    }); /* end axios call */
}

function bibSearch(req, res, resolve) {
  const bibId = req.params.bibId;
  const { features, itemFrom } = req.query;
  const urlEnabledFeatures = extractFeatures(features);

  return fetchBib(
    bibId,
    data => resolve(data),
    error => resolve(error),
    {
      features: urlEnabledFeatures,
      fetchSubjectHeadingData: true,
      itemFrom,
    },
    res,
  );
}

export default {
  addHoldingDefinition,
  addCheckInItems,
  bibSearch,
  fetchBib,
  nyplApiClientCall,
  addLocationUrls,
};
