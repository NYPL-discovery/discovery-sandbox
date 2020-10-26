/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import ItemFilters from './../../src/app/components/Item/ItemFilters';
import item from '../fixtures/libraryItems';
import { locationFilters, statusFilters } from '../fixtures/itemFilterOptions';

const context = {
  router: {
    location: {},
  },
};

describe('ItemFilters', () => {
  describe('default rendering', () => {
    let component;
    it('should not render without an `items` prop', () => {
      component = shallow(<ItemFilters />, { context });
      expect(component.type()).to.equal(null);
    });
  });
  describe('no `items`', () => {
    let component;
    it('should not render with empty `items` prop', () => {
      component = shallow(<ItemFilters items={[]} />, { context });
      expect(component.type()).to.equal(null);
    });
  });
  describe('with valid `items`', () => {
    let component;
    let itemFilters;
    before(() => {
      component = mount(<ItemFilters
        items={[
          item.full,
          item.missingData,
          item.requestable_ReCAP_available,
          item.requestable_ReCAP_not_available,
          item.requestable_nonReCAP_NYPL,
        ]}
      />, { context, childContext: { router: {} } });
      itemFilters = component.find('ItemFilter');
    });

    it('should have an `item-filters` id', () => {
      expect(component.find('#item-filters').length).to.equal(1);
    });
    it('should have three `ItemFilter` components', () => {
      expect(itemFilters.length).to.equal(3);
    });
    it('should have "location", "format", and "status" filters', () => {
      const filterTypes = itemFilters.map(filterComp => filterComp.props().filter);
      expect(filterTypes).to.deep.equal(['location', 'format', 'status']);
    });
    it('should pass locations parsed properly. All offsite location options have ID "offsite"', () => {
      const locationFilter = itemFilters.findWhere(filterComp => filterComp.props().filter === 'location');
      const options = locationFilter.props().options;
      expect(options).to.deep.equal(locationFilters);
      expect(options.every((option) => {
        if (option.label === 'Offsite') return option.id === 'offsite';
        return true;
      })).to.equal(true);
    });
    it('should pass statuses parsed properly. Requestable option has id "requestable"', () => {
      const statusFilter = itemFilters.findWhere(filterComp => filterComp.props().filter === 'status');
      const options = statusFilter.props().options;
      expect(options).to.deep.equal(statusFilters);
      // There are three requestable items
      expect(options.filter(option => option.id === 'requestable').length).to.equal(3);
    });
  });
});
