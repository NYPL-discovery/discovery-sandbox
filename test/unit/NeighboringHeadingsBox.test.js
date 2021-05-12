/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import NeighboringHeadingsBox from './../../src/app/components/SubjectHeading/NeighboringHeadingsBox';

describe('NeighboringHeadingsBox', () => {
  describe('default rendering', () => {
    it('should render a `SubjectHeadingsTable`', () => {
      const component = shallow(<NeighboringHeadingsBox />);
      expect(component.find('SubjectHeadingsTable').length).to.equal(1);
    });
  });

  describe('with `contextError` true', () => {
    it('should render error text', () => {
      const component = shallow(<NeighboringHeadingsBox contextError />);
      expect(component.text()).to.include('Error loading neighboring headings');
    });
  });

  describe('with `contextIsLoading` true', () => {
    it('should render error text', () => {
      const component = shallow(<NeighboringHeadingsBox contextIsLoading />);
      expect(component.find('LocalLoadingLayer').length).to.equal(1);
    });
  });
});
