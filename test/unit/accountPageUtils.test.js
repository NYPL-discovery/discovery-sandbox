/* eslint-env mocha */
import { expect } from 'chai';

import { isClosed, convertEncoreUrl } from './../../src/app/utils/accountPageUtils';
import appConfig from './../../src/app/data/appConfig';

describe('`isClosed`', () => {
  it('should return true for string with "CLOSED"', () => {
    expect(isClosed('Andrew Heiskell (CLOSED)')).to.equal(true);
  });
  it('should return true for string with "STAFF ONLY"', () => {
    expect(isClosed('STAFF ONLY-SASB Rare Book Rm324')).to.equal(true);
  });
  it('should return true for string with "Performing Arts"', () => {
    expect(isClosed('Performing Arts - Spec Col Desk')).to.equal(true);
  });
  it('should return false for string without above cases', () => {
    expect(isClosed('53rd Street')).to.equal(false);
  });
});

describe('`convertEncoreUrl`', () => {
  it('should convert a conventionally structured Encore item URL to `discovery-front-end` URL', () => {
    expect(convertEncoreUrl('https://browse.nypl.org/iii/encore/record/C__Rb21771946?lang=eng&suite=def')).to.equal(`${appConfig.baseUrl}/bib/b21771946`);
  });

  it('should return passed URL if it does not follow convention of Encore item URL', () => {
    const malformedUrl = 'https://browse.nypl.org/iii/encore/record/somethingisnotright';
    expect(convertEncoreUrl(malformedUrl)).to.equal(malformedUrl);
  });
});
