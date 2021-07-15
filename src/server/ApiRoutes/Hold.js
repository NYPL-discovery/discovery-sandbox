import {
  extend as _extend,
  mapObject as _mapObject,
  omit as _omit,
} from 'underscore';

import appConfig from '../../app/data/appConfig';
import locationCodes from '../../app/data/locationCodes';
import locationDetails from '../../../locations';
import User from './User';
import Bib from './Bib';
import LibraryItem from './../../app/utils/item';
import { validate } from '../../app/utils/formValidationUtils';
import nyplApiClient from '../routes/nyplApiClient';
import logger from '../../../logger';
import {
  updateBib,
  updateSearchKeywords,
  updateHoldRequestPage,
} from '../../app/actions/Actions';
import extractFeatures from '../../app/utils/extractFeatures';

const nyplApiClientGet = endpoint =>
  nyplApiClient().then(client => client.get(endpoint, { cache: false }));

const nyplApiClientPost = (endpoint, opts) =>
  nyplApiClient().then(client => client.post(endpoint, opts));
/**
 * postHoldAPI(req, pickedUpItemId, pickupLocation, cb, errorCb)
 * The function to make a POST request to the hold request API.
 *
 * @param {req} req
 * @param {string} pickedUpItemId
 * @param {string} pickupLocation
 * @param {object} docDeliveryData
 * @param {string} itemSource The source of the item, either nypl, cul, or pul.
 * @param {function} cb - callback when we have valid response
 * @param {function} errorCb - callback when error
 * @return {function}
 */
function postHoldAPI(
  req,
  pickedUpItemId,
  pickupLocation,
  docDeliveryData,
  itemSource,
  cb,
  errorCb,
) {
  // retrieve patron info
  const patronId = req.patronTokenResponse.decodedPatron.sub;
  const holdRequestEndpoint = '/hold-requests';

  // get item id and pickup location
  // NOTE: pickedUpItemId and pickedUpBibId are coming from the EDD form function below:
  let itemId = req.params.itemId || pickedUpItemId;
  itemId = itemId.replace(/\D/g, '');

  const data = {
    patron: patronId,
    record: itemId,
    nyplSource: itemSource,
    requestType: (pickupLocation === 'edd') ? 'edd' : 'hold',
    recordType: 'i',
    pickupLocation: (pickupLocation === 'edd') ? null : pickupLocation,
    // neededBy: "2013-03-20",
    numberOfCopies: 1,
    docDeliveryData: (pickupLocation === 'edd') ? docDeliveryData : null,
  };
  logger.info('Making hold request in postHoldAPI', data);

  return nyplApiClientPost(holdRequestEndpoint, data)
    .then(cb)
    .catch(errorCb);
}

/**
 * mapLocationDetails(locations)
 * The function extracts the details of the delivery locations from the location.js and
 * locationCodes.js based on the location ID we get from deliveryLocationsByBarcode API.
 *
 * @param {array} locations
 * @return {array}
 */
function mapLocationDetails(locations) {
  locations.map((loc) => {
    _mapObject(locationCodes, (c) => {
      if (loc['@id'].replace('loc:', '') === c.delivery_location) {
        const locationDetailsItem = locationDetails[c.location];

        loc.address = (locationDetailsItem) ?
          locationDetailsItem.address.address1 : null;
        loc.shortName = (locationDetailsItem) ?
          locationDetailsItem['short-name'] : null;

        return true;
      }

      return false;
    });
  });

  return locations;
}

/**
 * modelDeliveryLocationName(prefLabel, shortName)
 * Renders the names of the radio input fields of delivery locations except EDD.
 *
 * @param {String} prefLabel
 * @param {String} shortName
 * @return {String}
 */
function modelDeliveryLocationName(prefLabel, shortName) {
  if (prefLabel && typeof prefLabel === 'string' && shortName) {
    const deliveryRoom = (prefLabel.split(' - ')[1]) ? ` - ${prefLabel.split(' - ')[1]}` : '';

    return `${shortName}${deliveryRoom}`;
  }

  return '';
}

