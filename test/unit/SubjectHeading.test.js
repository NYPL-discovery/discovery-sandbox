/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import SubjectHeading from './../../src/app/components/SubjectHeading/SubjectHeading';
import appConfig from './../../src/app/data/appConfig';

describe('SubjectHeading', () => {
  describe('default rendering', () => {
    it('should not render without a `subjectHeading` prop', () => {
      const component = shallow(<SubjectHeading />);
      expect(component.isEmptyRender()).to.equal(true);
    });
  });

  describe('Index View', () => {
    describe('no subheadings/descendants', () => {
      let component;
      before(() => {
        component = shallow(
          <SubjectHeading
            subjectHeading={{
              label: 'Testing',
              desc_count: 0,
            }}
            location={{
              query: {},
              pathname: '',
              search: '',
            }}
          />);
      });

      it('should render one `tr`', () => {
        expect(component.find('tr').length).to.equal(1);
      });

      it('should not have a toggle', () => {
        expect(component.find('td').at(0).find('button').length).to.equal(0);
      });

      it('should use "-" placeholder if there are no subheadings', () => {
        expect(component.find('td').at(1).text()).to.equal('-');
      });
    });

    describe('has subheadings/descendants', () => {
      let component;
      before(() => {
        component = shallow(
          <SubjectHeading
            subjectHeading={{
              label: 'Testing',
              desc_count: 10,
              uuid: '1234',
            }}
            location={{
              query: {},
              pathname: '',
              search: '',
            }}
          />);
      });

      it('should render one `tr`', () => {
        expect(component.find('tr').length).to.equal(1);
      });

      it('should have a toggle with `+`', () => {
        const button = component.find('td').at(0).find('button');
        expect(button.length).to.equal(1);
        expect(button.text()).to.equal('+');
      });

      it('should have count in second td', () => {
        expect(component.find('td').at(1).text()).to.equal('10');
      });
    });
  });

  describe('`preOpen` prop', () => {
    let component;
    let mock;
    before(() => {
      mock = new MockAdapter(axios);
      mock
        .onGet(`${appConfig.baseUrl}/api/subjectHeadings/subject_headings/1234/narrower?sort_by=alphabetical&direction=ASC`)
        .reply(200, {
          narrower: [{
            label: 'Testing -- Child',
            desc_count: 1,
            uuid: '1235',
          }],
          next_url: 'nextUrl.com',
        });
      component = shallow(
        <SubjectHeading
          subjectHeading={{
            label: 'Testing',
            desc_count: 10,
            uuid: '1234',
          }}
          location={{
            query: {},
            pathname: '',
            search: '',
          }}
          preOpen
        />);
    });

    it('should render one `tr`', () => {
      expect(component.find('tr').length).to.equal(1);
    });

    it('should have a toggle with `-`', () => {
      const button = component.find('td').at(0).find('button');
      expect(button.length).to.equal(1);
      expect(button.text()).to.equal('-');
    });

    it('should have a `SubjectHeadingsTableBody`', () => {
      expect(component.find('SubjectHeadingsTableBody').length).to.equal(1);
    });
  });
});
