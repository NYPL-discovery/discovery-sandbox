/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';

import NestedTableHeader from './../../src/app/components/SubjectHeading/NestedTableHeader';

describe('NestedTableHeader', () => {
  describe('default rendering', () => {
    let component;
    before(() => {
      component = mount(<NestedTableHeader />, {
        attachTo: document.createElement('tbody'),
      });
    });
    it('should render a `tr`', () => {
      expect(component.find('tr').length).to.equal(1);
    });

    it('should render 3 `th`s', () => {
      const ths = component.find('th');
      expect(ths.length).to.equal(3);
      expect(ths.at(0).text()).to.equal('Heading');
      expect(ths.at(1).text()).to.equal('Subheadings');
      expect(ths.at(2).text()).to.equal('Titles');
    });
  });
});
