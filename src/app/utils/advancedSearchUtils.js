const buildQueryDataFromForm = (formData) => {
  const queryData = {};

  // Add advanced search params
  ['searchKeywords', 'contributor', 'title', 'subject'].forEach((inputType) => {
    const inputData = formData.find(entry => (entry[0] === inputType && entry[1]));
    if (inputData) queryData[inputType] = inputData[1];
  });

  // Add dates
  ['dateAfter', 'dateBefore'].forEach((inputType) => {
    const inputData = formData.find(entry => (entry[0] === inputType && entry[1]));
    if (inputData) {
      queryData.selectedFilters = queryData.selectedFilters || {};
      queryData.selectedFilters[inputType] = inputData[1];
    }
  });

  // Add formats
  formData.forEach((input) => {
    if (input[0].includes('resourcetypes')) {
      queryData.selectedFilters = queryData.selectedFilters || {};
      queryData.selectedFilters.materialType = queryData.selectedFilters.materialType || [];
      queryData.selectedFilters.materialType.push(input[0]);
    }
  });

  // Add language
  const languageData = formData.find(entry => (entry[0] === 'language' && entry[1]));
  if (languageData) {
    queryData.selectedFilters = queryData.selectedFilters || {};
    queryData.selectedFilters.language = [languageData[1]];
  }

  return queryData;
};

export { buildQueryDataFromForm };
