/* eslint-env mocha */
import { expect } from 'chai';

import { buildQueryDataFromForm } from '../../src/app/utils/advancedSearchUtils';


describe('buildQueryDataFromForm', () => {
  it('should return an empty object if no relevant params', () => {
    expect(buildQueryDataFromForm([])).to.eql({});
  });

  it('should ignore empty searchKeywords', () => {
    expect(buildQueryDataFromForm([['searchKeywords', '']])).to.eql({});
  });

  it('should include searchKeywords', () => {
    expect(buildQueryDataFromForm([['searchKeywords', 'birds']])).to.eql({ searchKeywords: 'birds' });
  });

  it('should ignore empty contributor', () => {
    expect(buildQueryDataFromForm([['contributor', '']])).to.eql({});
  });

  it('should include contributor', () => {
    expect(buildQueryDataFromForm([['contributor', 'Poe']])).to.eql({ contributor: 'Poe' });
  });

  it('should ignore empty title', () => {
    expect(buildQueryDataFromForm([['title', '']])).to.eql({});
  });

  it('should include title', () => {
    expect((buildQueryDataFromForm([['title', 'The Raven']]))).to.eql({ title: 'The Raven' });
  });

  it('should ignore empty subject', () => {
    expect((buildQueryDataFromForm([['subject', '']]))).to.eql({});
  });

  it('should include subject', () => {
    expect(buildQueryDataFromForm([['subject', 'ravens']])).to.eql({ subject: 'ravens' });
  });

  it('should ignore empty language', () => {
    expect(buildQueryDataFromForm([['language', '']])).to.eql({});
  });

  it('should include language', () => {
    expect(buildQueryDataFromForm([['language', 'lang:eng']])).to.eql({ selectedFilters: { language: ['lang:eng'] } });
  });

  it('should include dateBefore', () => {
    expect(buildQueryDataFromForm([['dateBefore', '2001']])).to.deep.eql({ selectedFilters: { dateBefore: '2001' } });
  });

  it('should include dateAfter', () => {
    expect(buildQueryDataFromForm([['dateAfter', '1901']])).to.deep.eql({ selectedFilters: { dateAfter: '1901' } });
  });

  it('should handle materialTypes', () => {
    expect(buildQueryDataFromForm([['resourcetypes:aud', 'on']])).to.deep.eql({ selectedFilters: { materialType: ['resourcetypes:aud'] } });
  });

  it('should handle combinations', () => {
    expect(buildQueryDataFromForm([
      ['searchKeywords', 'birds'],
      ['contributor', 'Poe'],
      ['title', 'The Raven'],
      ['subject', 'ravens'],
      ['dateBefore', '2001'],
      ['dateAfter', '1901'],
      ['language', 'lang:eng'],
      ['resourcetypes:aud', 'on'],
      ['resourcetypes:text', 'on'],
    ])).to.deep.eql({
      searchKeywords: 'birds',
      contributor: 'Poe',
      title: 'The Raven',
      subject: 'ravens',
      selectedFilters: {
        dateBefore: '2001',
        dateAfter: '1901',
        language: ['lang:eng'],
        materialType: ['resourcetypes:aud', 'resourcetypes:text'],
      },
    });
  });
});
