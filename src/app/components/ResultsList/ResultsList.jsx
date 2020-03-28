import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import {
  isEmpty as _isEmpty,
  isArray as _isArray,
} from 'underscore';


// eslint-disable-next-line import/first, import/no-unresolved, import/extensions
import Store from '@Store'
import LibraryItem from '../../utils/item';
import {
  trackDiscovery,
} from '../../utils/utils';
import ItemTable from '../Item/ItemTable';
import appConfig from '../../data/appConfig';

class ResultsList extends React.Component {
  constructor(props) {
    super(props);

    this.getItemRecord = this.getItemRecord.bind(this);
  }

  /*
   * getItemRecord(e, bibId, itemId)
   * @description Get updated information for an item along with its delivery locations.
   * And then route the patron to the hold request page.
   * @param {object} e Event object.
   * @param {string} bibId The bib's id.
   * @param {string} itemId The item's id.
   */
  getItemRecord(e, bibId, itemId) {
    e.preventDefault();
    this.context.router.push(`${appConfig.baseUrl}/hold/request/${bibId}-${itemId}`);
    trackDiscovery('Item Request', 'Search Results');
  }

  getBibTitle(bib) {
    if (!bib.titleDisplay || !bib.titleDisplay.length) {
      const author = bib.creatorLiteral && bib.creatorLiteral.length ?
        ` / ${bib.creatorLiteral[0]}` : '';
      return bib.title && bib.title.length ? `${bib.title[0]}${author}` : '';
    }
    return bib.titleDisplay[0];
  }

  getYearDisplay(bib) {
    if (_isEmpty(bib)) return null;

    let dateStartYear = bib.dateStartYear;
    let dateEndYear = bib.dateEndYear;

    dateStartYear = dateStartYear === 999 ? 'unknown' : dateStartYear;
    dateEndYear = dateEndYear === 9999 ? 'present' : dateEndYear;

    if (dateStartYear && dateEndYear) {
      return (<li className="nypl-results-date">{dateStartYear}-{dateEndYear}</li>);
    } else if (dateStartYear) {
      return (<li className="nypl-results-date">{dateStartYear}</li>);
    }
    return null;
  }

  generateBibLi(bib, i) {
    // eslint-disable-next-line no-mixed-operators
    if (_isEmpty(bib) || bib.result && (_isEmpty(bib.result) || !bib.result.title)) {
      return null;
    }

    const result = bib.result || bib;
    const bibTitle = this.getBibTitle(result);
    const bibId = result && result['@id'] ? result['@id'].substring(4) : '';
    const materialType = result && result.materialType && result.materialType[0] ?
      result.materialType[0].prefLabel : null;
    const yearPublished = this.getYearDisplay(result);
    const publicationStatement = result.publicationStatement && result.publicationStatement.length ?
      result.publicationStatement[0] : '';
    const items = LibraryItem.getItems(result);
    const totalItems = items.length;
    const hasRequestTable = items.length === 1;

    let bibUrl = `${appConfig.baseUrl}/bib/${bibId}`;

    const searchKeywords = this.props.searchKeywords || Store.getState().searchKeywords;
    if (searchKeywords) bibUrl += `?searchKeywords=${searchKeywords}`;

    return (
      <li key={i} className={`nypl-results-item ${hasRequestTable ? 'has-request' : ''}`}>
        <h3>
          <Link
            onClick={() => trackDiscovery('Bib', bibTitle)}
            to={bibUrl}
            className="title"
          >
            {bibTitle}
          </Link>
        </h3>
        <div className="nypl-results-item-description">
          <ul>
            <li className="nypl-results-media">{materialType}</li>
            <li className="nypl-results-publication">{publicationStatement}</li>
            {yearPublished}
            <li className="nypl-results-info">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </li>
          </ul>
        </div>
        {
          hasRequestTable &&
          <ItemTable
            items={items}
            bibId={bibId}
            getRecord={this.getItemRecord}
            id={null}
            searchKeywords={this.props.searchKeywords}
          />
        }
      </li>
    );
  }

  render() {
    const results = this.props.results;
    let resultsElm = null;

    if (!results || !_isArray(results) || !results.length) {
      return null;
    }

    resultsElm = results.map((bib, i) => this.generateBibLi(bib, i));

    return (
      <ul
        id="nypl-results-list"
        className={`nypl-results-list ${Store.state.isLoading ? 'hide-results-list ' : ''}`}
      >
        {resultsElm}
      </ul>
    );
  }
}

ResultsList.propTypes = {
  results: PropTypes.array,
  searchKeywords: PropTypes.string,
};

ResultsList.contextTypes = {
  router: PropTypes.object,
};

export default ResultsList;