/**
 * getDeliveryLocations(barcode, patronId, cb, errorCb)
 * The function to make a request to get delivery locations of an item.
 *
 * @param {string} barcode
 * @param {string} patronId
 * @param {function} cb - callback when we have valid response
 * @param {function} errorCb - callback when error
 * @return {function}
 */
function getDeliveryLocations(barcode, patronId, cb, errorCb) {
  const deliveryEndpoint = `/request/deliveryLocationsByBarcode?barcodes[]=${barcode}` +
    `&patronId=${patronId}`;

  return nyplApiClientGet(deliveryEndpoint)
    .then((barcodeAPIresponse) => {
      const eddRequestable = (barcodeAPIresponse && barcodeAPIresponse.itemListElement &&
        barcodeAPIresponse.itemListElement.length &&
        barcodeAPIresponse.itemListElement[0].eddRequestable) ?
        barcodeAPIresponse.itemListElement[0].eddRequestable : false;
      let deliveryLocationWithAddress = (barcodeAPIresponse &&
          barcodeAPIresponse.itemListElement && barcodeAPIresponse.itemListElement.length &&
          barcodeAPIresponse.itemListElement[0].deliveryLocation) ?
        mapLocationDetails(barcodeAPIresponse.itemListElement[0].deliveryLocation) : [];

      const { closedLocations } = appConfig;
      deliveryLocationWithAddress = deliveryLocationWithAddress.filter(location =>
        !closedLocations.some(closedLocation =>
          modelDeliveryLocationName(location.prefLabel, location.shortName)
            .startsWith(closedLocation),
        ),
      );

      cb(
        deliveryLocationWithAddress,
        eddRequestable,
      );
    })
    .catch((barcodeAPIError) => {
      logger.error(
        'Error attemping to make server side call using nyplApiClient in getDeliveryLocations' +
        `, endpoint: ${deliveryEndpoint}`,
        barcodeAPIError,
      );
      errorCb(barcodeAPIError);
    });
}

/**
 * confirmRequestServer(req, res, next)
 * The function to return the bib and item data with its delivery locations to confirmation page.
 *
 * @param {req}
 * @param {res}
 * @param {next}
 * @return {function}
 */
function confirmRequestServer(req, res, next) {
  const bibId = req.params.bibId || '';
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  if (redirect) return false;
  const requestId = req.query.requestId || '';
  const searchKeywords = req.query.q || '';
  const errorStatus = req.query.errorStatus ? req.query.errorStatus : null;
  const errorMessage = req.query.errorMessage ? req.query.errorMessage : null;
  const error = _extend({}, { errorStatus, errorMessage });
  const { features } = req.query;
  const urlEnabledFeatures = extractFeatures(features);


  const { dispatch } = req.store;
  if (!requestId) {
    dispatch(updateHoldRequestPage({
      bib: {},
      searchKeywords,
      error,
      deliveryLocations: [],
    }));
    next();
    return false;
  }

  const patronId = req.patronTokenResponse.decodedPatron.sub || '';
  let barcode;

  return nyplApiClientGet(`/hold-requests/${requestId}`)
    .then((response) => {
      const patronIdFromHoldRequest = response.data.patron;

      // The patron who is seeing the confirmation did not make the Hold Request
      if (patronIdFromHoldRequest !== patronId) {
        res.status(404).redirect(`${appConfig.baseUrl}/404`);
        return false;
      }

      // Retrieve item
      return Bib.fetchBib(
        bibId,
        (bibResponseData) => {
          const { bib } = bibResponseData;
          barcode = LibraryItem.getItem(bib, req.params.itemId).barcode;
          getDeliveryLocations(
            barcode,
            patronId,
            (deliveryLocations, isEddRequestable) => {
              dispatch(updateHoldRequestPage({
                bib,
                deliveryLocations,
                isEddRequestable,
                searchKeywords,
              }));
              next();
            },
            (deliveryLocationError) => {
              logger.error(
                'Error retrieving server side delivery locations in confirmRequestServer' +
                `, bibId: ${bibId}`,
                deliveryLocationError,
              );

              dispatch(updateHoldRequestPage({
                bib,
                searchKeywords,
                error,
                deliveryLocations: [],
                isEddRequestable: false,
              }));
              next();
            },
          );
        },
        (bibResponseError) => {
          logger.error(
            `Error retrieving server side bib record in confirmRequestServer, id: ${bibId}`,
            bibResponseError,
          );
          dispatch(updateHoldRequestPage({
            bib: {},
            searchKeywords,
            error,
            deliveryLocations: [],
          }));
          next();
        },
        {
          fetchSubjectHeadingData: false,
          features: urlEnabledFeatures,
        },
      );
    })
    .catch((requestIdError) => {
      logger.error(
        'Error making a server side Hold Request in confirmRequestServer',
        requestIdError,
      );

      dispatch(updateHoldRequestPage({
        bib: {},
        searchKeywords,
        error,
        deliveryLocations: [],
      }));
      next();

      return false;
    });
}

