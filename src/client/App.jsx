/* global loadA11y */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, useRouterHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import FeatureFlags from 'dgx-feature-flags';
// import { ga } from 'dgx-react-ga';
import a11y from 'react-a11y';

import alt from '../app/alt.js';
import Iso from 'iso';

import './styles/main.scss';

import routes from '../app/routes/routes.jsx';
import appConfig from '../../appConfig.js';

if (loadA11y) {
  a11y(React, { ReactDOM, includeSrcNode: true });
}

window.onload = () => {
  // Used to activate/deactivate AB tests on global namespace.
  if (!window.dgxFeatureFlags) {
    window.dgxFeatureFlags = FeatureFlags.utils;
  }

  // Used for debugging
  // ga.initialize('UA-1420324-144', { debug: true });

  // Render Isomorphically
  Iso.bootstrap((state, container) => {
    alt.bootstrap(state);

    const appHistory = useScroll(useRouterHistory(createBrowserHistory))();
    const appRoutes = (window.location.pathname).indexOf(appConfig.baseUrl) !== -1 ?
      routes.client : routes.server;

    ReactDOM.render(
      <Router history={appHistory}>{routes.client}</Router>,
      container
    );
  });
};
