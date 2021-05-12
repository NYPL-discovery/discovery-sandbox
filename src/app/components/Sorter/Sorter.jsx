import React from 'react';
import PropTypes from 'prop-types';

class Sorter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortValue: props.sortBy,
      js: false,
    };

    this.updateSortValue = this.updateSortValue.bind(this);
    this.generateSortOptions = this.generateSortOptions.bind(this);
  }

  componentDidMount() {
    this.setState({
      js: true,
    });
  }

  /**
   * updateSortValue(e)
   * The fuction listens to the event of changing the input of sort options.
   * It then sets the state with the callback function of making a new search.
   *
   * @param {Event} e
   */
  updateSortValue(e) {
    e.preventDefault();
    const sortValue = e.target.value;

    const sortParams = sortValue.split("_")
    sortParams.sort = sortParams[0]
    sortParams.sortDirection = sortParams[1]

    this.setState({ sortValue }, this.props.updateResults(sortParams));
  }

  /**
   * renderResultsSort()
   * The fuction that makes renders the sort options.
   *
   * @return {HTML Element}
   */
  generateSortOptions() {
    return this.props.sortOptions.map(d => (
      <option value={d.val} key={d.val}>
        {d.label}
      </option>
    ));
  }

  render() {
    const { sortValue } = this.state;

    return (
      <div className="nypl-results-sorting-controls">
        <div className={`nypl-results-sorter ${this.props.page}`}>
          <div className="nypl-select-field-results">
            <label htmlFor="sort-by-label">Sort by</label>
            <form>
              <span className="nypl-omni-fields">
                <strong>
                  <select
                    id="sort-by-label"
                    onChange={this.updateSortValue}
                    value={sortValue}
                    name="sort_scope"
                  >
                    {this.generateSortOptions()}
                  </select>
                </strong>
              </span>
              {!this.state.js && <input type="submit" />}
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Sorter.propTypes = {
  sortBy: PropTypes.string,
  page: PropTypes.string,
};

Sorter.contextTypes = {
  router: PropTypes.object,
};

export default Sorter;
