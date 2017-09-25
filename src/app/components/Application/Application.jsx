import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { pick as _pick } from 'underscore';

import { Header, navConfig } from '@nypl/dgx-header-component';
import Footer from '@nypl/dgx-react-footer';

import Feedback from '../Feedback/Feedback.jsx';
import Store from '../../stores/Store.js';
import PatronStore from '../../stores/PatronStore.js';
import {
  ajaxCall,
  createAppHistory,
  destructureFilters,
} from '../../utils/utils.js';
import Actions from '../../actions/Actions.js';
import appConfig from '../../../../appConfig.js';

const history = createAppHistory();

// Listen to the browser's navigation buttons.
history.listen(location => {
  const {
    action,
    search,
    query,
  } = location;

  const qParameter = query.q;
  const urlFilters = _pick(query, (value, key) => {
    if (key.indexOf('filter') !== -1) {
      return value;
    }
    return null;
  });

  if (action === 'POP' && search) {
    ajaxCall(`${appConfig.baseUrl}/api${decodeURI(search)}`, (response) => {
      if (response.data.facets && response.data.searchResults) {
        const selectedFilters = destructureFilters(urlFilters, response.data.facets);
        Actions.updateSelectedFilters(selectedFilters);
        Actions.updateFilters(response.data.facets);
        Actions.updateSearchResults(response.data.searchResults);
        if (qParameter) Actions.updateSearchKeywords(qParameter);
      }
    });
  }
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: Store.getState(),
      patron: PatronStore.getState(),
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillMount() {
    if (!this.state.data.searchResults) {
      ajaxCall(`${appConfig.baseUrl}/api?q=${this.state.data.searchKeywords}`, (response) => {
        Actions.updateSearchResults(response.data.searchResults);
        Actions.updateSearchKeywords(this.state.data.searchKeywords);
      });
    }
  }

  componentDidMount() {
    Store.listen(this.onChange);
  }

  componentWillUnmount() {
    Store.unlisten(this.onChange);
  }

  onChange() {
    this.setState({ data: Store.getState() });
  }

  render() {
    return (
      <DocumentTitle title="Shared Collection Catalog | NYPL">
        <div className="app-wrapper">
          <Header
            navData={navConfig.current}
            skipNav={{ target: 'mainContent' }}
            patron={this.state.patron}
          />

          {React.cloneElement(this.props.children, this.state.data)}

          <Footer />

          <Feedback location={this.props.location} />
        </div>
      </DocumentTitle>
    );
  }
}

App.propTypes = {
  children: PropTypes.object,
  location: PropTypes.object,
};

App.contextTypes = {
  router: PropTypes.object,
};


export default App;
