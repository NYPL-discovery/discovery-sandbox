import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

import appConfig from '../../../data/appConfig';

class SubjectHeadingSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      suggestions: [],
      userInput: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.makeApiCallWithThrottle = this.makeApiCallWithThrottle.bind(this);
  }

  onSubmit(e, { suggestion }) {
    const url = this.generatePath(suggestion);
    this.context.router.push(url);
  }

  onChange(inputEvent, { newValue }) {
    this.setState({
      userInput: newValue,
    });
  }

  makeApiCallWithThrottle() {
    const apiCall = () => {
      if (this.state.userInput) {
        return axios(`${appConfig.baseUrl}/api/subjectHeadings/autosuggest?query=${this.state.userInput}`)
          .then((res) => {
            if (res.data.request.query.trim() === this.state.userInput.trim()) {
              this.setState({
                suggestions: res.data.autosuggest,
              });
            }
          })
          .catch(console.error);
      }
      // if this.state.userInput.length is falsey, reset suggestions
      return this.setState({ suggestions: [] });
    };

    const { timerId } = this.state;

    if (timerId) return;

    const newTimerId = setTimeout(() => {
      apiCall();
      this.setState({ timerId: undefined });
    }, 400);

    this.setState({ timerId: newTimerId });
  }

  generatePath(item) {
    const subjectComponent = item.class === 'subject_component';
    const base = appConfig.baseUrl;
    let path;

    if (subjectComponent) {
      path = `${base}/subject_headings?filter=${item.label}`;
    } else if (item.uuid) {
      path = `${base}/subject_headings/${item.uuid}`;
    }

    return path;
  }

  render() {
    const {
      makeApiCallWithThrottle,
      onChange,
      onSubmit,
      state: {
        suggestions,
        userInput,
      },
    } = this;

    return (
      /*
        * if you need to style the open state
        * add the `alwaysRenderSuggestions` prop
      */
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={() => makeApiCallWithThrottle()}
        onSuggestionsClearRequested={() => this.setState({ suggestions: [] })}
        onSuggestionSelected={(e, secondArg) => onSubmit(e, secondArg)}
        getSuggestionValue={suggestion => suggestion.label}
        inputProps={{
          placeholder: 'Enter a Subject Heading Term',
          value: userInput,
          onChange,
        }}
        renderSuggestion={(suggestion) => {
          const subjectComponent = suggestion.class === 'subject_component';

          return (
            <div>
              <span>
                {subjectComponent ? null : (<em>Subject: </em>) }
                <span>
                  {suggestion.label}
                </span>
              </span>
              <div className="aggregateBibCount">
                {suggestion.aggregate_bib_count} title{suggestion.aggregate_bib_count > 1 ? 's' : ''}
              </div>
            </div>
          );
        }}
      />
    );
  }
}

SubjectHeadingSearch.contextTypes = {
  router: PropTypes.object,
};

export default SubjectHeadingSearch;
