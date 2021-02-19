/* global window, document */
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Breadcrumbs,
  Button,
  ButtonTypes,
  Heading,
  Hero,
  HeroTypes,
  Link,
  SkeletonLoader,
} from '@nypl/design-system-react-components';
import moment from 'moment'

import LinkTabSet from './LinkTabSet';
import AccountSettings from './AccountSettings';
import AccountContent from './AccountContent';

import { manipulateAccountPage, makeRequest, buildReqBody } from '../../utils/accountPageUtils';


const AccountPage = (props) => {
  const { patron, accountHtml, appConfig } = useSelector(state => ({
    patron: state.patron,
    accountHtml: state.accountHtml,
    appConfig: state.appConfig,
  }));

  const content = props.params.content || 'items';

  const [itemToCancel, setItemToCancel] = useState(null);

  useEffect(() => {
    if (!patron.id) {
      const fullUrl = encodeURIComponent(window.location.href);
      window.location.replace(`${appConfig.loginUrl}?redirect_uri=${fullUrl}`);
    }
  }, [patron]);

  const { baseUrl } = appConfig;

  const cancelItem = () => {
    const body = buildReqBody(content, {
      currentsortorder: 'current_pickup',
      updateholdssome: 'YES',
      [itemToCancel.name]: itemToCancel.value,
    });

    makeRequest(
      updateAccountHtml,
      patron.id,
      body,
      content,
      setIsLoading,
    );

    setItemToCancel(null);
  };

  const formattedExpirationDate = patron.expirationDate ?  moment(patron.expirationDate).format("MM-DD-YYYY") : '';

  return (
    <div className="nypl-ds nypl--research layout-container">
      <main className="main" id="mainContent">
        <div className="content-header">
          <Breadcrumbs
            breadcrumbs={[
              { url: "htttps://www.nypl.org", text: "Home" },
              { url: "https://www.nypl.org/research", text: "Research" },
              { url: baseUrl, text: "Research Catalog" },
            ]}
            className="breadcrumbs"
          />
          <Hero
            heroType={HeroTypes.Secondary}
            heading={(
              <>
                <Heading
                  level={1}
                  id={"1"}
                  text="Research Catalog"
                />
                <nav
                  className="sub-nav apply-brand-styles"
                  aria-label="sub-nav"
                >
                  <Link
                    className="sub-nav__link"
                    href={baseUrl}
                  >
                    Search
                  </Link> |&nbsp;
                  <Link
                    className="sub-nav__link"
                    href={`${baseUrl}/subject_headings`}
                  >
                    Subject Heading Explorer
                  </Link> |&nbsp;
                  <span
                    className="sub-nav__active-section"
                  >
                    My Account
                  </span>
                </nav>
              </>
            )}
            className="apply-brand-styles hero"
          />
        </div>
        <div className="content-primary page-content nypl-patron-page">
          <Heading
            level={2}
            id="2"
            text="My Account"
          />
          <div className="nypl-patron-details">
            <div className="name">{patron.names ? patron.names[0] : null}</div>
            <div>{patron.barcodes ? patron.barcodes[0] : null}</div>
            <div>Expiration Date: {formattedExpirationDate}</div>
          </div>
          {itemToCancel ? (
            <div className="scc-modal">
              <div>
                <p>You requested <span>canceling</span> of following item:</p>
                <p>{itemToCancel.title}</p>
                <Button
                  buttonType={ButtonTypes.Secondary}
                  onClick={() => setItemToCancel(null)}
                >Back
                </Button>
                <Button
                  buttonType={ButtonTypes.Primary}
                  onClick={cancelItem}
                >Confirm
                </Button>
              </div>
            </div>
          ) : null}
          <LinkTabSet
            activeTab={content}
            tabs={[
              {
                label: 'Checkouts',
                link: `${baseUrl}/account/items`,
                content: 'items'
              },
              {
                label: 'Holds',
                link: `${baseUrl}/account/holds`,
                content: 'holds',
              },
              {
                label: `Fines${patron.moneyOwed ? ` ($${patron.moneyOwed.toFixed(2)})` : ''}`,
                link: `${baseUrl}/account/overdues`,
                content: 'overdues',
              },
              {
                label: 'Account Settings',
                link: `${baseUrl}/account/settings`,
                content: 'settings',
              },
            ]}
          />
          <AccountContent
            contentType={content}
            setItemToCancel={setItemToCancel}
          />
        </div>
      </main>
    </div>
  );
};

AccountPage.propTypes = {
  params: PropTypes.object,
};

AccountPage.contextTypes = {
  router: PropTypes.object,
};

export default AccountPage;
