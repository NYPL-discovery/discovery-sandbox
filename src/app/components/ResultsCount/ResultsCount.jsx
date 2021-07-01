import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { displayContext } from '../../utils/utils';

export class ResultsCount extends React.Component {
  /*
   * checkSelectedFilters()
   * Returns true if there are any selected format or language filters. TODO: add Date.
   */
  checkSelectedFilters() {
    const selectedFilters = this.props.selectedFilters;

    if ((selectedFilters.materialType && selectedFilters.materialType.length) ||
      (selectedFilters.language && selectedFilters.language.length)) {
      return true;
    }

    // Eventually need to add check for date.
    return false;
  }

  displayCount() {
    const {
      count,
      page,
      searchKeywords,
      selectedFilters,
      field,
      contributor,
      title,
      subject,
    } = this.props;

    const countF = count ? count.toLocaleString() : '';
    const start = ((page - 1) * 50) + 1;
    const end = (page) * 50 > count ? count : (page * 50);
    const currentResultDisplay = `${start}-${end}`;

    const displayContextString = displayContext({
      searchKeywords, contributor, title, subject, selectedFilters, field, count,
    });

    if (count !== 0) {
      return `Displaying ${currentResultDisplay} of ${countF} results ${displayContextString}`;
    }

    if (this.checkSelectedFilters()) {
      return `No results ${displayContextString} with the chosen filters. Try a different search or different filters.`;
    }

    return `No results ${displayContextString}. Try a different search.`;
  }

  render() {
    const results = this.displayCount();
    const {
      count,
      features,
    } = this.props;
    const includeDrbb = features.includes('drb-integration');
    if (includeDrbb && count === 0) return null;

    return (
      <div
        className={`nypl-results-summary${count === 0 ? ' no-scc-results' : ''}${includeDrbb ? ' drbb-integration' : ''}`}
      >
        <h2
          id="results-description"
          aria-live="polite"
          aria-atomic="true"
          role="alert"
        >
          {results}
        </h2>
      </div>
    );
  }
}

ResultsCount.propTypes = {
  count: PropTypes.number,
  page: PropTypes.string,
  selectedFilters: PropTypes.object,
  searchKeywords: PropTypes.string,
  field: PropTypes.string,
  features: PropTypes.array,
  contributor: PropTypes.string,
  title: PropTypes.string,
  subject: PropTypes.string,
};

ResultsCount.defaultProps = {
  searchKeywords: '',
  count: 0,
  page: '1',
  selectedFilters: {
    materialType: [],
    language: [],
    dateAfter: {},
    dateBefore: {},
  },
  features: [],
};

const mapStateToProps = ({ searchKeywords, contributor, title, subject, page, features }) => ({
  features,
  searchKeywords,
  contributor,
  title,
  subject,
  page,
});

export default connect(mapStateToProps)(ResultsCount);
