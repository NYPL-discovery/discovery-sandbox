/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { mountTestRender, makeTestStore } from '../helpers/store';

// Import the component that is going to be tested
import WrappedHoldConfirmation, { HoldConfirmation } from './../../src/app/pages/HoldConfirmation';

describe('HoldConfirmation', () => {
  describe('After being rendered, <HoldConfirmation>', () => {
    let component;
    let requireUser;
    const location = {
      query: {
        pickupLocation: 'myr',
        searchKeywords: 'Bryant',
      },
    };

    before(() => {
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore(),
        },
      );
    });

    after(() => {
      requireUser.restore();
      component.unmount();
    });

    it('should check if the patron is logged in.', () => {
      expect(requireUser.calledOnce).to.equal(true);
    });
  });

  describe('If the patron is not logged in, <HoldConfirmation>', () => {
    let component;
    let requireUser;
    const location = {
      query: {
        pickupLocation: 'myr',
        searchKeywords: 'Bryant',
      },
    };

    before(() => {
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            patron: {},
          }),
        });
    });

    after(() => {
      requireUser.restore();
      component.unmount();
    });

    it('should redirect the patron to OAuth log in page.', () => {
      expect(requireUser.returnValues[0]).to.equal(false);
    });
  });

  describe('If the patron is logged in but the App doesn\'t get valid data,<HoldConfirmation>',
    () => {
      const location = {
        query: {
          pickupLocation: 'myr',
          searchKeywords: 'Bryant',
          errorStatus: 500,
          errorMessage: 'Something is wrong with the server.',
        },
      };
      let component;
      let requireUser;

      before(() => {
        const patron = {
          id: '6677200',
          names: ['Leonard, Mike'],
          barcodes: ['162402680435300'],
          loggedIn: true,
        };
        requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');

        component = mountTestRender(
          <WrappedHoldConfirmation location={location} />, {
            store: makeTestStore({
              patron,
            }),
          });
      });

      after(() => {
        requireUser.restore();
        component.unmount();
      });

      it('should pass the patron data check in requireUser().', () => {
        expect(requireUser.returnValues[0]).to.equal(true);
      });

      it('should render the error message.', () => {
        const main = component.find('main');
        const expectedHTML = new RegExp(
          '<p>(.*)We could not process your request at this time.' +
          '(.*)Please try again or contact 917-ASK-NYPL(.*)' +
          '((.*)<a href="tel:19172756975">917-275-6975</a>(.*)).(.*)</p>');
        expect(
          expectedHTML
            .test(main.html()))
          .to
          .equal(true);
      });
    },
  );

  describe('If the patron is logged in and the App receives valid data, <HoldConfirmation>', () => {
    const location = {
      query: {
        pickupLocation: 'mala',
      },
    };
    const bib = {
      title: ['Harry Potter'],
    };
    const deliveryLocations = [
      {
        '@id': 'loc:myr',
        address: '40 Lincoln Center Plaza',
        prefLabel: 'Performing Arts Research Collections',
        shortName: 'Library for the Performing Arts',
      },
      {
        '@id': 'loc:sc',
        prefLabel: 'Schomburg Center',
        address: '515 Malcolm X Boulevard',
        shortName: 'Schomburg Center',
      },
      {
        '@id': 'loc:mala',
        prefLabel: 'Schwarzman Building - Allen Scholar Room',
        address: '476 Fifth Avenue (42nd St and Fifth Ave)',
        shortName: 'Schwarzman Building',
      },
    ];
    let component;
    let requireUser;
    let modelDeliveryLocationName;

    before(() => {
      const patron = {
        id: '6677200',
        names: ['Leonard, Mike'],
        barcodes: ['162402680435300'],
        loggedIn: true,
      };
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');
      modelDeliveryLocationName = sinon.spy(
        HoldConfirmation.prototype,
        'modelDeliveryLocationName',
      );

      component = mountTestRender(
        <WrappedHoldConfirmation location={location} />, {
          store: makeTestStore({
            patron,
            deliveryLocations,
            bib,
          }),
        });
    });

    after(() => {
      requireUser.restore();
      modelDeliveryLocationName.restore();
      component.unmount();
    });

    it('should display the layout of request confirmation page\'s contents.', () => {
      const main = component.find('main');

      expect(main.find('h3')).to.have.length(2);
      expect(main.find('#physical-delivery').text()).to.equal('Physical Delivery');
      expect(main.find('#electronic-delivery').text()).to.equal('Electronic Delivery');
      expect(main.contains(<h3 id="physical-delivery">Physical Delivery</h3>)).to.equal(true);
      expect(main.contains(<h3 id="electronic-delivery">Electronic Delivery</h3>)).to.equal(true);
      expect(main.find('.item')).to.have.length(1);
    });

    it('should render the message for the physical delivery location.', () => {
      const main = component.find('main');
      expect(modelDeliveryLocationName.returnValues[0]).to.equal('Schwarzman Building - Allen Scholar Room');
      expect(main.find('#delivery-location')).to.have.length(1);
      expect(main.find('#delivery-location').text())
        .to.equal('The item will be delivered to: Schwarzman Building - Allen Scholar Room');
    });

    it('should deliver the item\'s title on the page.', () => {
      const main = component.find('main');
      expect(main.find('#item-link')).to.have.length(2);
      expect(main.find('#item-link').at(1).text()).to.equal('Harry Potter');
    });

    it('should have the link back to homepage.', () => {
      const main = component.find('main');
      expect(main.find('#start-new-search').hostNodes()).to.have.length(1);
      expect(main.find('#start-new-search').at(1).text()).to.equal('Start a new search');
    });
  });

  describe('If the patron is logged in and the App receives valid data but no delivery ' +
    'location label', () => {
    const location = {
      query: {
        pickupLocation: 'myr',
      },
    };
    const deliveryLocations = [
      {
        '@id': 'loc:myr',
        address: '',
        prefLabel: '',
        shortName: '',
      },
    ];
    let component;
    let modelDeliveryLocationName;

    before(() => {
      const patron = {
        id: '6677200',
        names: ['Leonard, Mike'],
        barcodes: ['162402680435300'],
      };
      modelDeliveryLocationName = sinon.spy(
        HoldConfirmation.prototype,
        'modelDeliveryLocationName',
      );
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            patron,
            deliveryLocations,
          }),
        });
    });

    after(() => {
      modelDeliveryLocationName.restore();
      component.unmount();
    });
  });

  describe('If the App does not receive valid pick up location data', () => {
    let component;
    let requireUser;
    const location = {
      query: {
        pickupLocation: '',
      },
    };

    const bib = {
      title: ['Harry Potter'],
    };

    const deliveryLocations = [
      {
        '@id': 'loc:myr',
        address: '40 Lincoln Center Plaza',
        prefLabel: 'Performing Arts Research Collections',
        shortName: 'Library for the Performing Arts',
      },
      {
        '@id': 'loc:sc',
        prefLabel: 'Schomburg Center',
        address: '515 Malcolm X Boulevard',
        shortName: 'Schomburg Center',
      },
      {
        '@id': 'loc:mala',
        prefLabel: 'Schwarzman Building - Allen Scholar Room',
        address: '476 Fifth Avenue (42nd St and Fifth Ave)',
        shortName: 'Schwarzman Building',
      },
    ];

    before(() => {
      const patron = {
        id: '6677200',
        names: ['Leonard, Mike'],
        barcodes: ['162402680435300'],
      };
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');

      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            patron,
            deliveryLocations,
            bib,
          }),
        });
    });

    after(() => {
      requireUser.restore();
      component.unmount();
    });

    it('should render the default error message.', () => {
      const main = component.find('main');

      expect(main.find('#delivery-location')).to.have.length(1);
      expect(main.find('#delivery-location').text()).to.equal('The item will be delivered to: please email us or call 917-ASK-NYPL (917-275-6975) for your delivery location.');
      expect(main.find('#delivery-location').find('a').length).to.equal(2);
    });
  });

  describe('If the App receives valid pick up location data but no locations data', () => {
    let component;
    let requireUser;
    const location = {
      query: {
        pickupLocation: 'myr',
      },
    };

    const bib = {
      title: ['Harry Potter'],
    };

    before(() => {
      const patron = {
        id: '6677200',
        names: ['Leonard, Mike'],
        barcodes: ['162402680435300'],
      };
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');

      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            patron,
            bib,
          }),
        });
    });

    after(() => {
      requireUser.restore();
      component.unmount();
    });

    it('should render the default error message.', () => {
      const main = component.find('main');

      expect(main.find('#delivery-location')).to.have.length(1);
      expect(main.find('#delivery-location').text()).to.equal('The item will be delivered to: please email us or call 917-ASK-NYPL (917-275-6975) for your delivery location.');
      expect(main.find('#delivery-location').find('a').length).to.equal(2);
    });
  });

  describe('If the App receives pick up location as "edd"', () => {
    let component;
    let requireUser;
    const location = {
      query: {
        pickupLocation: 'edd',
      },
    };

    const deliveryLocations = [
      {
        '@id': 'loc:myr',
        address: '40 Lincoln Center Plaza',
        prefLabel: 'Performing Arts Research Collections',
        shortName: 'Library for the Performing Arts',
      },
      {
        '@id': 'loc:sc',
        prefLabel: 'Schomburg Center',
        address: '515 Malcolm X Boulevard',
        shortName: 'Schomburg Center',
      },
      {
        '@id': 'loc:mala',
        prefLabel: 'Schwarzman Building - Allen Scholar Room',
        address: '476 Fifth Avenue (42nd St and Fifth Ave)',
        shortName: 'Schwarzman Building',
      },
    ];

    const bib = {
      title: ['Harry Potter'],
    };

    before(() => {
      const patron = {
        id: '6677200',
        names: ['Leonard, Mike'],
        barcodes: ['162402680435300'],
      };
      requireUser = sinon.spy(HoldConfirmation.prototype, 'requireUser');
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            patron,
            deliveryLocations,
            bib,
          }),
        });
    });

    after(() => {
      requireUser.restore();
      component.unmount();
    });

    it('should render the message for EDD.', () => {
      const main = component.find('main');

      expect(main.find('#delivery-location')).to.have.length(1);
      expect(main.find('#delivery-location').text())
        .to.equal('The item will be delivered to the email address you provided.');
    });
  });

  describe('If the patron does not get here from a search result page, <HoldConfirmation>', () => {
    let component;
    const location = {
      query: {
        pickupLocation: 'myr',
      },
    };

    const bib = {
      title: ['Harry Potter'],
    };

    before(() => {
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            bib,
          }),
        });
    });

    after(() => {
      component.unmount();
    });

    it('should have the link back to search result.', () => {
      const main = component.find('main');

      expect(main.find('#start-new-search')).to.have.length(2);
      expect(main.find('#start-new-search').at(1).text()).to.equal('Start a new search');
      expect(main.find('#go-back-search-results')).to.have.length(0);
    });
  });

  describe('If the patron gets here from a search result page, <HoldConfirmation>', () => {
    const location = {
      query: {
        pickupLocation: 'myr',
        searchKeywords: 'Bryant',
      },
    };
    const bib = {
      title: ['Harry Potter'],
    };
    let component;
    let pushSpy;

    before(() => {
      pushSpy = sinon.spy();
      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            bib,
          }),
        });
    });

    after(() => {
      component.unmount();
    });

    it('should have the link back to search result.', () => {
      const main = component.find('main');

      expect(main.find('#start-new-search')).to.have.length(2);
      expect(main.find('#start-new-search').at(1).text()).to.equal('start a new search');
      expect(main.find('#go-back-search-results')).to.have.length(2);
      expect(main.find('#go-back-search-results').at(1).text())
        .to.equal('Go back to your search results');
    });
  });

  describe('If the patron does not get here from a classic catalog, <HoldConfirmation>', () => {
    let component;
    let renderBackToClassicLink;
    const location = {
      query: {
        pickupLocation: 'myr',
        searchKeywords: 'Bryant',
      },
    };

    const bib = {
      title: ['Harry Potter'],
    };

    before(() => {
      renderBackToClassicLink = sinon.spy(HoldConfirmation.prototype, 'renderBackToClassicLink');

      component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore({
            bib,
          }),
        });
    });

    after(() => {
      renderBackToClassicLink.restore();
      component.unmount();
    });

    it('should not have the link back to the classic catalog homepage.', () => {
      const main = component.find('main');

      expect(renderBackToClassicLink.returnValues[0]).to.equal(false);
      expect(main.find('#go-back-catalog')).to.have.length(0);
    });

    it('should have the link to shared collection catalog.', () => {
      const main = component.find('main');

      expect(main.find('#start-new-search').at(1).text()).to.equal('start a new search');
    });
  });

  describe('If the patron gets here from a classic catalog search result page, <HoldConfirmation>',
    () => {
      let component;
      const location = {
        query: {
          pickupLocation: 'myr',
          searchKeywords: 'Bryant',
          fromUrl: 'https://catalog.nypl.org/search~S1/?searchtype=X&searcharg=bryant&' +
            'searchscope=1&sortdropdown=-&SORT=DZ&extended=0&SUBMIT=Search&searchlimits' +
            '=&searchorigarg=Xbryant%26SORT%3DD',
        },
      };

      const bib = {
        title: ['Harry Potter'],
      };

      before(() => {
        component = mountTestRender(
          <HoldConfirmation location={location} />, {
            store: makeTestStore({
              bib,
            }),
          });
      });

      after(() => {
        component.unmount();
      });

      it('should have the link back to the classic catalog homepage and search result page',
        () => {
          const main = component.find('main');

          expect(main.find('#go-back-catalog')).to.have.length(1);
          expect(main.find('#go-back-catalog a').length).to.equal(2);

          expect(main.find('#go-back-catalog a').at(0).text())
            .to.equal('Go back to your search results');
          expect(main.find('#go-back-catalog a').at(0).prop('href'))
            .to.equal('https://catalog.nypl.org/search~S1/?searchtype=X&searcharg=bryant&' +
              'searchscope=1&sortdropdown=-&SORT=DZ&extended=0&SUBMIT=Search&searchlimits' +
              '=&searchorigarg=Xbryant%26SORT%3DD');

          expect(main.find('#go-back-catalog a').at(1).text()).to.equal('start a new search');
          expect(main.find('#go-back-catalog a').at(1).prop('href'))
            .to.equal('https://catalog.nypl.org/search');
        },
      );

      it('should have the link to shared collection catalog.', () => {
        const main = component.find('main');

        expect(main.find('#go-to-research-catalog').text())
          .to.equal(' You may also try your search in our Research Catalog.');
      });
    },
  );

  describe('If there are eligibility errors', () => {
    it('should render an error message with specific errors when available', () => {
      const location = { query: { errorStatus: 'eligibility', errorMessage: '{"expired":true,"blocked":true,"moneyOwed":true}' } };
      const component = mountTestRender(
        <HoldConfirmation location={location} />, {
          store: makeTestStore(),
        });
      const text = component.text();
      component.unmount();
      expect(text.includes('Your account has expired')).to.equal(true);
      expect(text.includes('There is a problem with your library account')).to.equal(true);
      expect(text.includes('Your fines have exceeded the limit')).to.equal(true);
    });
    it('should render a default error message when no specific errors are available', () => {
      const location = { query: { errorStatus: 'eligibility', errorMessage: '{}' } };
      const component = mountTestRender(
        <WrappedHoldConfirmation location={location} />, {
          store: makeTestStore({
            patron: {
              id: 1,
              loggedIn: true,
            },
          }),
        });
      const text = component.text();
      component.unmount();
      expect(text.includes('There is a problem with your library account.')).to.equal(true);
    });
  });
});
