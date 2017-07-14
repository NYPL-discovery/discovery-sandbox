import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import axios from 'axios';

import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import PatronStore from '../../stores/PatronStore.js';
import config from '../../../../appConfig.js';
import LibraryItem from '../../utils/item.js';
import {
  isArray as _isArray,
  isEmpty as _isEmpty,
  extend as _extend,
} from 'underscore';

class HoldRequest extends React.Component {
  constructor(props) {
    super(props);

    this.state = _extend({
      delivery: false,
    }, { patron: PatronStore.getState() });

    // change all the components :(
    this.onChange = this.onChange.bind(this);
    this.onRadioSelect = this.onRadioSelect.bind(this);
    this.submitRequest = this.submitRequest.bind(this);
  }

  componentDidMount() {
    this.requireUser();
  }

  onChange() {
    this.setState({ patron: PatronStore.getState() });
  }

  onRadioSelect(e) {
    this.setState({ delivery: e.target.value });
  }

  /**
   * requireUser()
   * Redirects the patron to OAuth log in page if he/she hasn't been logged in yet.
   *
   * @return {Boolean}
   */
  requireUser() {
    if (this.state.patron && this.state.patron.id) {
      return true;
    }

    const fullUrl = encodeURIComponent(window.location.href);

    window.location.replace(`${config.loginUrl}?redirect_uri=${fullUrl}`);

    return false;
  }

  /**
   * submitRequest()
   * Client-side submit call.
   */
  submitRequest(e, bibId, itemId) {
    e.preventDefault();

    let path = `/hold/confirmation/${bibId}-${itemId}`;

    if (this.state.delivery === 'edd') {
      path = `/hold/request/${bibId}-${itemId}/edd`;

      this.context.router.push(path);
    }

    axios
      .get(`/api/newHold?itemId=${itemId}&pickupLocation=${this.state.delivery}`)
      .then(response => {
        if (response.data.error && response.data.error.status !== 200) {
          this.context.router.push(`${path}?errorMessage=${response.data.error.statusText}`);
        } else {
          this.context.router.push(
            `${path}?pickupLocation=${response.data.pickupLocation}&requestId=${response.data.id}`
          );
        }
      })
      .catch(error => {
        console.log(error);
        this.context.router.push(`${path}?errorMessage=${error}`);
      });
  }

  /**
   * renderLoggedInInstruction(patronName)
   * Renders the HTML elements and contents based on the patron data
   *
   * @param {String} patronName
   * @return {HTML Element}
   */
  renderLoggedInInstruction(patronName) {
    return (patronName) ?
      <p className="loggedInInstruction">
        You are currently logged in as <strong>{patronName}</strong>. If this is not you,
        please <a href="https://isso.nypl.org/auth/logout">Log out</a> and sign in using
        your library card.
      </p>
      :
      <p className="loggedInInstruction">
        Something went wrong retrieving your personal information.
      </p>;
  }

  renderEDD() {
    return (
      <div className="group selected">
        <input
          type="radio"
          name="delivery-location"
          id="edd-option"
          value="edd"
          onChange={this.onRadioSelect}
        />
        <label htmlFor="edd-option">
          <span className="col location">
            Electronic Delivery<br />
            Have up to 50 pages of this document scanned and sent to you via email
          </span>
        </label>
      </div>
    );
  }

  renderDeliveryLocation(deliveryLocations = []) {
    return deliveryLocations.map((location, i) => (
      <div key={i} className="group selected">
        <input
          type="radio"
          name="delivery-location"
          id={`location${i}`}
          value={location['@id'].replace('loc:', '')}
          onChange={this.onRadioSelect}
        />
        <label htmlFor={`location${i}`}>
          <span className="col location">
            <a href={`${location.uri}`}>{location.prefLabel}</a>
            <br />{location.address && location.address.address1}<br />
            {location.offsite &&
              <span>
                <br /><small>(requested from offsite storage)</small><br />
              </span>
            }
          </span>
        </label>
      </div>
    ));
  }

  render() {
    const searchKeywords = this.props.searchKeywords || '';
    const bib = (this.props.bib && !_isEmpty(this.props.bib)) ?
      this.props.bib : null;
    const title = (bib && _isArray(bib.title) && bib.title.length) ?
      bib.title[0] : '';
    const bibId = (bib && bib['@id'] && typeof bib['@id'] === 'string') ?
      bib['@id'].substring(4) : '';
    const patronName = (
      this.state.patron.names && _isArray(this.state.patron.names) && this.state.patron.names.length
      ) ? this.state.patron.names[0] : '';
    const itemId = (this.props.params && this.props.params.itemId) ? this.props.params.itemId : '';
    const selectedItem = (bib && itemId) ? LibraryItem.getItem(bib, itemId) : null;
    const callNo =
      (selectedItem && selectedItem.callNumber && selectedItem.callNumber.length) ?
      (
        <div className="col">
          <small>Call number:</small><br />{selectedItem.callNumber}
        </div>
      ) : null;
    let content = null;

    if (bib) {
      content = (
        <div className="content-wrapper">
          <div className="item-header">
            <h1>Research item hold request</h1>
          </div>

          <div className="item-summary">
            <div className="item">
              <h2>You are about to request a hold on the following research item:</h2>
              <Link href={`/bib/${bibId}`}>{title}</Link>
              {callNo}
            </div>
          </div>

          <form
            className="place-hold-form form"
            action={`/hold/request/${bibId}-${itemId}`}
            method="POST"
            onSubmit={(e) => this.submitRequest(e, bibId, itemId)}
          >
            <h2>Confirm account</h2>
            {this.renderLoggedInInstruction(patronName)}
            <h2>Confirm delivery location</h2>
            <p>When this item is ready, you will use it in the following location:</p>
            <fieldset className="select-location-fieldset">
              <legend className="visuallyHidden">Select a pickup location</legend>
              {(this.props.isEddRequestable) && this.renderEDD()}
              {this.renderDeliveryLocation(this.props.deliveryLocations)}
            </fieldset>

            <input type="hidden" name="pickupLocation" value="test" />

            <button
              type="submit"
              className="large"
            >
              Submit your item hold request
            </button>
          </form>
        </div>);
    } else {
      content = (
        <div className="content-wrapper">
          <div className="item-header">
            <h1>Research item hold request</h1>
          </div>
          <div className="item-summary">
            <div className="item">
              <h2>Something went wrong with your request</h2>
              <Link href={`/bib/${bibId}`}>{title}</Link>
            </div>
          </div>
          <h2>Confirm account</h2>
          {this.renderLoggedInInstruction(patronName)}
        </div>);
    }

    return (
      <div id="mainContent">
        <div className="page-header">
          <div className="content-wrapper">
            <Breadcrumbs
              query={searchKeywords}
              type="hold"
              title={title}
              url={bibId}
            />
          </div>
        </div>
        {content}
      </div>
    );
  }
}

HoldRequest.contextTypes = {
  router: PropTypes.object,
};

HoldRequest.propTypes = {
  location: React.PropTypes.object,
  bib: React.PropTypes.object,
  searchKeywords: React.PropTypes.string,
  params: React.PropTypes.object,
  deliveryLocations: React.PropTypes.array,
  isEddRequestable: React.PropTypes.bool,
};

HoldRequest.defaultProps = {
  location: {},
  bib: {},
  searchKeywords: '',
  params: {},
  deliveryLocations: [],
  isEddRequestable: false,
};

export default HoldRequest;
