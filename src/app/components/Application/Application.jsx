/* global window */
import React from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from 'react-document-title';
import { Header, navConfig } from '@nypl/dgx-header-component';
import Footer from '@nypl/dgx-react-footer';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { union as _union } from 'underscore';

import Feedback from '../Feedback/Feedback';
import LoadingLayer from '../LoadingLayer/LoadingLayer';
import DataLoader from '../DataLoader/DataLoader';
import appConfig from '../../data/appConfig';

import { updateFeatures } from '../../actions/Actions';

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

    const urlEnabledFeatures = query.features ? query.features.split(',') : null;
    if (urlEnabledFeatures) {
      const urlFeatures = urlEnabledFeatures.filter(
        urlFeat => !appConfig.features.includes(urlFeat));
      const urlFeaturesString = urlFeatures.join(',');
      if (urlFeaturesString) this.state.urlEnabledFeatures = urlFeaturesString;
      if (urlFeatures.some(urlFeat => !this.props.features.includes(urlFeat))) {
        const allFeatures = _union(this.props.features, urlFeatures);
        this.props.updateFeatures(allFeatures);
      };
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.onWindowResize();
    console.log(JSON.stringify(this.props.patron.log, null, 2));
    const { router } = this.context;
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

    const breakpoint = breakpoints.find(breakpoint => innerWidth <= breakpoint.maxValue);
    const newMedia = breakpoint && breakpoint.media ? breakpoint.media : 'desktop';
    if (media !== newMedia) this.setState({ media: newMedia });
  }

  render() {
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
              loading={this.props.loading}
            />
            <DataLoader
              location={this.context.router.location}
              key={JSON.stringify(dataLocation)}
            >
              {React.cloneElement(this.props.children)}
            </DataLoader>
            <Footer />
            <Feedback />
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
  features: PropTypes.array,
};

Application.defaultProps = {
  children: {},
};

Application.contextTypes = {
  router: PropTypes.object,
};

const mapStateToProps = ({ patron, loading, features }) => ({ patron, loading, features });

const mapDispatchToProps = dispatch => ({
  updateFeatures: features => dispatch(updateFeatures(features)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));
