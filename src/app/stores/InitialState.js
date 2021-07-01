import appConfig from '../data/appConfig';

export const initialSelectedFiltersState = {
  materialType: [],
  language: [],
  subjectLiteral: [],
  dateAfter: {},
  dateBefore: {},
};

const initialState = {
  searchResults: {},
  bib: {},
  searchKeywords: '',
  filters: [],
  page: '1',
  sortBy: 'relevance',
  loading: true,
  field: 'all',
  deliveryLocations: [],
  isEddRequestable: false,
  subjectHeading: null,
  drbbResults: {},
  patron: {
    id: '',
    names: [],
    barcodes: [],
    emails: [],
    loggedIn: false,
  },
  appConfig,
  lastLoaded: appConfig.baseUrl,
  accountHtml: '',
  features: appConfig.features || [],
  resultSelection: {
    fromUrl: '',
    bibId: '',
  },
  contributor: '',
  title: '',
  subject: '',
};

export default initialState;
