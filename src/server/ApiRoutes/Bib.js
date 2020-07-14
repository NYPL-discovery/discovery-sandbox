import nyplApiClient from '../routes/nyplApiClient';
import logger from '../../../logger';
import appConfig from '../../app/data/appConfig';
import axios from 'axios';
import SubjectHeadings from './SubjectHeadings';

const nyplApiClientCall = query =>
  nyplApiClient().then(client => client.get(`/discovery/resources/${query}`, { cache: false }));

const shepApiCall = bibId => axios(`${appConfig.shepApi}/bibs/${bibId}/subject_headings`)

function fetchBib(bibId, cb, errorcb) {
  return Promise.all([
    nyplApiClientCall(bibId),
    nyplApiClientCall(`${bibId}.annotated-marc`),
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
    .then((data) => {
      if (data.subjectLiteral && data.subjectLiteral.length) {
        return shepApiCall(bibId)
          .then((shepRes) => {
            data.subjectHeadingData = shepRes.data.subject_headings;
            return data;
          })
          .catch((error) => {
            logger.error(`Error in shepApiCall API error, bib_id: ${bibId}`, error);
            return data;
          });
      }
      return data
    })
    .then(response => cb(response))
    .catch((error) => {
      logger.error(`Error attemping to fetch a Bib server side in fetchBib, id: ${bibId}`, error);

      errorcb(error);
    }); /* end axios call */
}

function bibSearchAjax(req, res) {
  const bibId = req.query.bibId || '';

  fetchBib(
    bibId,
    data => res.json(data),
    error => res.json(error),
  );
}

export default {
  bibSearchAjax,
  fetchBib,
  nyplApiClientCall,
};
