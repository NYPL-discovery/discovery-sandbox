import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Breadcrumbs from '../Breadcrumbs/Breadcrumbs.jsx';
import Store from '../../stores/Store.js';
import PatronStore from '../../stores/PatronStore.js';
import config from '../../../../appConfig.js';
import LibraryItem from '../../utils/item.js';

class HoldRequest extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: Store.getState(),
      patron: PatronStore.getState(),
    };
    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    this.requireUser();
  }

  onChange() {
    this.setState({ data: Store.getState() });
  }

  requireUser() {
    if (!this.state.patron || !this.state.patron.id.length) {
      const fullUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${config.loginUrl}?redirect_uri=${fullUrl}`);
      return false;
    }
    return true;
  }

  render() {
    const searchKeywords = this.props.searchKeywords;
    const record = this.props.bib;
    const title = record.title[0];
    const bibId = record['@id'].substring(4);
    const itemId = this.props.params.id;
    const selectedItem = LibraryItem.getItem(record, itemId);
    const location = LibraryItem.getLocation(record, itemId);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July',
      'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    let date = new Date();
    date.setDate(date.getDate() + 7);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const dateDisplay = `${monthNames[monthIndex]} ${day}`;

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

        <div className="content-wrapper">
          <div className="item-header">
            <h1>Research item hold request</h1>
          </div>

          <div className="item-summary">
            <div className="item">
              <h2>You are about to request a hold on the following research item:</h2>
              <Link href={`/item/${bibId}`}>{title}</Link>
            </div>
          </div>

          <form className="place-hold-form form" action={`/hold/request/${itemId}`} method="POST">
            <h2>Confirm account</h2>

            <p>You are currently logged in as <strong>{this.state.patron.names[0]}</strong>. If this is not you, please <a href="https://isso.nypl.org/auth/logout">Log out</a> and sign in using your library card.</p>

            <h2>Confirm delivery location</h2>

            <p>When this item is ready, you will use it in the following location:</p>

            <fieldset className="select-location-fieldset">
              <legend className="visuallyHidden">Select a pickup location</legend>
              <div className="group selected">
                <span className="col location">
                  <a href={`${location.uri}`}>{location["full-name"]}</a><br />{location.address.address1}<br />
                  {location.prefLabel}
                  {location.offsite &&
                    <span>
                      <br /><small>(requested from offsite storage)</small><br />
                    </span>
                  }
                </span>
                {selectedItem.shelfMark &&
                  <span className="col">
                    <small>Call number:</small><br />{selectedItem.shelfMark[0]}
                  </span>
                }
                {/*<span className="col"><small>Ready by approximately:</small><br />{dateDisplay}, 9am.</span>*/}
              </div>
            </fieldset>

            <input type="hidden" name="pickupLocation" value={location.code} />

            <button type="submit" className="large">
              Submit your item hold request
            </button>
          </form>
        </div>
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
};

export default HoldRequest;
