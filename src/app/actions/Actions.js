// ACTIONS
import alt from '../alt';

class Actions {
  updateSearchResults(data) {
    return data;
  }

  updateSearchKeywords(data) {
    return data;
  }

  updateBib(data) {
    return data;
  }

  updateFilters(data) {
    return data;
  }

  updateSelectedFilters(data) {
    return data;
  }

  updatePatronData(data) {
    return data;
  }

  removeFilter(filterKey, valueId) {
    return { filterKey, valueId };
  }

  updatePage(page) {
    return page;
  }

  updateSortBy(sort) {
    return sort;
  }

  updateLoadingStatus(data) {
    return data;
  }

  updateField(data) {
    return data;
  }

  updateForm(data) {
    return data;
  }

  updateDeliveryLocations(data) {
    return data;
  }

  updateIsEddRequestable(data) {
    return data;
  }

  updateSubjectHeading(data) {
    return data;
  }

  updateSubjectHeadingIndex(data) {
    return data;
  }
}

export default alt.createActions(Actions);
