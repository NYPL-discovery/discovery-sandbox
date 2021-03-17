/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import initialState from '../../src/app/stores/InitialState';

const TestProvider = ({
  store,
  children,
}) => <Provider store={store}>{children}</Provider>;

function testRender(ui, renderFunc, { store, ...otherOpts }) {
  return renderFunc(<TestProvider store={store}>{ui}</TestProvider>, {
    context: {
      router: {
        location: {},
        createHref: () => {},
        push: () => {},
      },
    },
    ...otherOpts,
  });
}

export const shallowTestRender = (ui, { store, ...otherOpts }) => testRender(
  ui,
  shallow,
  { store, ...otherOpts },
);

export const mountTestRender = (ui, { store, ...otherOpts }) => testRender(
  ui,
  mount,
  { store, ...otherOpts },
);

export function makeTestStore(state = {}) {
  const mockStore = configureStore([thunk]);
  return mockStore({
    ...initialState,
    ...state,
    features: (state.features || []),
    appConfig: {
      ...initialState.appConfig,
      ...state.appConfig,
    },
  });
}
