import axios from 'axios';
import appConfig from '../../../../appConfig';
import Actions from '../Actions';

function fetchForSubjectHeadingIndex(location) {
  let {
    fromLabel,
    fromComparator,
  } = location.query;

  const {
    filter,
    sortBy,
    fromAttributeValue,
  } = location.query;

  if (!fromComparator) fromComparator = filter ? null : 'start';
  if (!fromLabel) fromLabel = filter ? null : 'Aac';

  const apiParamHash = {
    from_comparator: fromComparator,
    from_label: fromLabel,
    filter,
    sort_by: sortBy,
    from_attribute_value: fromAttributeValue,
  };

  const apiParamString = Object
    .entries(apiParamHash)
    .map(([key, value]) => (value ? `${key}=${value}` : null))
    .filter(pair => pair)
    .join('&');

  axios({
    method: 'GET',
    url: `${appConfig.shepApi}/subject_headings?${apiParamString}`,
    crossDomain: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  },
  ).then(
    (res) => {
      Actions.updateSubjectHeadingIndex({
        previousUrl: res.data.previous_url,
        nextUrl: res.data.next_url,
        subjectHeadings: res.data.subject_headings,
        error: res.data.subject_headings.length === 0,
        loading: false,
      });
    },
  ).catch(
    (err) => {
      console.log('error: ', err);
      if (!this.state.subjectHeadings || this.state.subjectHeadings.length === 0) {
        Actions.updateSubjectHeadingIndex({ error: true });
      }
    },
  );
}

export default fetchForSubjectHeadingIndex;
