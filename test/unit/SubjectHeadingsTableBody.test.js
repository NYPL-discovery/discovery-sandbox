/* eslint-env mocha */
/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import SubjectHeadingsTableBody from './../../src/app/components/SubjectHeading/SubjectHeadingsTableBody';
import { mockRouterContext } from '../helpers/routing';

describe('SubjectHeadingsTableBody', () => {
  const routerContext = mockRouterContext();
  describe('default render', () => {
    it('should not render without `subjectHeadings`', () => {
      const component = shallow(<SubjectHeadingsTableBody />);
      expect(component.isEmptyRender()).to.equal(true);
    });
  });

  describe('with `subjectHeadings`', () => {
    describe('one subject heading', () => {
      it('should render one `SubjectHeading`', () => {
        const component = shallow(
          <SubjectHeadingsTableBody
            subjectHeadings={[
              {
                label: 'Testing',
                desc_count: 10,
                uuid: '1234',
              },
            ]}
          />, {
            context: routerContext,
          });
        expect(component.find('SubjectHeading').length).to.equal(1);
      });
    });

    describe('multiple subject headings', () => {
      it('should render multiple `SubjectHeading`s, wrapped in `Fragment`', () => {
        const component = shallow(
          <SubjectHeadingsTableBody
            subjectHeadings={[
              {
                label: 'Testing',
                desc_count: 10,
                uuid: '1234',
              },
              {
                label: 'Test',
                desc_count: 10,
                uuid: '1235',
              }
            ]}
          />, {
            context: routerContext,
          });
        expect(component.is('Fragment')).to.equal(true);
        expect(component.find('SubjectHeading').length).to.equal(2);
      });
    });

    describe('nested subject headings table', () => {
      it('should render `NestedTableHeader`', () => {
        const component = shallow(
          <SubjectHeadingsTableBody
            subjectHeadings={[
              {
                label: 'Testing',
                desc_count: 10,
                uuid: '1234',
              }
            ]}
            nested
          />, {
            context: routerContext,
          });
        expect(component.is('Fragment')).to.equal(true);
        expect(component.find('NestedTableHeader').length).to.equal(1);
      });
    });

    describe('With a `nextUrl`', () => {
      it('should render `AdditionalSubjectHeadingsButton` with `next` button', () => {
        const component = shallow(
          <SubjectHeadingsTableBody
            subjectHeadings={[
              {
                label: 'Testing',
                desc_count: 10,
                uuid: '1234',
              }
            ]}
            nextUrl="nextHeadings.com"
          />, {
            context: {
              ...routerContext,
            },
          });
        const additionalSubjectHeadingsButton = component.find('AdditionalSubjectHeadingsButton');
        expect(additionalSubjectHeadingsButton.length).to.equal(1);
        expect(additionalSubjectHeadingsButton.prop('button')).to.equal('next');
      });

      it('context view, should render `AdditionalSubjectHeadingsButton` with `contextMore` button', () => {
        const component = shallow(
          <SubjectHeadingsTableBody
            subjectHeadings={[
              {
                label: 'Testing',
                desc_count: 10,
                uuid: '1234',
              }
            ]}
            nextUrl="nextHeadings.com"
          />, {
            context: {
              ...routerContext,
              container: 'context',
            },
          });
        const additionalSubjectHeadingsButton = component.find('AdditionalSubjectHeadingsButton');
        expect(additionalSubjectHeadingsButton.length).to.equal(1);
        expect(additionalSubjectHeadingsButton.prop('button')).to.equal('contextMore');
      });
    });
  });
});
