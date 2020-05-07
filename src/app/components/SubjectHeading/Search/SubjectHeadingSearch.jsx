import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import appConfig from '../../../data/appConfig';

import AutosuggestItem from './AutosuggestItem';

class SubjectHeadingSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSuggestion: 0,
      suggestions: [],
      userInput: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.resetAutosuggest = this.resetAutosuggest.bind(this);
    this.changeActiveSuggestion = this.changeActiveSuggestion.bind(this);
    this.onFocus = this.onFocus.bind(this);
  }

  componentDidMount() {
    const hasParentAutosuggest = (element) => {
      if (element.id === 'autosuggest') return true;
      if (element.parentElement) return hasParentAutosuggest(element.parentElement);
      return false;
    };

    document.addEventListener('click', (e) => {
      console.log('document clicked ', e.target, e.currentTarget);
      if (!hasParentAutosuggest(e.target)) this.setState({ hidden: true });
    });
  }

  onSubmit(submitEvent) {
    submitEvent.preventDefault();
    const url = this.generatePath(this.state.suggestions[this.state.activeSuggestion]);
    this.resetAutosuggest();
    this.context.router.push(url);
  }

  onChange(inputEvent) {
    const userInput = inputEvent.currentTarget.value;

    this.setState({
      userInput,
    }, this.makeApiCallWithThrottle(this.state.timerId));
  }

  onFocus() {
    this.setState({ hidden: false });
  }

  makeApiCallWithThrottle(timerId) {
    const apiCall = () => {
      if (this.state.userInput) {
        return axios(`${appConfig.baseUrl}/api/subjectHeadings/autosuggest?query=${this.state.userInput}`)
          .then((res) => {
            if (res.data.request.query.trim() === this.state.userInput.trim()) {
              this.setState({
                suggestions: res.data.autosuggest,
                activeSuggestion: 0,
              });
            }
          })
          .catch(console.error);
      }
      // if this.state.userInput.length is falsey, reset suggestions
      return this.setState({ suggestions: [] });
    };

    if (timerId) return;

    const newTimerId = setTimeout(() => {
      apiCall();
      this.setState({ timerId: undefined });
    }, 500);

    this.setState({ timerId: newTimerId });
  }

  changeActiveSuggestion(keyEvent) {
    const { suggestions, activeSuggestion } = this.state;
    if (suggestions.length > 0) {
      if (keyEvent.key === 'ArrowDown' && suggestions.length - 1 > activeSuggestion) {
        keyEvent.preventDefault();
        this.setState(prevState => ({
          activeSuggestion: prevState.activeSuggestion + 1,
        }));
      } else if (keyEvent.key === 'ArrowUp' && activeSuggestion > 0) {
        keyEvent.preventDefault();
        this.setState(prevState => ({
          activeSuggestion: prevState.activeSuggestion - 1,
        }));
      }
    }
  }

  resetAutosuggest() {
    this.setState({
      userInput: '',
      activeSuggestion: 0,
    });
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
      onChange,
      onSubmit,
      changeActiveSuggestion,
      state: {
        suggestions,
        activeSuggestion,
        userInput,
        hidden,
      },
    } = this;

    let suggestionsListComponent = null;

    if (userInput && suggestions.length && !hidden) {
      suggestionsListComponent = (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <AutosuggestItem
              item={suggestion}
              path={this.generatePath(suggestion)}
              activeSuggestion={index === activeSuggestion}
              key={suggestion.uuid || suggestion.label}
              onClick={this.resetAutosuggest}
            />
          ))}
        </ul>
      );
    }

    return (
      <form
        className="autocomplete"
        autoComplete="off"
        onSubmit={onSubmit}
        onKeyDown={changeActiveSuggestion}
        onFocus={this.onFocus}
        id="mainContent"
      >
        <div className="autocomplete-field">
          <label htmlFor="autosuggest">Subject Heading Search:</label>
          <input
            id="autosuggest"
            type="text"
            onChange={onChange}
            value={userInput}
            placeholder="Subject"
          />
          {suggestionsListComponent}
        </div>
      </form>
    );
  }
}

SubjectHeadingSearch.contextTypes = {
  router: PropTypes.object,
};

export default SubjectHeadingSearch;
