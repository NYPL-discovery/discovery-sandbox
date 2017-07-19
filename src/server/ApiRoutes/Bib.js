import axios from 'axios';
import appConfig from '../../../appConfig.js';

const appEnvironment = process.env.APP_ENV || 'production';
const apiBase = appConfig.api[appEnvironment];

function fetchBib(bibId, cb, errorcb) {
  return axios
    .get(`${apiBase}/discovery/resources/${bibId}`)
    .then(response => cb(response.data))
    .catch(error => {
      console.error(`fetchBib API error: ${JSON.stringify(error, null, 2)}`);

      errorcb(error);
    }); /* end axios call */
}

function bibSearchServer(req, res, next) {
  const bibId = req.params.bibId || '';

  fetchBib(
    bibId,
    (data) => {
      res.locals.data.Store = {
        bib: data,
        searchKeywords: '',
        error: {},
      };
      next();
    },
    (error) => {
      console.error(`bibSearchServer API error: ${JSON.stringify(error, null, 2)}`);
      res.locals.data.Store = {
        bib: {},
        searchKeywords: '',
        error,
      };
      next();
    }
  );
}

function bibSearchAjax(req, res) {
  const bibId = req.query.bibId || '';

  fetchBib(
    bibId,
    (data) => res.json(data),
    (error) => res.json(error)
  );
}

export default {
  bibSearchServer,
  bibSearchAjax,
  fetchBib,
};
