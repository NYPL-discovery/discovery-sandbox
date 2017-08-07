import React from 'react';
import PropTypes from 'prop-types';
import { validate } from '../../utils/formValidationUtils';
import appConfig from '../../../../appConfig';

import {
  mapObject as _mapObject,
  extend as _extend,
  isEmpty as _isEmpty,
} from 'underscore';


class ElectronicDeliveryForm extends React.Component {
  constructor(props) {
    super(props);

    // NOTE
    // this.props.form and this.props.error are coming from the server only in the
    // no-js scenario. If they're not available, then we use this 'fallback', but the
    // empty object structure is needed.
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
    // Kind of hard to read. Basically, the `form` property is being updated and all
    // the values are being retained. If we don't `extend` the object value for `form`,
    // then only the last value in the form gets updated and the rest are gone.
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

    const defaultPageMsg = 'You may request a maximum of 50 pages.';

    // A lot of this can be refactored to be in a loop but that's a later and next step.
    // I was thinking each `nypl-text-field` or `nypl-year-field` div can be
    // its own component in a loop with the required props and errors passed down.
    return (
      <form
        className="place-hold-form form electronic-delivery-form"
        action={`${appConfig.baseUrl}/edd`}
        method="POST"
        onSubmit={(e) => this.submit(e)}
        id="edd-request"
      >
        <fieldset>
          <legend>Contact Information</legend>
          <div className="nypl-row">
            <div className="nypl-column-half">
              <h4>Contact Information</h4>

              <div className={`nypl-text-field ${errorClass.emailAddress}`}>
                <label htmlFor="email-address" id="email-address-label">Email Address
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="email-address"
                  type="text"
                  required
                  aria-labelledby="email-address-label email-address-status"
                  aria-required="true"
                  name="emailAddress"
                  value={this.state.form.emailAddress}
                  onChange={(e) => this.handleUpdate(e, 'emailAddress')}
                />
                <span
                  className="nypl-field-status"
                  id="email-address-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {
                    errorClass.emailAddress ? this.state.error.emailAddress :
                    'Your request will be delivered to the email address you enter above.'
                  }
                </span>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Chapter or Article Information</legend>
          <div className="nypl-row">
            <div className="nypl-column-half">
              <h4>Chapter or Article Information</h4>

              <div className={`nypl-text-field ${errorClass.chapterTitle}`}>
                <label htmlFor="chapter-title" id="chapter-title-label">Chapter / Article Title
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="chapter-title"
                  type="text"
                  required
                  aria-labelledby="chapter-title-label chapter-title-status"
                  name="chapterTitle"
                  value={this.state.form.chapterTitle}
                  onChange={(e) => this.handleUpdate(e, 'chapterTitle')}
                />
                <span
                  className="nypl-field-status"
                  id="chapter-title-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {
                    errorClass.chapterTitle ? this.state.error.chapterTitle :
                    'Enter "none" if you are requesting an entire item.'
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="nypl-row">
            <div className="nypl-column-one-quarter">
              <div className="nypl-text-field">
                <label htmlFor="author" id="author-label">&nbsp;Article Author</label>
                <input
                  id="author"
                  type="text"
                  aria-labelledby="author-label"
                  name="author"
                  value={this.state.form.author}
                  onChange={(e) => this.handleUpdate(e, 'author')}
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
                  onChange={(e) => this.handleUpdate(e, 'date')}
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
                  onChange={(e) => this.handleUpdate(e, 'volume')}
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
                  onChange={(e) => this.handleUpdate(e, 'issue')}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="number-range">
          <legend>Select Page Number Range (Max 50 pages)</legend>
          <div className="nypl-row">
            <div className="nypl-column-half">
              <h4>Select Page Number Range (Max 50 pages)</h4>
            </div>
          </div>

          <div className="nypl-row">
            <div className="nypl-column-one-quarter">
              <div className={`nypl-text-field ${errorClass.startPage}`}>
                <label htmlFor="start-page" id="start-page-label">Starting Page
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="start-page"
                  type="text"
                  required
                  className="form-text"
                  aria-labelledby="start-page-label start-page-status"
                  name="startPage"
                  value={this.state.form.startPage}
                  onChange={(e) => this.handleUpdate(e, 'startPage')}
                />
                <span
                  className="nypl-field-status"
                  id="start-page-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>{errorClass.startPage ? this.state.error.startPage : defaultPageMsg}</span>
                </span>
              </div>

              <div className={`nypl-text-field ${errorClass.endPage}`}>
                <label htmlFor="end-page" id="end-page-label">Ending Page
                  <span className="nypl-required-field">&nbsp;Required</span>
                </label>
                <input
                  id="end-page"
                  type="text"
                  required
                  className="form-text"
                  aria-labelledby="end-page-label end-page-status"
                  name="endPage"
                  value={this.state.form.endPage}
                  onChange={(e) => this.handleUpdate(e, 'endPage')}
                />
                <span
                  className="nypl-field-status"
                  id="end-page-status"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>{errorClass.endPage ? this.state.error.endPage : defaultPageMsg}</span>
                </span>
              </div>

              <div className="nypl-text-field">
                <label htmlFor="request-notes" id="request-notes-label">Additional Notes</label>
                <textarea
                  className="nypl-text-area"
                  id="request-notes"
                  type="text"
                  aria-labelledby="request-notes-label"
                  name="requestNotes"
                  value={this.state.form.requestNotes}
                  onChange={(e) => this.handleUpdate(e, 'requestNotes')}
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
          value={(this.props.searchKeywords) ? this.props.searchKeywords : ''}
        />

        <button
          type="submit"
          className="nypl-request-button"
          onClick={this.submit}
          onSubmit={this.submit}
        >
          Submit request
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
  pickupLocation: PropTypes.string,
  error: PropTypes.object,
  form: PropTypes.object,
  defaultEmail: PropTypes.string,
  searchKeywords: PropTypes.string,
};

ElectronicDeliveryForm.defaultProps = {
  defaultEmail: '',
};

export default ElectronicDeliveryForm;
