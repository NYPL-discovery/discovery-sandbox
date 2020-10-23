/* global window */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import appConfig from '../../data/appConfig';

const AccountPage = (props, { router }) => {
  const { patron, accountHtml } = useSelector(state => ({ patron: state.patron, accountHtml: state.accountHtml }));

  useEffect(() => {
    if (!patron.id) {
      const fullUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
    }
  })

  const patronInfoToDisplay = router.location.hash.substring(1) || 'items';
  const { baseUrl } = appConfig;

  return (
    <div className="nypl-full-width-wrapper nypl-patron-page">
      <div className="nypl-patron-details">
          {patron.names[0]}
          <br />
          Email: {patron.emails[0]}
      </div>
      <ul>
        <li><a href={`${baseUrl}/account/${patron.id}/items`}>Checkouts</a></li>
        <li><a href={`${baseUrl}/account/${patron.id}/holds`}>Holds</a></li>
        <li><a href={`${baseUrl}/account/${patron.id}/mylists`}>My Lists</a></li>
        <li><a href={`${baseUrl}/account/${patron.id}/overdues`}>Fines{`${patron.moneyOwed ? ` ($${patron.moneyOwed.toFixed(2)})` : null}`}</a></li>
        <li><a href={`${baseUrl}/account/${patron.id}/msg`}>Messages</a></li>
      </ul>
      <a
        id="modInfoPopupWindowLinkComponent"
        href={`https://ilsstaff.nypl.org:443/patroninfo*eng~Sdefault/${patron.id}/modpinfo`}
        target="_blank"
      >
				My Settings
      </a>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: accountHtml }} />
    </div>
  );
};

AccountPage.contextTypes = {
  router: PropTypes.object,
};

export default AccountPage;
