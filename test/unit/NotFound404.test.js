/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import config from '../../src/app/data/appConfig';

import NotFound404 from '../../src/app/components/NotFound404/NotFound404';

describe('NotFound404', () => {
  let component;

  before(() => {
    component = shallow(<NotFound404 />);
  });

  it('should be wrapped in a .not-found-404 class', () => {
    expect(component.find('.not-found-404').length).to.equal(1);
  });

  it('should contain a Link and an `a` element', () => {
    expect(component.find('Link')).to.have.length(1);
    expect(component.find('a')).to.have.length(1);
  });

  it('should contain a link to the homepage', () => {
    expect(component.find('Link').prop('to')).to.equal(`${config.baseUrl}/`);
  });

  it('should contain a link to the old catalog', () => {
    expect(component.find('a').prop('href')).to.equal('https://legacycatalog.nypl.org');
  });
});
