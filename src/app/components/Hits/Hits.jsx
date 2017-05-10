import React from 'react';

import {
  mapObject as _mapObject,
  extend as _extend,
} from 'underscore';

import Actions from '../../actions/Actions.js';
import Store from '../../stores/Store.js';

import {
  ajaxCall,
  getSortQuery,
  getFacetParams,
} from '../../utils/utils.js';

class Hits extends React.Component {
  constructor(props) {
    super(props);

    this.state = _extend({
      spinning: false,
    }, Store.getState());

    this.removeFacet = this.removeFacet.bind(this);
    this.getKeyword = this.getKeyword.bind(this);
    this.onChange = this.onChange.bind(this);
    this.getFacetElements = this.getFacetElements.bind(this);
  }

  componentDidMount() {
    Store.listen(this.onChange);
  }

  componentWillUnmount() {
    Store.unlisten(this.onChange);
  }

  onChange() {
    this.setState(_extend(this.state, Store.getState()));
  }

  getKeyword(keyword) {
    if (keyword) {
      return (
        <span className="nypl-facet">&nbsp;with keywords <strong>{keyword}</strong>
          <button
            onClick={() => this.removeKeyword(keyword)}
            className="remove-keyword"
            aria-controls="results-region"
          >
            <span className="hidden">remove keyword filter&nbsp;{keyword}</span>
          </button>
        </span>
      );
    }

    return null;
  }

  getFacetElements(facets) {
    if (!facets.length) return null;

    return facets.map((facet, i) => (
      <span key={i} className="nypl-facet">&nbsp;with {facet.key} <strong>{facet.val.value}</strong>
        <button
          onClick={() => this.removeFacet(facet.key)}
          className="remove-facet"
          aria-controls="results-region"
        >
          <span className="hidden">remove filter&nbsp;{facet.val.value}</span>
        </button>
      </span>
    ));
  }

  removeKeyword() {
    Actions.updateSpinner(true);
    Actions.updateSearchKeywords('');

    const sortQuery = getSortQuery(this.props.sortBy);
    const strSearch = getFacetParams(this.props.facets);

    ajaxCall(`/api?q=${strSearch}${sortQuery}`, (response) => {
      Actions.updateSearchResults(response.data.searchResults);
      Actions.updateFacets(response.data.facets);
      Actions.updatePage('1');
      this.context.router.push(`/search?q=${strSearch}${sortQuery}`);
      Actions.updateSpinner(false);
    });
  }

  removeFacet(field) {
    Actions.updateSpinner(true);
    Actions.removeFacet(field);

    const sortQuery = getSortQuery(this.props.sortBy);
    const strSearch = getFacetParams(this.props.facets, field);

    ajaxCall(`/api?q=${this.props.query}${strSearch}${sortQuery}`, (response) => {
      Actions.updateSearchResults(response.data.searchResults);
      Actions.updateFacets(response.data.facets);
      Actions.updatePage('1');
      this.context.router.push(`/search?q=${this.props.query}${strSearch}${sortQuery}`);
      Actions.updateSpinner(false);
    });
  }

  render() {
    const {
      facets,
      hits,
      query,
    } = this.props;
    const activeFacetsArray = [];
    const hitsF = hits ? hits.toLocaleString() : '';

    _mapObject(facets, (val, key) => {
      if (val.value) {
        activeFacetsArray.push({ val, key });
      }
    });

    const keyword = this.getKeyword(query);
    const activeFacetsElm = this.getFacetElements(activeFacetsArray);

    return (
      <div id="results-description" className="nypl-results-summary">
        {
          this.state.spinning ?
            (<p><strong className="nypl-results-count">Loading…</strong></p>)
          :
            hits !== 0 ?
          (<p><strong className="nypl-results-count">{hitsF}</strong> results found{keyword}{activeFacetsElm}</p>)
          : (<p>No results found{keyword}{activeFacetsElm}.</p>)
        }
      </div>
    );
  }
}

Hits.propTypes = {
  hits: React.PropTypes.number,
  query: React.PropTypes.string,
  facets: React.PropTypes.object,
  sortBy: React.PropTypes.string,
};

Hits.defaultProps = {
  hits: 0,
};

Hits.contextTypes = {
  router: function contextType() {
    return React.PropTypes.func.isRequired;
  },
};

export default Hits;
