// reflects item object after being parsed by `LibraryItem.mapItem`
const item = {
  full: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    format: 'Text',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    materialType: {
      '@id': 'resourcetypes:txt',
      prefLabel: 'Text',
    },
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  missingData: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: '',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: '',
    holdingLocationCode: '',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: '',
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: '',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_ReCAP_available: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:rcaj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: true,
    itemSource: 'sierra-nypl',
    location: 'Offsite',
    nonRecapNYPL: false,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_ReCAP_not_available: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: false,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:rc2ma',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: true,
    itemSource: 'sierra-nypl',
    location: 'Offsite',
    nonRecapNYPL: false,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  requestable_nonReCAP_NYPL: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    nonRecapNYPL: true,
    requestable: true,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
  nonrequestable_nonReCAP_NYPL: {
    accessMessage: {
      '@id': 'accessMessage:1',
      prefLabel: 'USE IN LIBRARY',
    },
    availability: 'available',
    available: true,
    barcode: '33433078478272',
    callNumber: 'JFE 07-5007 ---',
    holdingLocationCode: 'loc:maj03',
    id: 'i17326129',
    isElectronicResource: false,
    isOffsite: false,
    isRecap: false,
    itemSource: 'sierra-nypl',
    location: 'SASB M1 - General Research - Room 315',
    nonRecapNYPL: true,
    requestable: false,
    status: {
      '@id': 'status:a',
      prefLabel: 'Available',
    },
    suppressed: false,
    url: 'http://www.questionpoint.org/crs/servlet/org.oclc.admin.BuildForm?' +
      '&institution=13777&type=1&language=1',
  },
};

export default item;