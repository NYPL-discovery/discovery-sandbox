/* eslint import/prefer-default-export: "off" */
import { isEmpty as _isEmpty } from 'underscore';

import nyplApiClient from '../nyplApiClient';
import logger from '../../../../logger';

import { updatePatronData } from '../../../app/actions/Actions';


export function getPatronData(req, res, next) {
  const { dispatch } = global.store;
  if (req.patronTokenResponse.isTokenValid
    && req.patronTokenResponse.decodedPatron
    && req.patronTokenResponse.decodedPatron.sub
  ) {
    const userId = req.patronTokenResponse.decodedPatron.sub;

    global.log.push({
      name: 'getPatronDataOutsideCallback',
      patronTokenResponse: req.patronTokenResponse,
      path: req._parsedUrl.path,
      id: req.id,
    });

    return nyplApiClient()
      .then(client =>
        client.get(`/patrons/${userId}`, { cache: false })
          .then((response) => {
            global.log.push({
              name: 'getPatronDataInsideCallback',
              patronTokenResponse: req.patronTokenResponse,
              path: req._parsedUrl.path,
              id: req.id,
            });
            if (_isEmpty(response)) {
              // Data is empty for the Patron
              const patron = {
                id: '',
                names: [],
                barcodes: [],
                emails: [],
                loggedIn: false,
              };

              dispatch(updatePatronData(patron));
            } else {
              // Data exists for the Patron
              const patron = {
                id: response.data.id,
                names: response.data.names,
                barcodes: response.data.barCodes,
                emails: response.data.emails,
                loggedIn: true,
              };

              dispatch(updatePatronData(patron));
            }

            // Continue next function call
            next();
          })
          .catch((error) => {
            logger.error(
              'Error attemping to make server side fetch call to patrons in getPatronData' +
              `, /patrons/${userId}`,
              error,
            );
            const patron = {
              id: '',
              names: [],
              barcodes: [],
              emails: [],
              loggedIn: false,
            };

            dispatch(updatePatronData(patron));
            // Continue next function call
            next();
          }),
      );
  }

  const patron = {
    id: '',
    names: [],
    barcodes: [],
    emails: [],
    loggedIn: false,
  };

  dispatch(updatePatronData(patron));
  return next();
}
