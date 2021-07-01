import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import {
  Input,
  SearchBar,
  Select,
} from '@nypl/design-system-react-components';

import SearchButton from '../Buttons/SearchButton';
import {
  trackDiscovery,
} from '../../utils/utils';
import appConfig from '../../data/appConfig';
import {
  updateSearchKeywords,
  updateField,
} from '../../actions/Actions';

/**
 * The main container for the top Search section.
 */
class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      field: this.props.field,
      searchKeywords: this.props.searchKeywords,
    };

    this.inputChange = this.inputChange.bind(this);
    this.submitSearchRequest = this.submitSearchRequest.bind(this);
    this.triggerSubmit = this.triggerSubmit.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);

    // Build ref for search-by-field (aka search_scope) selector:
    this.searchByFieldRef = null;
    this.setSearchByFieldRef = (element) => {
      this.searchByFieldRef = element;
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  /**
   * onFieldChange(e)
   * Listen to the select dropdown for field searching.
   */
  onFieldChange(e) {
    const newFieldVal = e.target.value;
    this.setState({ field: newFieldVal });
  }

  /**
   * triggerSubmit(event)
   * The fuction listens to the event of enter key.
   * Submit search request if enter is pressed.
   *
   * @param {Event} event
   */
  triggerSubmit(event) {
    if (event && event.charCode === 13) {
      this.submitSearchRequest(event);
    }
  }

  /**
   * inputChange(field, event)
   * Listen to the changes on keywords input field and option input fields.
   * Grab the event value, and change the state.
   *
   * @param {Event Object} event - Passing event as the argument here
   * as FireFox doesn't accept event as a global variable.
   */
  inputChange(event) {
    this.setState({ searchKeywords: event.target.value });
  }

  /**
   * submitSearchRequest()
   */
  submitSearchRequest(e) {
    e.preventDefault();
    // Store the data that the user entered
    const {
      field,
    } = this.state;

    const userSearchKeywords = this.state.searchKeywords.trim();

    // Track the submitted keyword search.
    trackDiscovery('Search', userSearchKeywords);
    if (this.state.field) {
      trackDiscovery('Search', `Field - ${this.state.field}`);
    }

    const searchKeywords = userSearchKeywords === '*' ? '' : userSearchKeywords;

    if (field === 'subject') {
      this.props.router.push(`${appConfig.baseUrl}/subject_headings?filter=${searchKeywords.charAt(0).toUpperCase() + searchKeywords.slice(1)}`);
      return;
    }

    const apiQuery = this.props.createAPIQuery({
      clearContributor: true,
      clearSubject: true,
      clearTitle: true,
      field,
      selectedFilters: this.props.selectedFilters,
      searchKeywords,
      page: '1',
    });

    this.props.updateSearchKeywords(searchKeywords);
    this.props.updateField(field);

    this.props.router.push(`${appConfig.baseUrl}/search?${apiQuery}`);
  }

  render() {
    return (

      <SearchBar
        id="mainContent"
        onSubmit={this.triggerSubmit}
        className="content-primary"
        attributes={{
          method: 'POST',
          action: `${appConfig.baseUrl}/search`,
        }}
      >
        <div id="search-container">
          <Select
            id="search-by-field"
            onChange={this.onFieldChange}
            selectedOption={this.state.field}
            name="search_scope"
            >
            <option value="all">All fields</option>
            <option value="title">Title</option>
            <option value="journal_title">Journal Title</option>
            <option value="contributor">Author/Contributor</option>
            <option value="standard_number">Standard Numbers</option>
            <option value="subject">Subject</option>
          </Select>
          <Input
            type="text"
            id="search-query"
            aria-label="Search by keyword, title, journal title, or author/contributor"
            aria-controls="results-description"
            placeholder="Keyword, title, journal title, or author/contributor"
            onChange={this.inputChange}
            value={this.state.searchKeywords}
            name="q"
          />
          <SearchButton
            onClick={this.submitSearchRequest}
          />
        </div>
        <div id="advanced-search-link-container">
          <a href={`${appConfig.baseUrl}/search/advanced`}>Advanced Search</a>
        </div>
      </SearchBar>
    );
  }
}

Search.propTypes = {
  field: PropTypes.string,
  searchKeywords: PropTypes.string,
  createAPIQuery: PropTypes.func,
  selectedFilters: PropTypes.object,
  router: PropTypes.object,
  updateSearchKeywords: PropTypes.func,
  updateField: PropTypes.func,
};

Search.defaultProps = {
  field: 'all',
  searchKeywords: '',
  selectedFilters: {},
};

const mapStateToProps = ({
  searchKeywords,
  field,
  selectedFilters,
}) => ({ searchKeywords, field, selectedFilters });

const mapDispatchToProps = dispatch => ({
  updateSearchKeywords: searchKeywords => dispatch(updateSearchKeywords(searchKeywords)),
  updateField: field => dispatch(updateField(field)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Search);
