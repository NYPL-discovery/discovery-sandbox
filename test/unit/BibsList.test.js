/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import BibsList from './../../src/app/components/SubjectHeading/BibsList';
import Pagination from './../../src/app/components/Pagination/Pagination';
import resultsBibs from '../fixtures/resultsBibs';
import { mockRouterContext } from '../helpers/routing';
import appConfig from './../../src/app/data/appConfig';

const context = mockRouterContext();

describe('BibsList (for Subject Heading Explorer)', () => {
  describe('before componentDidMount', () => {
    let component;
    before(() => {
      component = shallow(<BibsList />, {
        disableLifecycleMethods: true,
        context,
      });
    });

    it('should render LocalLoadingLayer', () => {
      expect(component.find('LocalLoadingLayer').length).to.equal(1);
    });
  });

  describe('default rendering, no results', () => {
    let component;
    before(() => {
      component = shallow(<BibsList />, { context });
    });

    it('should not render LocalLoadingLayer', () => {
      expect(component.find('LocalLoadingLayer').length).to.equal(0);
    });

    it('should render no results text', () => {
      expect(component.text()).to.include('There are no titles for this subject heading.');
    });
  });

  describe('with props, has results from `shepApi`', () => {
    let component;
    before(() => {
      const mock = new MockAdapter(axios);
      mock.onGet(
        `${appConfig.baseUrl}/api/subjectHeading/${encodeURIComponent('Subject Heading')}?&sort=date&sort_direction=desc&per_page=6&shep_bib_count=100&shep_uuid=1234`
      ).reply(200, {
        newResults: resultsBibs,
        bibsSource: 'shepApi',
        totalResults: 100,
        page: 1,
      });
      component = shallow(
        <BibsList
          label="Subject Heading"
          shepBibCount="100"
          uuid="1234"
        />, { context });
    });

    it('should have `Sorter`', () => {
      expect(component.find('Sorter').length).to.equal(1);
    });

    it('should have `h3`', () => {
      expect(component.find('h3').length).to.equal(1);
    });

    it('should have `ResultsList`', () => {
      expect(component.find('ResultsList').length).to.equal(1);
    });

    // Testing a child component rendered via a function with `shallow` render
    it('`pagination()` should return `Pagination` component', () => {
      const pagination = component.instance().pagination();
      expect(pagination.type).to.equal(Pagination);
    });
  });

  describe('API error', () => {
    let component;
    before(() => {
      const mock = new MockAdapter(axios);
      mock.onGet(
        `${appConfig.baseUrl}/api/subjectHeading/${encodeURIComponent('Will Error')}?&sort=date&sort_direction=desc&per_page=6&shep_bib_count=100&shep_uuid=1234`
      ).reply(404);
      component = shallow(
        <BibsList
          label="Will Error"
          shepBibCount="100"
          uuid="1234"
        />, { context });
    });

    it('should not render LocalLoadingLayer', () => {
      expect(component.find('LocalLoadingLayer').length).to.equal(0);
    });
  });
});
