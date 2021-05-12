/* eslint-env mocha */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { expect } from 'chai';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import SubjectHeadingsIndex from '@SubjectHeadingsIndex';
import SubjectHeadingsIndexPage from './../../src/app/pages/SubjectHeadingsIndexPage';
import { mockRouterContext } from '../helpers/routing';

describe('SubjectHeadingsIndexPage', () => {
  let component;
  before(() => {
    component = shallow(
      <SubjectHeadingsIndexPage
        location={{
          search: '',
          query: {
            filter: '',
          },
        }}
      />);
  });
  it('should render `SubjectHeadingSearch`', () => {
    expect(component.find('SubjectHeadingSearch').length).to.equal(1);
  });
});

describe('SubjectHeadingsIndex', () => {
  const context = mockRouterContext();
  let component;
  let mock;
  describe('Unfiltered index', () => {
    before(() => {
      mock = new MockAdapter(axios);
      mock
        .onGet('/research/collections/shared-collection-catalog/api/subjectHeadings/subject_headings?from_comparator=start&from_label=Aac')
        .reply(200, {
          subject_headings: [{
            label: 'Testing -- Related',
            desc_count: 1,
            uuid: '1234',
          }],
          previous_url: 'previous.com',
          next_url: 'next.com',
        });
    });
    it('should render `Alphabetical Pagination`', () => {
      component = mount(
        <SubjectHeadingsIndex />,
        { context });
      expect(component.find('AlphabeticalPagination').length).to.equal(1);
    });
  });

  describe('Filtered index', () => {
    it('should not render `Alphabetical Pagination`', () => {
      context.router.location.query.filter = 'pottery';
      component = mount(
        <SubjectHeadingsIndex />,
        { context },
      );
      expect(component.find('AlphabeticalPagination').length).to.equal(0);
      context.router.location.query.filter = undefined;
    });
  });
});