/**
 * newHoldRequest(req, res, next)
 * The function to return the bib and item data with its delivery locations to the
 * hold request route.
 *
 * @param {req}
 * @param {res}
 * @return {function}
 */
function newHoldRequest(req, res, resolve) {
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  if (redirect) return resolve({ redirect });

  const bibId = req.params.bibId || '';
  const patronId = req.patronTokenResponse.decodedPatron ?
    req.patronTokenResponse.decodedPatron.sub : '';
  let barcode;
  const { features } = req.query;
  const urlEnabledFeatures = extractFeatures(features);

  // Retrieve item
  return Bib.fetchBib(
    bibId,
    (bibResponseData) => {
      const { bib } = bibResponseData;
      barcode = LibraryItem.getItem(bib, req.params.itemId).barcode;

      getDeliveryLocations(
        barcode,
        patronId,
        (deliveryLocations, isEddRequestable) => {
          resolve({
            bib,
            deliveryLocations,
            isEddRequestable,
          });
        },
        (deliveryLocationsError) => {
          logger.error(
            `Error retrieving serverside delivery locations in newHoldRequest, bibId: ${bibId}`,
            deliveryLocationsError,
          );

          resolve({
            bib,
            deliveryLocations: [],
            isEddRequestable: false,
          });
        }
      );
    },
    bibResponseError => resolve(bibResponseError),
    {
      fetchSubjectHeadingData: false,
      features: urlEnabledFeatures,
    },
  );
}

function newHoldRequestServerEdd(req, res, next) {
  const { dispatch } = req.store;
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  const error = req.query.error ? JSON.parse(req.query.error) : {};
  const form = req.query.form ? JSON.parse(req.query.form) : {};
  const bibId = req.params.bibId || '';
  const { features } = req.query;
  const urlEnabledFeatures = extractFeatures(features);

  if (redirect) return false;

  // Retrieve item
  return Bib.fetchBib(
    bibId,
    (data) => {
      dispatch(updateBib(data.bib));
      dispatch(updateSearchKeywords(req.query.searchKeywords));
      next();
    },
    (bibResponseError) => {
      logger.error(
        `Error retrieving server side bib record in newHoldRequestServerEdd, id: ${bibId}`,
        bibResponseError,
      );
      dispatch(updateHoldRequestPage({
        bib: {},
        searchKeywords: req.query.searchKeywords || '',
        error,
        form,
      }));
      next();
    },
    {
      fetchSubjectHeadingData: false,
      features: urlEnabledFeatures,
    },
  );
}

/**
 * createHoldRequestServer(req, res, pickedUpBibId = '', pickedUpItemId = '')
 * The function to make a server side hold request call.
 *
 * @param {req}
 * @param {res}
 * @param {string} pickedUpBibId
 * @param {string} pickedUpItemId
 * @return {function}
 */
