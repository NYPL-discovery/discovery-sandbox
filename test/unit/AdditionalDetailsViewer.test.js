import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
// Import the component that is going to be tested
import AdditionalDetailsViewer from './../../src/app/components/BibPage/AdditionalDetailsViewer';


describe('AdditionalDetailsViewer', () => {
  const sampleBib =
  {
  "annotatedMarc" : {
  "bib": {
    "id": "12082323",
    "nyplSource": "sierra-nypl",
    "fields": [
      {
        "label": "Abbreviated Title",
        "values": [
          {
            "content": "Abrev. title -- 210 ",
            "source": {
              "fieldTag": "u",
              "marcTag": "210",
              "ind1": "1",
              "ind2": "0",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Abrev. title -- 210 "
                }
              ]
            }
          }
        ]
      },
      {
        "label": "Access",
        "values": [
          {
            "content": "Access -- 506 blank,any",
            "source": {
              "fieldTag": "n",
              "marcTag": "506",
              "ind1": " ",
              "ind2": " ",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Access -- 506 blank,any"
                }
              ]
            }
          },
          {
            "content": "Access -- 506 0,any",
            "source": {
              "fieldTag": "n",
              "marcTag": "506",
              "ind1": "0",
              "ind2": " ",
              "content": null,
              "subfields": [
                {
                  "tag": "a",
                  "content": "Access -- 506 0,any"
                }
                ]
              }
            }
          ]
        },
        {
        "label": "Url",
        "values": [
          {
            "label": "856 40",
            "content": "http://blogs.nypl.org/rcramer/",
            "source": {
              "fieldTag": "y",
              "marcTag": "856",
              "ind1": "4",
              "ind2": "0",
              "content": null,
              "subfields": [
                {
                  "tag": "u",
                  "content": "http://blogs.nypl.org/rcramer/"
                },
                {
                  "tag": "z",
                  "content": "[redacted]"
                }
              ]
            }
          }
          ]
        }
      ]
    }
  }
};

let component = mount(<AdditionalDetailsViewer bib={sampleBib}/>);

describe('Initial Rendering', () => {

  it('should render with a button to see additional details', () => {
    expect(component.find('button').length).to.equal(1);
  });

  it('should say \'View Full Record\' ', () => {
    expect(component.find('button').at(0).text()).to.equal("View Full Record");
  });

  it('should not render the word \'Source\'', () => {
    expect(component.find('h3').length).to.equal(0);
  });

  it('should not render the annotated MARC details', () => {
    expect(component.find('dd').length).to.equal(0); //is there a way of making this play well with React?
  });

});

describe('After Clicking on Button', () => {

  let link ;

  before(() => {
    component.find('button').at(0).simulate('click');
    link = component.find('a');
  });

  it('should update the button text to \'Hide Full Record\'', () => {
    expect(component.find('button').at(0).text()).to.equal("Hide Full Record")
  });

  //These tests should be changed to be more informative

  it('should display Abbreviated Title', () => {
    expect(component.find('div').someWhere(item => item.text() === "Abrev. title -- 210 ")).to.equal(true);
  });

  it('should display url fields', () => {
    expect(link);
  });

  it('should have correct href for url fields', () => {
    expect(link.someWhere(item => item.prop("href") === "http://blogs.nypl.org/rcramer/" )).to.equal(true);
  });

  it('should display correct text for url fields', () => {
    expect(link.someWhere(item => item.text().trim() === "856 40")).to.equal(true);
  });

});

});
