import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

/* eslint-disable import/no-unresolved, import/extensions */
import SearchResultsSorter from '@SearchResultsSorter';
import SearchResultsContainer from '@SearchResultsContainer';
/* eslint-enable */
import SccContainer from '../components/SccContainer/SccContainer';
import Search from '../components/Search/Search';
import FilterPopup from '../components/FilterPopup/FilterPopup';
import SelectedFilters from '../components/Filters/SelectedFilters';
import ResultsCount from '../components/ResultsCount/ResultsCount';
import Notification from '../components/Notification/Notification';

import {
  basicQuery,
  hasValidFilters,
} from '../utils/utils';

const SearchResults = (props, context) => {
  const {
    searchResults,
    searchKeywords,
    sortBy,
    field,
    page,
    selectedFilters,
  } = useSelector(state => ({
    searchResults: state.searchResults,
    searchKeywords: state.searchKeywords,
    sortBy: state.sortBy,
    field: state.field,
    page: state.page,
    selectedFilters: state.selectedFilters,
  }));

  const {
    router,
  } = context;

  const { location } = router;

  const [dropdownOpen, toggleDropdown] = useState(false);

  const totalResults = searchResults ? searchResults.totalResults : undefined;

  const createAPIQuery = basicQuery({
    searchKeywords,
    page,
    sortBy,
    selectedFilters,
    field,
  });
  const dateFilterErrors = [];
  const searchError = location.query && location.query.error ? location.query.error : '';
  if (searchError === 'dateFilterError') {
    dateFilterErrors.push({
      name: 'date',
      value: 'Date',
    });
  }

  const selectedFiltersAvailable = hasValidFilters(selectedFilters) && !dropdownOpen;
  const hasResults = searchResults && totalResults;

  return (
    <SccContainer
      useLoadingLayer
      activeSection="search"
      pageTitle="Search Results"
    >
      <div className="content-header research-search">
        <div className="research-search__inner-content">
          <Search
            createAPIQuery={createAPIQuery}
            router={router}
          />
          <FilterPopup
            createAPIQuery={createAPIQuery}
            raisedErrors={dateFilterErrors}
            updateDropdownState={toggleDropdown}
          />
        </div>
      </div>
      <Notification notificationType="searchResultsNotification" />
      {
        selectedFiltersAvailable ? (
          <SelectedFilters
            selectedFilters={selectedFilters}
            createAPIQuery={createAPIQuery}
            selectedFiltersAvailable={selectedFiltersAvailable}
          />
        ) : null
      }
      <div className="nypl-sorter-row">
        <ResultsCount
          count={totalResults}
          selectedFilters={selectedFilters}
          field={field}
        />
        {
          hasResults ?
            <SearchResultsSorter
              createAPIQuery={createAPIQuery}
              key={sortBy}
            />
            : null
        }
      </div>
      <SearchResultsContainer
        router={router}
        createAPIQuery={createAPIQuery}
      />
    </SccContainer>
  );
};

SearchResults.contextTypes = {
  router: PropTypes.any,
};

export default SearchResults;