function createHoldRequestServer(req, res, pickedUpBibId = '', pickedUpItemId = '') {
  res.respond = req.body.serverRedirect === 'false' ? res.json : res.redirect;
  // Ensure user is logged in
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  if (redirect) return res.json({ redirect: true });

  // NOTE: pickedUpItemId and pickedUpBibId are coming from the EDD form function below:
  const itemId = req.params.itemId || pickedUpItemId;
  const bibId = req.params.bibId || pickedUpBibId;
  const itemSource = req.params.itemSource || '';
  const pickupLocation = req.body['delivery-location'];
  const docDeliveryData = (req.body.form && pickupLocation === 'edd') ? req.body.form : null;
  const searchKeywordsQuery = (req.body['search-keywords']) ?
    `&q=${req.body['search-keywords']}` : '';

  if (!bibId || !itemId) {
    // Dummy redirect for now
    return res.respond(`${appConfig.baseUrl}/someErrorPage`);
  }

  if (pickupLocation === 'edd') {
    const eddSearchKeywordsQuery = (req.body['search-keywords']) ?
      `?q=${req.body['search-keywords']}` : '';

    return res.respond(
      `${appConfig.baseUrl}/hold/request/${bibId}-${itemId}/edd${eddSearchKeywordsQuery}`,
    );
  }

  return postHoldAPI(
    req,
    itemId,
    pickupLocation,
    docDeliveryData,
    itemSource,
    (response) => {
      const data = response.data;
      res.respond(
        `${appConfig.baseUrl}/hold/confirmation/${bibId}-${itemId}?pickupLocation=` +
        `${pickupLocation}&requestId=${data.id}${searchKeywordsQuery}`,
      );
    },
    (error) => {
      logger.error(
        `Error calling postHoldAPI in createHoldRequestServer, bibId: {bibId}, itemId: ${itemId}`,
        error.data.message,
      );
      const errorStatus = error.status ? `&errorStatus=${error.status}` : '';
      const errorMessage = error.statusText || searchKeywordsQuery
        ? `&errorMessage=${error.statusText}${searchKeywordsQuery}`
        : '';
      res.respond(
        `${appConfig.baseUrl}/hold/confirmation/${bibId}-${itemId}?pickupLocation=` +
        `${pickupLocation}${errorStatus}${errorMessage}`,
      );
    },
  );
}

function eddServer(req, res) {
  const {
    bibId,
    itemId,
    searchKeywords,
    serverRedirect,
  } = req.body;

  let { fromUrl } = req.body;
  fromUrl = fromUrl ? `&fromUrl=${fromUrl}` : '';

  res.respond = serverRedirect === 'false' ? res.json : res.redirect;

  const searchKeywordsQuery = (searchKeywords) ? `&q=${searchKeywords}` : '';

  let serverErrors = {};

  // NOTE: We want to skip over bibId and itemId in the validation. They are hidden fields but
  // only useful for making the actual request and not for the form validation.
  // If the form is not valid, then redirect to the same page but with errors AND the user data:
  if (!validate(_omit(req.body, ['bibId', 'itemId']), (error) => { serverErrors = error; })) {
    // Very ugly but passing all the error and patron data through the url param.
    // TODO: think of a better way to pass data. For now, this works, but make sure that
    // the data is being passed and picked up by the `ElectronicDelivery` component.
    return res.respond(`${appConfig.baseUrl}/hold/request/${bibId}-${itemId}/edd?` +
      `error=${JSON.stringify(serverErrors)}` +
      `&form=${JSON.stringify(req.body)}${fromUrl}`);
  }

  // Ensure user is logged in
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;

  if (redirect) return false;

  return postHoldAPI(
    req,
    req.body.itemId,
    req.body.pickupLocation,
    req.body,
    req.body.itemSource,
    (response) => {
      const data = response.data;

      res.respond(
        `${appConfig.baseUrl}/hold/confirmation/${bibId}-${itemId}` +
        `?pickupLocation=${req.body.pickupLocation}&requestId=${data.id}${searchKeywordsQuery}${fromUrl}`,
      );
    },
    (error) => {
      logger.error(
        `Error calling postHoldAPI in eddServer, bibID: ${bibId}, itemId: ${itemId}`,
        error,
      );
      const errorStatus = error.status ? `&errorStatus=${error.status}` : '';
      const errorMessage = error.statusText || searchKeywordsQuery || fromUrl
        ? `&errorMessage=${error.statusText}${searchKeywordsQuery}${fromUrl}`
        : '';
      res.respond(
        `${appConfig.baseUrl}/hold/confirmation/${bibId}-${itemId}?pickupLocation=edd${errorStatus}${errorMessage}`);
    },
  );
}

export default {
  getDeliveryLocations,
  confirmRequestServer,
  newHoldRequest,
  newHoldRequestServerEdd,
  createHoldRequestServer,
  eddServer,
};
