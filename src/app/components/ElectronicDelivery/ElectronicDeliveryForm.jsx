import React from 'react';
import PropTypes from 'prop-types';
import {
  mapObject as _mapObject,
  extend as _extend,
  isEmpty as _isEmpty,
} from 'underscore';

import { validate } from '../../utils/formValidationUtils';
import appConfig from '../../data/appConfig';

class ElectronicDeliveryForm extends React.Component {
  constructor(props) {
    super(props);

    // this.props.form and this.props.error are coming from the server only
    // in the no-js scenario. If they're not available, then we use this
    // 'fallback', but the empty object structure is needed.
    this.state = {
      form: !_isEmpty(this.props.form) ? this.props.form :
        {
          emailAddress: this.props.defaultEmail,
          chapterTitle: '',
          startPage: '',
          endPage: '',
        },
      error: !_isEmpty(this.props.error) ? this.props.error :
        {
          emailAddress: '',
          chapterTitle: '',
          startPage: '',
          endPage: '',
        },
    };

    this.submit = this.submit.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  submit(e) {
    e.preventDefault();

    const errorCb = (error) => {
      this.setState({ error });
      this.props.raiseError(error);
    };

    if (validate(this.state.form, errorCb)) {
      this.props.submitRequest(this.state);
    }
  }

  handleUpdate(e, input) {
    // Kind of hard to read. Basically, the `form` property is being updated
    // and all the values are being retained. If we don't `extend` the object
    // value for `form`, then only the last value in the form gets updated
    // and the rest are gone.
    this.setState({ form: _extend(this.state.form, { [input]: e.target.value }) });
  }

  render() {
    const errorClass = {
      emailAddress: '',
      chapterTitle: '',
      startPage: '',
      endPage: '',
    };

    _mapObject(this.state.form, (val, key) => {
      errorClass[key] = this.state.error[key] ? 'nypl-field-error' : '';
    });

    // A lot of this can be refactored to be in a loop but that's a later and
    // next step. I was thinking each `nypl-text-field` or `nypl-year-field`
    // div can be its own component in a loop with the required props and
    // errors passed down.
    return (
      <form
        id="place-edd-hold-form"
        className="place-hold-form form electronic-delivery-form"
        action={`${appConfig.baseUrl}/edd`}
        method="POST"
        onSubmit={e => this.submit(e)}
      >
        <fieldset className="nypl-fieldset">
          <legend>
            <h3>Required Information</h3>
          </legend>
          <div className="nypl-row">
            <div className="nypl-column-half">
              <div className={`nypl-text-field ${errorClass.emailAddress}`}>
                <label htmlFor="emailAddress" id="emailAddress-label">Email Address
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="emailAddress"
                  type="text"
                  aria-labelledby="emailAddress-label emailAddress-status"
                  aria-required="true"
                  name="emailAddress"
                  value={this.state.form.emailAddress}
                  onChange={e => this.handleUpdate(e, 'emailAddress')}
                />
                <span
                  className="nypl-field-status"
                  id="emailAddress-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {
                    errorClass.emailAddress ? this.state.error.emailAddress :
                    'Your request will be delivered to the email address you enter above.'
                  }
                </span>
              </div>
              <span>You may request a chapter, article or short excerpt.</span><br />
              <span>
                <a href="https://www.nypl.org/help/request-research-materials#EDD">
                  Read more about this service
                </a>.
              </span>
              <div className={`nypl-text-field ${errorClass.startPage}`}>
                <label htmlFor="startPage" id="startPage-label">Starting Page Number
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="startPage"
                  type="text"
                  aria-required="true"
                  className="form-text"
                  aria-labelledby="startPage-label startPage-status"
                  name="startPage"
                  value={this.state.form.startPage}
                  onChange={e => this.handleUpdate(e, 'startPage')}
                />
                <span
                  className="nypl-field-status"
                  id="startPage-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>
                    {
                      errorClass.startPage ?
                      this.state.error.startPage : 'Enter the first page of your selection.'
                    }
                  </span>
                </span>
              </div>

              <div className={`nypl-text-field ${errorClass.endPage}`}>
                <label htmlFor="endPage" id="endPage-label">Ending Page Number
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="endPage"
                  type="text"
                  aria-required="true"
                  className="form-text"
                  aria-labelledby="endPage-label endPage-status"
                  name="endPage"
                  value={this.state.form.endPage}
                  onChange={e => this.handleUpdate(e, 'endPage')}
                />
                <span
                  className="nypl-field-status"
                  id="endPage-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>
                    {
                      errorClass.endPage ?
                      this.state.error.endPage : 'Enter the last page of your selection.'
                    }
                  </span>
                </span>
              </div>

              <div className={`nypl-text-field ${errorClass.chapterTitle}`}>
                <label htmlFor="chapterTitle" id="chapterTitle-label">Chapter/Article Title
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="chapterTitle"
                  type="text"
                  aria-required="true"
                  aria-labelledby="chapterTitle-label chapterTitle-status"
                  name="chapterTitle"
                  value={this.state.form.chapterTitle}
                  onChange={e => this.handleUpdate(e, 'chapterTitle')}
                />
                <span
                  className="nypl-field-status"
                  id="chapterTitle-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {
                    errorClass.chapterTitle ? this.state.error.chapterTitle : ''
                  }
                </span>
              </div>
            </div>
          </div>
        </fieldset>
        <fieldset className="nypl-fieldset">
          <legend>
            <h3>Additional Details</h3>
          </legend>
          <div className="nypl-row">
            <div className="nypl-column-half">
              <span>
                Feel free to provide more information that could be helpful in processing your
                request. (Additional details are optional and not required.)
              </span>
              <div className="nypl-text-field">
                <label htmlFor="author" id="author-label">&nbsp;Author</label>
                <input
                  id="author"
                  type="text"
                  aria-labelledby="author-label"
                  name="author"
                  value={this.state.form.author}
                  onChange={e => this.handleUpdate(e, 'author')}
                />
              </div>

              <div className="nypl-text-field">
                <label htmlFor="date" id="date-label">Date Published</label>
                <input
                  id="date"
                  type="text"
                  aria-labelledby="date-label"
                  name="date"
                  value={this.state.form.date}
                  onChange={e => this.handleUpdate(e, 'date')}
                />
              </div>

              <div className="nypl-text-field">
                <label htmlFor="volume" id="volume-label">Volume</label>
                <input
                  id="volume"
                  type="text"
                  aria-labelledby="volume-label"
                  name="volume"
                  value={this.state.form.volume}
                  onChange={e => this.handleUpdate(e, 'volume')}
                />
              </div>

              <div className="nypl-text-field">
                <label htmlFor="issue" id="issue-label">Issue</label>
                <input
                  id="issue"
                  type="text"
                  aria-labelledby="issue-label"
                  name="issue"
                  value={this.state.form.issue}
                  onChange={e => this.handleUpdate(e, 'issue')}
                />
              </div>
              <div className="nypl-text-area-with-label">
                <label htmlFor="requestNotes" id="requestNotes-label">Notes</label>
                <p>
                  Provide additional instructions here. For more information on placing an electronic delivery request, please see <a href="https://www.nypl.org/help/request-research-materials">Requesting Research Materials</a>.
                </p>
                <textarea
                  className="nypl-text-area"
                  id="requestNotes"
                  type="text"
                  aria-labelledby="requestNotes-label"
                  name="requestNotes"
                  value={this.state.form.requestNotes}
                  onChange={e => this.handleUpdate(e, 'requestNotes')}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <input type="hidden" name="bibId" value={this.props.bibId} />
        <input type="hidden" name="itemId" value={this.props.itemId} />
        <input type="hidden" name="pickupLocation" value="edd" />
        <input type="hidden" name="itemSource" value={this.props.itemSource} />
        <input
          type="hidden"
          name="searchKeywords"
          value={this.props.searchKeywords}
        />
        <input type="hidden" name="serverRedirect" value={this.props.serverRedirect} />
        <input type="hidden" name="fromUrl" value={this.props.fromUrl} />
        <input type="hidden" name="pickupLocation" value="edd" />

        <button
          type="submit"
          className="nypl-request-button"
          onClick={this.submit}
          onSubmit={this.submit}
        >
          Submit Request
        </button>
      </form>
    );
  }
}

ElectronicDeliveryForm.propTypes = {
  submitRequest: PropTypes.func,
  raiseError: PropTypes.func,
  bibId: PropTypes.string,
  itemId: PropTypes.string,
  itemSource: PropTypes.string,
  error: PropTypes.object,
  form: PropTypes.object,
  defaultEmail: PropTypes.string,
  searchKeywords: PropTypes.string,
  serverRedirect: PropTypes.bool,
  fromUrl: PropTypes.string,
};

ElectronicDeliveryForm.defaultProps = {
  defaultEmail: '',
  searchKeywords: '',
};

export default ElectronicDeliveryForm;
