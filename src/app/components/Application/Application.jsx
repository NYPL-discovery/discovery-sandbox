/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Header, navConfig } from '@nypl/dgx-header-component';
import Footer from '@nypl/dgx-react-footer';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import Feedback from '../Feedback/Feedback';
import LoadingLayer from '../LoadingLayer/LoadingLayer';
import DataLoader from '../DataLoader/DataLoader';
import appConfig from '../../data/appConfig';

import { addFeatures } from '../../actions/Actions';

import { breakpoints } from '../../data/constants';

export const MediaContext = React.createContext('desktop');

export class Application extends React.Component {
  constructor(props, context) {
    super(props, context);
    const {
      query,
    } = context.router.location;
    this.state = {
      media: 'desktop',
    };
    this.submitFeedback = this.submitFeedback.bind(this);

    const urlEnabledFeatures = query.features ? query.features.split(',') : null;
    if (urlEnabledFeatures) {
      const urlFeatures = urlEnabledFeatures.filter(
        urlFeat => !appConfig.features.includes(urlFeat));
      const urlFeaturesString = urlFeatures.join(',');
      if (urlFeaturesString) this.state.urlEnabledFeatures = urlFeaturesString;
      if (urlFeatures) this.props.addFeatures(urlFeatures);
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.onWindowResize();
    const { router } = this.context;
    console.log('this.state.urlEnabledFeatures', this.state.urlEnabledFeatures);
    if (this.state.urlEnabledFeatures) {
      router.listen(() => {
        const {
          pathname,
          query,
        } = router.location;
        if (query.features !== this.state.urlEnabledFeatures) {
          router.replace({
            pathname,
            query: Object.assign(query, { features: this.state.urlEnabledFeatures }),
          });
        }
      });
    }
  }

  onWindowResize() {
    const { media } = this.state;
    const { innerWidth } = window;
    const {
      xtrasmall,
      tabletPortrait,
      tablet,
    } = breakpoints;

    if (innerWidth <= xtrasmall) {
      if (media !== 'mobile') this.setState({ media: 'mobile' });
    } else if (innerWidth <= tabletPortrait) {
      if (media !== 'tabletPortrait') this.setState({ media: 'tabletPortrait' });
    } else if (innerWidth <= tablet) {
      if (media !== 'tablet') this.setState({ media: 'tablet' });
    } else {
      if (media !== 'desktop') this.setState({ media: 'desktop' });
    }
  }

  submitFeedback(callback, e) {
    e.preventDefault();
    const { pathname, hash, search } = this.context.router.location;
    const currentURL = `${pathname}${hash}${search}`;

    callback(currentURL);
  }

  render() {
    console.log('from Application, appConfig.features', appConfig.features);
    // dataLocation is passed as a key to DataLoader to ensure it reloads
    // whenever the location changes.
    const dataLocation = Object.assign(
      {},
      this.context.router.location,
      {
        hash: null,
        action: null,
        key: null,
      },
    );

    return (
      <MediaContext.Provider value={this.state.media}>
        <DocumentTitle title="Shared Collection Catalog | NYPL">
          <div className="app-wrapper">
            <Header
              navData={navConfig.current}
              patron={this.props.patron}
              skipNav={{ target: 'mainContent' }}
            />
            <LoadingLayer
              title="Loading"
              loading={this.props.loading}
            />
            <DataLoader
              location={this.context.router.location}
              key={JSON.stringify(dataLocation)}
            >
              {React.cloneElement(this.props.children)}
            </DataLoader>
            <Footer />
            <Feedback submit={this.submitFeedback} />
          </div>
        </DocumentTitle>
      </MediaContext.Provider>
    );
  }
}

Application.propTypes = {
  children: PropTypes.object,
  patron: PropTypes.object,
  loading: PropTypes.bool,
};

Application.defaultProps = {
  children: {},
};

Application.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = ({ patron, loading, features }) => ({ patron, loading, features });

const mapDispatchToProps = dispatch => ({
  addFeatures: features => dispatch(addFeatures(features)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));
