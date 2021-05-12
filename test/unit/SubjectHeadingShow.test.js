/* eslint-env mocha */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import SubjectHeadingShow from '@SubjectHeadingShow';
import SubjectHeadingShowPage from './../../src/app/pages/SubjectHeadingShowPage';

describe('SubjectHeadingShowPage', () => {
  let component;

  before(() => {
    component = shallow(
      <SubjectHeadingShowPage
        params={{ subjectHeadingUuid: '1234' }}
        location={{ query: '' }}
      />);
  });
  it('should render `SubjectHeadingSearch`', () => {
    expect(component.find('SubjectHeadingSearch').length).to.equal(1);
  });
});

describe('SubjectHeadingShow', () => {
  let instance;
  let mock;
  let component;
  before(() => {
    mock = new MockAdapter(axios);
    mock
      .onGet('/research/collections/shared-collection-catalog/api/subjectHeadings/subject_headings/1/context')
      .reply(200, {
        subject_headings: [{
          label: 'Testing -- Related',
          desc_count: 1,
          uuid: '1234',
        }],
        main_heading: {
          label: 'Testing -- Related',
          bib_count: 1,
          uuid: '1235',
        },
      });
    mock
      .onGet('/research/collections/shared-collection-catalog/api/subjectHeadings/subject_headings/1/related')
      .reply(200, {
        related_headings: [{
          label: 'Testing -- Related',
          desc_count: 1,
          uuid: '1234',
        }],
      });

    const params = {
      subjectHeadingUuid: '1',
    };
    component = shallow(
      <SubjectHeadingShow params={params} setBannerText={() => {}} />,
      { context: { router: { location: { search: '', pathname: '' } } } },
    );
    instance = component.instance();
  });

  describe('finding uuid', () => {
    it('should accept a list containing a subject heading with correct uuid', () => {
      const headings = [
        { uuid: '2' }, { uuid: '1' }, { uuid: '3' },
      ];
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept a list containing a nested subject heading with correct uuid', () => {
      const headings = [
        { uuid: '2' }, { uuid: '4' }, { uuid: '3', children: [{ uuid: '1' }] },
      ];
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept an object with correct uuid', () => {
      const headings = { uuid: '1' };
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should accept an object containing a nested subject heading with correct uuid', () => {
      const headings = { uuid: '3', children: [{ uuid: '4', children: [{ uuid: '1' }] }] };
      expect(instance.hasUuid(headings)).to.equal(true);
    });

    it('should reject an object if no subject heading has the correct id', () => {
      const headings = { uuid: '3', children: [{ uuid: '4', children: [{ uuid: '6' }] }] };
      expect(instance.hasUuid(headings)).to.equal(false);
    });

    it('should reject a list if no subject heading has the correct id', () => {
      const headings = [
        { uuid: '2' }, { uuid: '4' }, { uuid: '3', children: [{ uuid: '5' }] },
      ];
      expect(instance.hasUuid(headings)).to.equal(false);
    });
  });

  describe('should not have .drbb-integration classes', () => {
    it('should not have any components with .drbb-integration class', () => {
      expect(component.find('.drbb-integration')).to.have.length(0);
    });
  });
});
