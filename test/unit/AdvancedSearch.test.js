/* eslint-disable react/jsx-filename-extension */
/* eslint-env mocha */
import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
// import { mount } from 'enzyme';
import { mountTestRender, makeTestStore } from '../helpers/store';
import { mockRouterContext } from '../helpers/routing';
import AdvancedSearch from '../../src/app/components/AdvancedSearch/AdvancedSearch';


const aggregations = require('../../advancedSearchAggregations.json');

describe('AdvancedSearch', () => {
  const context = mockRouterContext();
  const childContextTypes = {
    router: PropTypes.object,
    media: PropTypes.string,
  };

  describe('Initial render', () => {
    let component;

    before(() => {
      const mockStore = makeTestStore();
      component = mountTestRender(<AdvancedSearch />, {
        context,
        childContextTypes,
        store: mockStore,
      }).find('AdvancedSearch');
    });

    it('should render inside an SCC Container', () => {
      expect(component.find('SccContainer').length).to.eql(1);
    });

    it('should not display the alert message', () => {
      expect(component.find('aside').length).to.eql(0);
    });

    it('should have an h2 announcing advanced search', () => {
      expect(component.find('h2').at(0).text()).to.eql('Advanced Search');
    });

    it('should have an advanced search form', () => {
      expect(component.find('form').length).to.eql(1);
    });

    it('should have labelled inputs for keyword', () => {
      expect(component.find('Label').at(0).text()).to.eql('Keyword');
      expect(component.find('Label').at(0).prop('htmlFor')).to.eql('searchKeywords');
      expect(component.find('Label').at(0).prop('id')).to.eql('searchKeywords-input-label');
      expect(component.find('Input').at(0).prop('id')).to.eql('searchKeywords');
      expect(component.find('Input').at(0).prop('ariaLabelledBy')).to.eql('searchKeywords-input-label');
    });

    it('should have labelled inputs for title', () => {
      expect(component.find('Label').at(1).text()).to.eql('Title');
      expect(component.find('Label').at(1).prop('htmlFor')).to.eql('title');
      expect(component.find('Label').at(1).prop('id')).to.eql('title-input-label');
      expect(component.find('Input').at(1).prop('id')).to.eql('title');
      expect(component.find('Input').at(1).prop('ariaLabelledBy')).to.eql('title-input-label');
    });

    it('should have labelled inputs for author', () => {
      expect(component.find('Label').at(2).text()).to.eql('Author');
      expect(component.find('Label').at(2).prop('htmlFor')).to.eql('contributor');
      expect(component.find('Label').at(2).prop('id')).to.eql('contributor-input-label');
      expect(component.find('Input').at(2).prop('id')).to.eql('contributor');
      expect(component.find('Input').at(2).prop('ariaLabelledBy')).to.eql('contributor-input-label');
    });

    it('should have labelled inputs for subject', () => {
      expect(component.find('Label').at(3).text()).to.eql('Subject');
      expect(component.find('Label').at(3).prop('htmlFor')).to.eql('subject');
      expect(component.find('Label').at(3).prop('id')).to.eql('subject-input-label');
      expect(component.find('Input').at(3).prop('id')).to.eql('subject');
      expect(component.find('Input').at(3).prop('ariaLabelledBy')).to.eql('subject-input-label');
    });

    it('should have labelled inputs for dateBefore', () => {
      expect(component.find('Label').at(7).text()).to.eql('To');
      expect(component.find('Label').at(7).prop('htmlFor')).to.eql('dateBefore');
      expect(component.find('Label').at(7).prop('id')).to.eql('dateBefore-li-label');
      expect(component.find('Input').at(5).prop('id')).to.eql('dateBefore');
      expect(component.find('Input').at(5).prop('ariaLabelledBy')).to.eql('dateBefore-li-label');
    });

    it('should have labelled inputs for dateAfter', () => {
      expect(component.find('Label').at(6).text()).to.eql('From');
      expect(component.find('Label').at(6).prop('htmlFor')).to.eql('dateAfter');
      expect(component.find('Label').at(6).prop('id')).to.eql('dateAfter-li-label');
      expect(component.find('Input').at(4).prop('id')).to.eql('dateAfter');
      expect(component.find('Input').at(4).prop('ariaLabelledBy')).to.eql('dateAfter-li-label');
    });

    it('should have checkboxes for materialTypes', () => {
      const materialTypes = [
        { value: 'resourcetypes:aud', label: 'Audio' },
        { value: 'resourcetypes:car', label: 'Cartographic' },
        { value: 'resourcetypes:mix', label: 'Mixed material' },
        { value: 'resourcetypes:mov', label: 'Moving image' },
        { value: 'resourcetypes:mul', label: 'Multimedia' },
        { value: 'resourcetypes:not', label: 'Notated music' },
        { value: 'resourcetypes:img', label: 'Still image' },
        { value: 'resourcetypes:txt', label: 'Text' },
      ];

      expect(component.find('Label').at(8).text()).to.eql('Format');
      expect(component.find('Label').at(8).prop('htmlFor')).to.eql('formats');

      expect(component.find('Checkbox').length).to.eql(8);
      for (let i = 0; i < materialTypes.length; i += 1) {
        const materialType = materialTypes[i];
        expect(component.find('Checkbox').at(i).props()).to.eql({
          labelOptions: {
            id: materialType.value,
            labelContent: materialType.label,
          },
          showLabel: true,
          checkboxId: materialType.value,
          value: materialType.value,
          name: materialType.value,
        });
      }
    });

    it('should have a select for languages', () => {
      expect(component.find('Select').length).to.eql(1);
      expect(component.find('Select').prop('id')).to.eql('languageSelect');
      expect(component.find('Select').find('option').length).to.eql(aggregations.language.length + 1);
      expect(component.find('Label').at(4).text()).to.eql('Language');
      expect(component.find('Label').at(4).prop('htmlFor')).to.eql('languageSelect');
      expect(component.find('Label').at(4).prop('id')).to.eql('languageSelect-label');
    });
  });

  // describe('Rendering after alert', () => {
  //   let component;
  //
  //   before(() => {
  //     const mockStore = makeTestStore();
  //     component = mountTestRender(<AdvancedSearch />, {
  //       context,
  //       childContextTypes,
  //       store: mockStore,
  //     });
  //
  //     component.find('form').at(0).simulate('submit');
  //     component.update();
  //   });
  //
  //   it('should have an aside', () => {
  //     console.log('state: ', JSON.stringify(component.instance().state, null, 2));
  //     expect(component.find('aside').length).to.eql(1);
  //   });
  // });
  //
  // describe('Submitting form');
  //
  // describe('Clear Button');
});
