/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import PropTypes from 'prop-types';

import SearchResultsPage from '../../src/app/pages/SearchResultsPage';
import SearchResultsContainer from '../../src/app/components/SearchResults/SearchResultsContainer';
import { mockRouterContext } from '../helpers/routing';
import { mountTestRender, makeTestStore } from '../helpers/store';
import appConfig from '../../src/app/data/appConfig';


// Eventually, it would be nice to have mocked data in a different file and imported.
const searchResults = {
  '@context': 'http://api.data.nypl.org/api/v1/context_all.jsonld',
  '@type': 'itemList',
  itemListElement: [
    {
      '@type': 'searchResult',
      result: {},
    },
    {
      '@type': 'searchResult',
      result: {},
    },
  ],
  totalResults: 2,
};

const context = mockRouterContext();
const childContextTypes = {
  router: PropTypes.object,
  media: PropTypes.string,
};

describe('SearchResultsPage', () => {
  const mockStore = makeTestStore();
  describe('Component properties', () => {
    let component;
    let wrapper;

    before(() => {
      // Added this empty prop so that the `componentWillMount` method will be skipped.
      // That lifecycle hook is tested later on.
      wrapper = mountTestRender(
        <SearchResultsPage
          searchResults={{}}
          location={{ search: '' }}
        />,
        {
          context,
          childContextTypes,
          store: mockStore,
        },
      );
      component = wrapper.find('SearchResults');
    });

    after(() => {
      wrapper.unmount();
    });

    it('should be wrapped in a .main-page', () => {
      expect(component.find('.main-page')).to.have.length(1);
    });

    it('should render a <Breadcrumbs /> components', () => {
      expect(component.find('Breadcrumbs')).to.have.length(1);
    });

    it('should render a <Search /> components', () => {
      expect(component.find('Search')).to.have.length(1);
    });

    it('should render a <ResultsCount /> components', () => {
      expect(component.find('ResultsCount')).to.have.length(1);
    });

    it('should not render a <SearchResultsSorter /> components, since there are no results', () => {
      expect(component.find('SearchResultsSorter')).to.have.length(0);
    });

    it('should not render a <ResultsList /> components, since there are no results', () => {
      expect(component.find('ResultsList')).to.have.length(0);
    });

    it('should not render a <Pagination /> components, since there are no results', () => {
      expect(component.find('Pagination')).to.have.length(0);
    });

    it('should have empty search results', () => {
      // eql is deep equal
      // In order to test for props, the components needs to be mounted with `enzyme.mount`.
      expect(component.props().searchResults).to.eql({});
    });
  });

  describe('With search results in store', () => {
    let component;
    let wrapper;

    before(() => {
      const storeWithProps = makeTestStore({
        searchKeywords: "locofocos",
        searchResults,
        appConfig: {
          features: [],
          displayTitle: 'Shared Collection Catalog',
          baseUrl: '/',
        },
      });
      wrapper = mountTestRender(
        <SearchResultsPage
          location={{ search: '' }}
        />,
        {
          attachTo: document.body,
          context,
          childContextTypes,
          store: storeWithProps,
        },
      )
      component = wrapper.find('SearchResults');
    });

    after(() => {
      wrapper.unmount();
    });

    it('should render a <SearchResultsSorter /> components', () => {
      expect(component.find('SearchResultsSorter')).to.have.length(1);
    });

    it('should render a <ResultsList /> components', () => {
      expect(component.find('ResultsList')).to.have.length(1);
    });

    it('should render a <Pagination /> components', () => {
      expect(component.find('Pagination')).to.have.length(1);
    });
  });

  describe('DOM structure', () => {
    let component;
    let wrapper;

    before(() => {
      const storeWithProps = makeTestStore({
        searchKeywords: 'locofocos',
        searchResults,
      });
      wrapper = mountTestRender(
        <SearchResultsPage
          location={{ search: '' }}
        />,
        {
          context,
          childContextTypes,
          store: storeWithProps,
        },
      );
      component = wrapper.find('SearchResults');
    });

    after(() => {
      wrapper.unmount();
    });

    it('should have an h1 with display title', () => {
      const h1 = component.find('h1');
      expect(h1).to.have.length(1);
      expect(h1.text()).to.equal(appConfig.displayTitle);
    });
  });

  describe('without DRBB integration', () => {
    let component;
    let wrapper;

    before(() => {
      const storeWithProps = makeTestStore({
        searchKeywords: 'locofocos',
        searchResults,
        appConfig: {
          features: [],
          displayTitle: 'Shared Collection Catalog',
          baseUrl: '/',
        },
      });
      wrapper = mountTestRender(
        <SearchResultsPage
          location={{ search: '' }}
        />,
        {
          attachTo: document.body,
          context,
          childContextTypes,
          store: storeWithProps,
        },
      );
      component = wrapper.find('SearchResults');
    });

    after(() => {
      wrapper.unmount();
    });

    it('should not have any components with .drbb-integration class', () => {
      expect(component.find('.drbb-integration')).to.have.length(0);
    });
  });

  describe('with DRBB integration', () => {
    let component;

    before(() => {
      const storeWithProps = makeTestStore({
        searchKeywords: 'locofocos',
        searchResults,
        features: ['drb-integration'],
        appConfig: {
          displayTitle: 'Shared Collection Catalog',
          baseUrl: '/',
        },
      });
      component = mountTestRender(
        <SearchResultsContainer
          searchKeywords="locofocos"
          searchResults={searchResults}
          location={{ search: '' }}
        />,
        {
          store: storeWithProps,
          context: { media: 'desktop' },
          childContextTypes,
        });
    });

    it('should render a <DrbbContainer /> component', () => {
      expect(component.find('DrbbContainer')).to.have.length(1);
    });

    describe('desktop view', () => {
      it('should have the DrbbContainer above Pagination', () => {
        expect(component.find('.nypl-column-full').childAt(1).html()).to.include('No results found from Digital Research Books Beta');
      });
    });

    describe('tablet/mobile view', () => {
      before(() => {
        const storeWithProps = makeTestStore({
          searchKeywords: 'locofocos',
          searchResults,
          features: ['drb-integration'],
          appConfig: {
            displayTitle: 'Shared Collection Catalog',
            baseUrl: '/',
          },
        });
        component = mountTestRender(
          <SearchResultsContainer
            searchKeywords="locofocos"
            searchResults={searchResults}
            location={{ search: '' }}
          />,
          {
            store: storeWithProps,
            context: { media: 'tablet' },
            childContextTypes,
          });
      });

      // figuring out how to change the new context API in test
      // checked manually 8/26/20
      xit('should have the Pagination above the DrbbContainer', () => {
        expect(component.find('.nypl-column-full').childAt(1).is('Pagination')).to.eql(true);
      });
    });
  });

  describe('with notification', () => {
    let component;
    before(() => {
      const testStore = makeTestStore({
        appConfig: {
          displayTitle: 'Shared Collection Catalog',
          searchResultsNotification: 'Some info for our patrons',
        },
        searchResults,
        searchKeywords: 'locofocos',
      });
      component = mountTestRender(
        <SearchResultsPage />,
        {
          context,
          childContextTypes,
          store: testStore,
        });
    });

    it('should have a `Notification`', () => {
      expect(component.find('Notification').length).to.equal(1);
      expect(component.find('Notification').text()).to.include('Some info for our patrons');
    });
  });
});
