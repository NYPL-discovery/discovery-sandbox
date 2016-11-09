import React from 'react';
import axios from 'axios';

import DateRange from './DateRange.jsx';
import Actions from '../../actions/Actions.js';

import { mapObject as _mapObject } from 'underscore';

class FacetSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.props.facets.map(facet => {
      this.state[facet.field] = {
        id: '',
        value: '',
      };
    });

    this.routeHandler = this.routeHandler.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e, field, location) {
    const filter = e.target.value.split('_');
    console.log(filter);
    this.setState({
      [field]: {
        id: filter[0],
        value: filter[1],
      },
    });

    let strSearch = '';
    _mapObject(this.state, (val, key) => {
      if (val.value !== '' && field !== key) {
        strSearch += ` ${key}:"${val.value}"`;
      } else if (field === key) {
        strSearch += `${field}:"${filter[0]}"`;
      }
    })

    axios
      .get(`/api?q=${this.props.keywords} ${strSearch}`)
      .then(response => {
        Actions.updateSearchResults(response.data.searchResults);
        Actions.updateFacets(response.data.facets);
        Actions.updateSelectedFacets(this.state);
        this.routeHandler(`/search?q=${this.props.keywords} ${strSearch}`);
      })
      .catch(error => {
        console.log(error);
      });
  }

  routeHandler(path) {
    // e.preventDefault();
    // Actions.updateSearchKeywords('');
    this.context.router.push(path);
  }

  render() {
    const facets = this.props.facets;
    const location = this.props.location;
    let facetsElm = null;
    let dateRange = null;

    if (facets.length) {
      facetsElm = facets.map((facet, i) => {
        const field = facet.field;

        if (facet.values.length <= 1) { return null; }
        // if (field === 'dates') {
        //   dateRange = facet;
        //   return null;
        // }

        return (
          <fieldset key={i}>
            <label htmlFor={`select-${field}`}>{facet.field}</label>
            <select name={`select-${field}`} onChange={(e) => this.onChange(e, field, location)}>
              <option value={`${field}_any`}>Any</option>
              {
                facet.values.map((f, j) => {
                  let selectLabel = f.value;
                  if (f.label) {
                    selectLabel = f.label;
                  }

                  return (
                    <option key={j} value={`${f.value}_${selectLabel}`}>
                      {selectLabel} ({f.count})
                    </option>
                  );
                })
              }
            </select>
          </fieldset>
        );
      });
    }

    return (
      <div className="facets">
        <form className="facets-form">
          <h2>Filter results by</h2>
          <fieldset>
            <label htmlFor="select-keywords">Keywords</label>
            <button
              id="select-keywords"
              className="button-selected"
              title={`Remove keyword filter: ${this.props.keywords}`}
            >
              "{this.props.keywords}"
            </button>
          </fieldset>

          {facetsElm}
          
        </form>
      </div>
    );
  }
}

FacetSidebar.propTypes = {
  facets: React.PropTypes.array,
  keywords: React.PropTypes.string,
};

FacetSidebar.contextTypes = {
  router: function contextType() {
    return React.PropTypes.func.isRequired;
  },
};

export default FacetSidebar;
