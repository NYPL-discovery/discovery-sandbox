import fetchForSubjectHeadingIndex from '../app/actions/SubjectHeading/SubjectHeadingIndex';

const routeActions = [
  [
    /.*subject_headings$/,
    fetchForSubjectHeadingIndex,
  ],
];

export default routeActions;
