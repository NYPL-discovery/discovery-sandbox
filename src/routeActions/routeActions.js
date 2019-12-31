import subjectHeadingIndexFetcher from '../app/actions/SubjectHeading/SubjectHeadingIndex';

const routeActions = [
  [
    /.*subject_headings$/,
    subjectHeadingIndexFetcher,
  ],
];

export default routeActions;
