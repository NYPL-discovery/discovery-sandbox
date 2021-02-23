import axios from 'axios';

import nyplApiClient from '../routes/nyplApiClient';
import User from './User';
import appConfig from '../../app/data/appConfig';

const nyplApiClientGet = endpoint => (
  nyplApiClient()
    .then(client => client.get(endpoint, { cache: false }))
);

const Account = {};

Account.getHomeLibrary = (code) => {
  return nyplApiClientGet(`/locations?location_codes=${code}`)
    .then((resp) => {
      if (!resp || !resp[code] || !resp[code][0].label) return { code };
      return {
        code,
        label: resp[code][0].label,
      };
    })
    .catch((error) => {
      console.error(error);
      return { code };
    });
}

function getAccountPage(res, req) {
  const patronId = req.patronTokenResponse.decodedPatron.sub;
  const content = req.params.content || 'items';

  return axios.get(`${appConfig.legacyCatalog}/dp/patroninfo*eng~Sdefault/${patronId}/${content}`, {
    headers: {
      Cookie: req.headers.cookie,
    },
  });
}

Account.fetchAccountPage = (req, res, resolve) => {
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  if (redirect) {
    resolve({ redirect });
    return;
  }

  const content = req.params.content || 'items';
  // no need to fetch from Webpac for this tab
  if (content === 'settings') {
    const patron = global.store.getState().patron;
    if (patron.homeLibraryCode && !patron.homeLibraryName) {
      Account.getHomeLibrary(patron.homeLibraryCode)
        .then((resp) => {
          resolve({
            patron: {
              ...patron,
              homeLibraryName: resp.label,
            },
          });
        });
      return;
    }
    resolve({ patron, accountHtml: '' });

    return;
  }

  if (!['items', 'holds', 'overdues'].includes(content)) {
    res.redirect(`${appConfig.baseUrl}/account`);
    return;
  }


  getAccountPage(res, req)
    .then((resp) => {
      // If Header thinks patron is logged in,
      // but patron is not actually logged in, the case below is hit
      if (resp.request && resp.request.path.includes('/login?')) {
        // need to implement
        console.log('need to redirect, might be buggy?');
        // redirect to login
        const fullUrl = encodeURIComponent(`${req.protocol}://${req.get('host')}${req.originalUrl}`);
        if (!fullUrl.includes('%2Fapi%2F')) {
          res.redirect(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
        }
      }

      resolve({ accountHtml: resp.data });
    })
    .catch((resp) => {
      console.error(resp);
      res.json({ error: resp });
    });
}

Account.postToAccountPage = (req, res) => {
  const requireUser = User.requireUser(req, res);
  const { redirect } = requireUser;
  if (redirect) res.json({ redirect });
  const patronId = req.patronTokenResponse.decodedPatron.sub;
  const content = req.params.content || 'items';
  const reqBodyString = Object.keys(req.body).map(key => `${key}=${req.body[key]}`).join('&');
  axios.post(
    `${appConfig.legacyCatalog}/dp/patroninfo*eng~Sdefault/${patronId}/${content}`,
    reqBodyString, {
      headers: {
        Cookie: req.headers.cookie,
      },
    })
    .then(resp => res.json(resp.data))
    .catch(resp => res.json({ error: resp }));
}

export default Account;
