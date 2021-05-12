/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import AdditionalSubjectHeadingsButton from './../../src/app/components/SubjectHeading/AdditionalSubjectHeadingsButton';

describe('AdditionalSubjectHeadingsButton', () => {
  describe('default rendering', () => {
    let component;
    before(() => {
      component = shallow(<AdditionalSubjectHeadingsButton />);
    });

    it('should render a `tr`', () => {
      expect(component.is('tr')).to.equal(true);
    });
  });

  describe('with `linkUrl`', () => {
    let component;
    before(() => {
      component = shallow(
        <AdditionalSubjectHeadingsButton
          linkUrl="linkforheading.com"
        />
      );
    });

    it('should render a `Link`', () => {
      const link = component.find('Link');
      expect(link.length).to.equal(1);
      expect(link.prop('to')).to.equal('linkforheading.com');
    });
  });
});
