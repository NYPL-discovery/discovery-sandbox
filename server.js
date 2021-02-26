import path from 'path';
import express from 'express';
import compress from 'compression';
import DocumentTitle from 'react-document-title';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import webpack from 'webpack';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Provider } from 'react-redux';

import appConfig from './src/app/data/appConfig';
import webpackConfig from './webpack.config';
import apiRoutes from './src/server/ApiRoutes/ApiRoutes';
import routes from './src/app/routes/routes';

import initializePatronTokenAuth from './src/server/routes/auth';
import { getPatronData } from './src/server/routes/api';
import nyplApiClient from './src/server/routes/nyplApiClient';
import logger from './logger';
import configureStore from './src/app/stores/configureStore';
import initialState from './src/app/stores/InitialState';
import { updateLoadingStatus } from './src/app/actions/Actions';
import { updatePatronData } from './src/app/actions/Actions';

const ROOT_PATH = __dirname;
const INDEX_PATH = path.resolve(ROOT_PATH, 'src/client');
const DIST_PATH = path.resolve(ROOT_PATH, 'dist');
const VIEWS_PATH = path.resolve(ROOT_PATH, 'src/views');
const WEBPACK_DEV_PORT = appConfig.webpackDevServerPort || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const app = express();

let application;
global.log = [];
app.use(compress());

// Disables the Server response from
// displaying Express as the server engine
app.disable('x-powered-by');

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', VIEWS_PATH);

app.set('port', process.env.PORT || appConfig.port || 3001);

app.use(cookieParser());
// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Set Global publicKey
app.set('nyplPublicKey', appConfig.publicKey);

app.use(`${appConfig.baseUrl}/`, express.static(DIST_PATH));
// For images
app.use('*/src/client', express.static(INDEX_PATH));

app.use('/', (req, res, next) => {
  if (req.path === appConfig.baseUrl || req.path === '/') {
    return res.redirect(`${appConfig.baseUrl}/`);
  }
  return next();
});

app.use('/*', (req, res, next) => {
  req.id = Math.random();
  const initialStore = { ...initialState, lastLoaded: req._parsedUrl.path };
  global.store = configureStore(initialStore);
  global.log.push({
    name: 'intialize',
    store: global.store.getState().patron,
    path: req._parsedUrl.path,
    id: req.id,
  });
  next();
});

// Init the nypl data api client.
nyplApiClient();

app.use('/*', initializePatronTokenAuth, getPatronData);
app.use('/', apiRoutes);

app.get('/*', (req, res) => {
  const appRoutes = (req.url).indexOf(appConfig.baseUrl) !== -1 ? routes.client : routes.server;
  const store = global.store;
  global.log.push({
    name: 'main',
    store: store.getState().patron,
    path: req._parsedUrl.path,
    id: req.id,
  });

  match({ routes: appRoutes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message);
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search);
    } else if (renderProps) {
      store.dispatch(updateLoadingStatus(false));
      store.dispatch(updatePatronData({ ...store.getState().patron, log: global.log }));
      application = ReactDOMServer.renderToString(
        <Provider store={store}>
          <RouterContext {...renderProps} />
        </Provider>,
      );
      const title = DocumentTitle.rewind();
      // store.features.log = global.log;

      res
        .status(200)
        .render('index', {
          application,
          appData: JSON.stringify(store.getState()).replace(/</g, '\\u003c'),
          appTitle: title,
          favicon: appConfig.favIconPath,
          webpackPort: WEBPACK_DEV_PORT,
          path: req.url,
          isProduction,
          log: JSON.stringify(global.log),
          baseUrl: appConfig.baseUrl,
        });
    } else {
      res.status(404).redirect(`${appConfig.baseUrl}/`);
    }
  });
});

const server = app.listen(app.get('port'), (error) => {
  if (error) {
    logger.error(error);
  }

  logger.info(`App - Express server is listening at localhost: ${app.get('port')}.`);
});

// This function is called when you want the server to die gracefully
// i.e. wait for existing connections
const gracefulShutdown = () => {
  logger.info('Received kill signal, shutting down gracefully.');
  server.close(() => {
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });
  // if after
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit();
  }, 1000);
};
// listen for TERM signal .e.g. kill
process.on('SIGTERM', gracefulShutdown);
// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);


/* Development Environment Configuration
 * -------------------------------------
 * - Using Webpack Dev Server
*/
if (!isProduction) {
  const WebpackDevServer = require('webpack-dev-server');

  new WebpackDevServer(webpack(webpackConfig), {
    publicPath: webpackConfig.output.publicPath,
    hot: true,
    stats: false,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3001',
      'Access-Control-Allow-Headers': 'X-Requested-With',
    },
  }).listen(WEBPACK_DEV_PORT, 'localhost', (error) => {
    if (error) {
      logger.error(error);
    }

    logger.info(`Webpack Dev Server listening at localhost: ${WEBPACK_DEV_PORT}.`);
  });
}
