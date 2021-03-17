import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import {
  Heading,
} from '@nypl/design-system-react-components';

import Search from '../components/Search/Search';
import Notification from '../components/Notification/Notification';
import SccContainer from '../components/SccContainer/SccContainer';

import appConfig from '../data/appConfig';

import {
  basicQuery,
  trackDiscovery,
} from '../utils/utils';

const Home = (props, context) => {
  const displayTitle = useSelector(state => state.appConfig.displayTitle);

  return (
    <SccContainer
      className="home"
      activeSection="search"
    >
      <div className="content-header research-search">
        <div className="research-search__inner-content">
          <Search
            createAPIQuery={basicQuery(props)}
            router={context.router}
          />
        </div>
      </div>

      <Notification notificationType="searchResultsNotification" />

      <Heading
        level={2}
        text={`Welcome to ${displayTitle}`}
      />

      <div className="nypl-column-full">
        <p className="nypl-lead">
          The New York Public Library’s {appConfig.displayTitle} provides researchers with access to materials from NYPL, Columbia University, and Princeton University.
          <br />
          Coming Soon: After undergoing significant enhancements, the Shared Collection Catalog will become the Research Catalog and serve as the primary catalog for NYPL’s research collections in early 2021. <a href="https://www.nypl.org/research/collections/about/shared-collection-catalog">Learn more.</a>
        </p>
      </div>
      <div>
        <Heading
          level={3}
        >
          Research at NYPL
        </Heading>

        <div className="nypl-row nypl-quarter-image">
          <div className="nypl-column-one-quarter image-column-one-quarter">
            <img className="nypl-quarter-image" src="https://d2720ur5668dri.cloudfront.net/sites/default/media/styles/extralarge/public/archives-portal.jpg?itok=-oYtHmeO" alt="" role="presentation" />
          </div>
          <div className="nypl-column-three-quarters image-column-three-quarters">
            <Heading
              level={4}
            >
              <a href="/research/collections" onClick={() => trackDiscovery('Research Links', 'Collections')}>Collections</a>
            </Heading>
            <p>Discover our world-renowned research collections, featuring more than 46
              million items.
            </p>
          </div>
        </div>

        <div className="nypl-row nypl-quarter-image">
          <div className="nypl-column-one-quarter image-column-one-quarter">
            <img className="nypl-quarter-image" src="https://d2720ur5668dri.cloudfront.net/sites/default/media/styles/extralarge/public/sasb.jpg?itok=sdQBITR7" alt="" role="presentation" />
          </div>
          <div className="nypl-column-three-quarters image-column-three-quarters">
            <Heading
              level={4}
            >
              <a href="/locations/map?libraries=research" onClick={() => trackDiscovery('Research Links', 'Locations')}>Locations</a>
            </Heading>
            <p>Access items, one-on-one reference help, and dedicated research study rooms.</p>
          </div>
        </div>

        <div className="nypl-row nypl-quarter-image">
          <div className="nypl-column-one-quarter image-column-one-quarter">
            <img className="nypl-quarter-image" src="https://d2720ur5668dri.cloudfront.net/sites/default/media/styles/extralarge/public/divisions.jpg?itok=O4uSedcp" alt="" role="presentation" />
          </div>
          <div className="nypl-column-three-quarters image-column-three-quarters">
            <Heading
              level={4}
            >
              <a href="/research-divisions/" onClick={() => trackDiscovery('Research Links', 'Divisions')}>Divisions</a>
            </Heading>
            <p>Learn about the subject and media specializations of our research divisions.</p>
          </div>
        </div>

        <div className="nypl-row nypl-quarter-image">
          <div className="nypl-column-one-quarter image-column-one-quarter">
            <img className="nypl-quarter-image" src="https://d2720ur5668dri.cloudfront.net/sites/default/media/styles/extralarge/public/plan-you-visit.jpg?itok=scG6cFgy" alt="" role="presentation" />
          </div>
          <div className="nypl-column-three-quarters image-column-three-quarters">
            <Heading
              level={4}
            >
              <a href="/research/support" onClick={() => trackDiscovery('Research Links', 'Support')}>Support</a>
            </Heading>
            <p>
              Plan your in-person research visit and discover resources for scholars and
              writers.
            </p>
          </div>
        </div>

        <div className="nypl-row nypl-quarter-image">
          <div className="nypl-column-one-quarter image-column-one-quarter">
            <img className="nypl-quarter-image" src="https://d2720ur5668dri.cloudfront.net/sites/default/media/styles/extralarge/public/research-services.jpg?itok=rSo9t1VF" alt="" role="presentation" />
          </div>
          <div className="nypl-column-three-quarters image-column-three-quarters">
            <Heading
              level={4}
            >
              <a href="/research/services" onClick={() => trackDiscovery('Research Links', 'Services')}>Services</a>
            </Heading>
            <p>
              Explore services for online and remote researchers,
              as well as our interlibrary services.
            </p>
          </div>
        </div>
      </div>
    </SccContainer>
  );
};

Home.contextTypes = {
  router: PropTypes.object,
};

export default Home;
