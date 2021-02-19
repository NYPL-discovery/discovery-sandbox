import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  SkeletonLoader,
} from '@nypl/design-system-react-components';

import { manipulateAccountPage, makeRequest, buildReqBody } from '../../utils/accountPageUtils';

const AccountContent = ({ contentType, setItemToCancel }) => {
  const { patron, accountHtml, appConfig, loading } = useSelector(state => ({
    patron: state.patron,
    accountHtml: state.accountHtml,
    loading: state.loading,
  }));

  const dispatch = useDispatch();
  const updateAccountHtml = newContent => dispatch({
    type: 'UPDATE_ACCOUNT_HTML',
    payload: newContent,
  });
  const updateLoadingStatus = loadingStatus => dispatch({
    type: 'UPDATE_LOADING_STATUS',
    payload: loadingStatus,
  });

  useEffect(() => {
    if (contentType === 'settings') {
      updateLoadingStatus(false);
      return;
    }
    const accountPageContent = document.getElementById('account-page-content');

    if (accountPageContent) {
      const eventListeners = manipulateAccountPage(
        accountPageContent,
        updateAccountHtml,
        patron,
        contentType,
        updateLoadingStatus,
        setItemToCancel,
      );

      return () => {
        if (eventListeners) {
          eventListeners.forEach(({ element, cb }) => {
            element.removeEventListener('click', cb);
          });
        }
      };
    }
  }, [accountHtml]);

  return (
    <>
      {loading && contentType !== 'settings' ? <SkeletonLoader /> : ''}
      {
        typeof accountHtml === 'string' && contentType !== 'settings' ? (
          <div
            dangerouslySetInnerHTML={{ __html: accountHtml }}
            id="account-page-content"
            className={`${contentType} ${loading ? 'loading' : ''}`}
          />
        ) : ''
      }
      {
        contentType === 'settings' ? (
          <AccountSettings
            patron={patron}
            legacyCatalog={appConfig.legacyCatalog}
          />
        ) : null
      }
    </>
  );
}

export default AccountContent;
