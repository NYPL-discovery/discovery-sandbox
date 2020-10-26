/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { stub } from 'sinon';

import WrappedApplication, { Application } from '@Application';
import { Header, navConfig } from '@nypl/dgx-header-component';
import { mockRouterContext } from '../helpers/routing';
import { breakpoints } from '../../src/app/data/constants';

const resizeWindow = (x) => {
  window.innerWidth = x;
  window.dispatchEvent(new Event('resize'));
};

describe('Application', () => {
  let component;
  const context = mockRouterContext();

  before(() => {
    window.matchMedia = () => ({ addListener: () => {} });
    window.matchMedia().addListener = stub();
    component = shallow(
      <Application
        children={{}}
        route={{
          history: { listen: stub() },
        }}
        addFeatures={() => {}}
      />, { context });

    component.setState({ patron: {} });
  });

  it('should be wrapped in a .app-wrapper class', () => {
    expect(component.find('.app-wrapper')).to.be.defined;
    expect(component.find('.app-wrapper')).to.have.length(1);
  });

  it('should render a <Header /> components', () => {
    expect(component.find('Header')).to.have.length(1);
  });

  it('should have the skip navigation link enabled,', () => {
    expect(component.contains(
      <Header
        navData={navConfig.current}
        skipNav={{ target: 'mainContent' }}
        patron={component.state.patron}
      />)).to.equal(true);
  });

  it('should render a <Footer /> components', () => {
    expect(component.find('Footer')).to.have.length(1);
  });

  describe('should set media type in context', () => {
    const {
      tablet,
      tabletPortrait,
      xtrasmall,
    } = breakpoints;

    it(`should set media as "desktop" for screenwidths above ${tablet}px`, () => {
      resizeWindow(tablet + 1);
      expect(component.state().media).to.eql('desktop');
    });
    it(`should set media as "tablet" for screenwidths ${tabletPortrait + 1}-${tablet}px`, () => {
      resizeWindow(tabletPortrait + 1);
      expect(component.state().media).to.eql('tablet');
      resizeWindow(tablet);
      expect(component.state().media).to.eql('tablet');
    });
    it(`should set media as "tabletPortrait" for screenwidths ${xtrasmall + 1}-${tabletPortrait}px`, () => {
      resizeWindow(xtrasmall + 1);
      expect(component.state().media).to.eql('tabletPortrait');
      resizeWindow(tabletPortrait);
      expect(component.state().media).to.eql('tabletPortrait');
    });
    it(`should set media as "mobile" for screenwidths below ${xtrasmall}`, () => {
      resizeWindow(xtrasmall);
      expect(component.state().media).to.eql('mobile');
    });
  });

  describe('url-enabled feature flag', () => {
    let content;
    before(() => {
      window.matchMedia = () => ({ addListener: () => {} });
      window.matchMedia().addListener = stub();
      context.router = {
        location: { query: {
          features: 'on-site-edd',
        } },
        listen: stub(),
      };
      component = shallow(
        <Application
          children={{}}
          router={context.router}
          addFeatures={() => {}}
        >
          <a href='/subject_headings'>link</a>
        </Application>, { context });
    });

    it('sets `urlEnabledFeatures` state from `router.location.query.features`', () => {
      expect(component.state().urlEnabledFeatures).to.equal('on-site-edd');
    });
  });
});
