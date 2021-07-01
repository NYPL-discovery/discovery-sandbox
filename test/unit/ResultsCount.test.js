/* eslint-env mocha */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

import sinon from 'sinon';

import WrappedResultsCount, { ResultsCount } from '../../src/app/components/ResultsCount/ResultsCount';

const filters = {
  subjectLiteral: {
    owner: [{}],
    subjectLiteral: [{ id: 'Children\'s art El Salvador', value: 'Children\'s art El Salvador' }],
    materialType: [],
  },
  creatorLiteral: {
    owner: [{}],
    creatorLiteral: [{ id: 'Shakespeare', value: 'Shakespeare' }],
    materialType: [],
    issuance: [],
  },
  materialTypeAndLanguage: {
    owner: [],
    creatorLiteral: [],
    materialType: [{ label: 'Text', value: 'resourcetypes:aud' }],
    langauge: [{ label: 'French', value: 'lang:fr' }],
  },
};

describe('ResultsCount', () => {
  describe('No results found', () => {
    describe('Default rendering', () => {
      let component;

      before(() => {
        component = shallow(<ResultsCount />);
      });

      it('should be wrapped in an .nypl-results-summary class', () => {
        expect(component.find('div').first().hasClass('nypl-results-summary')).to.equal(true);
      });

      it('should output that no results were found', () => {
        expect(component.find('h2').length).to.equal(1);
        expect(component.find('h2').text())
          .to.equal('No results for the keyword "". Try a different search.');
      });
    });

    describe('No result count with search keyword', () => {
      let component;

      before(() => {
        component = shallow(<ResultsCount searchKeywords="locofocos" count={0} />);
      });

      it('should output that no results were found', () => {
        expect(component.find('h2').length).to.equal(1);
        expect(component.find('h2').text())
          .to.equal('No results for the keyword "locofocos". Try a different search.');
      });
    });

    describe('No result count with multiple search keywords', () => {
      let component;

      before(() => {
        component = shallow(<ResultsCount searchKeywords="harry potter" count={0} />);
      });

      it('should output that no results were found', () => {
        expect(component.find('h2').length).to.equal(1);
        expect(component.find('h2').text())
          .to.equal('No results for the keywords "harry potter". Try a different search.');
      });
    });

    describe('No result count with search keywords and selected filters', () => {
      let component;

      before(() => {
        component = shallow(
          <ResultsCount
            searchKeywords="harry potter"
            count={0}
            selectedFilters={filters.materialTypeAndLanguage}
          />,
        );
      });

      // Neither materialType nor language are currently filters we talk about
      // in the results string, so we expect the "No results for" phrase to
      // only mention keywords:
      it('should output that no results were found', () => {
        expect(component.find('h2').length).to.equal(1);
        expect(component.find('h2').text())
          .to.equal('No results for the keywords "harry potter" with the chosen filters. ' +
            'Try a different search or different filters.');
      });
    });
  });

  describe('Loading display', () => {
    let component;

    before(() => {
      component = shallow(<ResultsCount searchKeywords="locofocos" />);
    });

    // the Store is handling loading now. TODO: How to test Store/Component interaction here?
    xit('should output that no results were found', () => {
      expect(component.find('h2').length).to.equal(1);
      expect(component.find('h2').text()).to.equal('Loading...');
    });
  });

  describe('Results display', () => {
    describe('From the field dropdown', () => {
      describe('Keyword field search - default', () => {
        let component;

        before(() => {
          component = shallow(
            <ResultsCount
              searchKeywords="hamlet"
              count={2345}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 2,345 results for keyword "hamlet"');
        });
      });

      describe('Multiple search keyword', () => {
        let component;

        before(() => {
          component = shallow(
            <ResultsCount
              searchKeywords="harry potter"
              count={2345}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 2,345 results for keywords "harry potter"');
        });
      });

      describe('Title field search', () => {
        let component;

        before(() => {
          component = shallow(
            <ResultsCount
              searchKeywords="hamlet"
              field="title"
              count={678}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 678 results for title "hamlet"');
        });
      });

      describe('Author/contributor field search', () => {
        let component;

        before(() => {
          component = shallow(
            <ResultsCount
              searchKeywords="shakespeare"
              field="contributor"
              count={135}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 135 results for author/contributor "shakespeare"');
        });
      });
    });

    // Currently, the use case is only ONE filter being displayed at a time.
    // Why? We have no actionable selection for filters/filters, and the only way to select
    // a filter is from the bib page using a link.
    describe('Selected Filters', () => {
      describe('creatorLiteral selected filter', () => {
        let component;

        before(() => {
          component = mount(
            <ResultsCount
              selectedFilters={filters.creatorLiteral}
              count={2345}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 2,345 results for author "Shakespeare"');
        });
      });

      describe('subjectLiteral selected filter', () => {
        let component;

        before(() => {
          component = mount(
            <ResultsCount
              selectedFilters={filters.subjectLiteral}
              count={6789}
            />,
          );
        });

        it('should output that no results were found', () => {
          expect(component.find('h2').length).to.equal(1);
          expect(component.find('h2').text())
            .to.equal('Displaying 1-50 of 6,789 results ');
        });
      });
    });
  });

  describe('Advanced search', () => {
    let component;

    it('should display all the advanced search params', () => {
      component = shallow(
        <ResultsCount
          count={100}
          subject="ravens"
          contributor="Poe"
          title="The Raven"
        />,
      );

      expect(component.find('h2').text()).to.equal(
        'Displaying 1-50 of 100 results for Author: Poe and Title: The Raven and Subject: ravens',
      );
    });
  });

  describe('Locale count', () => {
    let component;

    it('should output that 40 results were found', () => {
      component = shallow(<ResultsCount count={40} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 1-40 of 40 results ');
    });

    it('should output that 4,000 results were found from input 4000', () => {
      component = shallow(<ResultsCount count={4000} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 1-50 of 4,000 results ');
    });

    it('should output that 4,000,000 results were found from input 4000000', () => {
      component = shallow(<ResultsCount count={4000000} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 1-50 of 4,000,000 results ');
    });
  });

  describe('Different pages', () => {
    let component;

    it('should output the first 50 results', () => {
      component = shallow(<ResultsCount count={500} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 1-50 of 500 results ');
    });

    it('should output 101-150 on the third page', () => {
      component = shallow(<ResultsCount count={500} page={3} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 101-150 of 500 results ');
    });

    it('should output 451-489 on the last page', () => {
      component = shallow(<ResultsCount count={489} page={10} />);
      expect(component.find('h2').text())
        .to.equal('Displaying 451-489 of 489 results ');
    });
  });

  describe('Correctly Updates on New Search', () => {
    // ResultsCount is rerendering 1 extra time when running locally.
    // The spy is counting more. Disabling this test for now.
    xit('Should only rerender when loading is done', (done) => {
      const component = shallow(<ResultsCount count={0} searchKeywords="locofocos" />);
      const spy = sinon.spy(ResultsCount.prototype, 'render');
      component.setProps({ field: null });
      component.setProps({ searchKeywords: 'locofoci' });
      component.setProps({ selectedFilters: {} });
      component.setProps({ page: 1 });
      expect(spy.callCount).to.equal(1);
      done();
    });
  });
});
