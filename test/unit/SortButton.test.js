/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import SortButton from './../../src/app/components/SubjectHeading/SortButton';

describe('SortButton', () => {
  describe('default rendering', () => {
    it('should not render without a `type`', () => {
      const component = shallow(<SortButton />);
      expect(component.isEmptyRender()).to.equal(true);
    });
  });

  describe('with props', () => {
    it('should render disabled button with text with just valid `type` prop', () => {
      const component = shallow(<SortButton type="alphabetical" />);
      const button = component.find('button');
      expect(button.length).to.equal(1);
      expect(button.prop('disabled')).to.equal(true);
      expect(button.text()).to.equal('Heading');
    });
    it('should not render with unsupported `type` prop', () => {
      const component = shallow(<SortButton type="not-a-type" />);
      expect(component.isEmptyRender()).to.equal(true);
    });
    describe('icons, when `interactive` and `handler` props are truthy', () => {
      it('should render `DefaultIcon` for inactive sort type', () => {
        const component = shallow(
          <SortButton
            type="alphabetical"
            active={false}
            handler={() => {}}
            interactive
          />);
        expect(component.find('DefaultIcon').length).to.equal(1);
      });

      it('should render `DefaultIcon` for inactive sort type', () => {
        const component = shallow(
          <SortButton
            type="alphabetical"
            active={false}
            handler={() => {}}
            interactive
          />);
        expect(component.find('DefaultIcon').length).to.equal(1);
      });

      it('should render `DescendingIcon` for default alphabetical/"Heading" sort', () => {
        const component = shallow(
          <SortButton
            type="alphabetical"
            active
            handler={() => {}}
            interactive
          />);
        expect(component.find('DescendingIcon').length).to.equal(1);
      });

      it('should render `AscendingIcon` for default bibs/"Titles" sort', () => {
        const component = shallow(
          <SortButton
            type="bibs"
            active
            handler={() => {}}
            interactive
          />);
        expect(component.find('AscendingIcon').length).to.equal(1);
      });

      it('should render `AscendingIcon` for default descendants/"Subheadings" sort', () => {
        const component = shallow(
          <SortButton
            type="descendants"
            active
            handler={() => {}}
            interactive
          />);
        expect(component.find('AscendingIcon').length).to.equal(1);
      });
    });
  });
});
