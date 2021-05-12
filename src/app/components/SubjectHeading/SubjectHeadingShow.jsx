import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import SubjectHeadingsTable from './SubjectHeadingsTable';
import NeighboringHeadingsBox from './NeighboringHeadingsBox';
import BibsList from './BibsList';
import Range from '../../models/Range';
import appConfig from '../../data/appConfig';

class SubjectHeadingShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainHeading: {
        uuid: this.props.params.subjectHeadingUuid,
      },
      contextError: null,
      contextIsLoading: true,
      contextHeadings: [],
      totalBibs: null,
    };

    this.generateFullContextUrl = this.generateFullContextUrl.bind(this);
    this.hasUuid = this.hasUuid.bind(this);
    this.getTopLevelLabel = this.getTopLevelLabel.bind(this);
    this.processContextHeadings = this.processContextHeadings.bind(this);
    this.removeChildrenOffMainPath = this.removeChildrenOffMainPath.bind(this);
  }

  componentDidMount() {
    const { uuid } = this.state.mainHeading;

    axios(`${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/context`)
      .then((res) => {
        const {
          data: {
            subject_headings,
            main_heading: {
              label,
              bib_count,
            },
          },
        } = res;

        this.setState({
          contextHeadings: this.processContextHeadings(subject_headings, uuid),
          mainHeading: {
            label,
            uuid,
          },
          totalBibs: bib_count,
          contextIsLoading: false,
        }, () => {
          this.props.setBannerText(this.state.mainHeading.label);
        });
      })
      .catch(
        (err) => {
          console.error('error: ', err);
          this.setState({
            contextIsLoading: false,
            contextError: true,
            contextHeadings: [],
          });
        },
      );

    axios({
      url: `${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/related`,
    })
      .then((res) => {
        this.setState({
          relatedHeadings: res.data.related_headings,
        });
      })
      .catch(
        (err) => {
          console.error('error: ', err);
        },
      );
  }

  getTopLevelLabel() {
    const {
      contextHeadings,
    } = this.state;
    let indexOfTopLevelAncestor = contextHeadings.findIndex(this.hasUuid);
    indexOfTopLevelAncestor = Math.max(indexOfTopLevelAncestor - 1, 0);
    return contextHeadings[indexOfTopLevelAncestor].label;
  }

  hasUuid(headings) {
    const uuid = this.props.params.subjectHeadingUuid;
    if (Array.isArray(headings)) return headings.some(heading => this.hasUuid(heading));
    return headings.uuid === uuid || this.hasUuid(headings.children || []);
  }

  generateFullContextUrl() {
    const uuid = this.props.params.subjectHeadingUuid;
    const path = this.context.router.location.pathname.replace(/\/subject_headings.*/, '');
    return `${path}/subject_headings?linked=${uuid}`;
  }

  // returns true or false depending on whether the heading has a descendant with the given uuid.
  // If not, removes the children of that heading
  removeChildrenOffMainPath(heading, uuid) {
    const onMainPath =
      heading.uuid === uuid ||
      (heading.children &&
        heading.children.some(child => this.removeChildrenOffMainPath(child, uuid))
      );
    if (!onMainPath) heading.children = null;
    if (onMainPath) heading.onMainPath = true;
    return onMainPath;
  }

  processContextHeadings(headings, uuid) {
    if (!headings) return [];
    headings.forEach((heading) => {
      this.removeChildrenOffMainPath(heading, uuid);
      Range.addRangeData(heading, uuid, 'show');
    });
    const mainHeadingIndex = headings.findIndex(heading =>
      heading.children || heading.uuid === uuid,
    );
    const startIndex = mainHeadingIndex > 0 ? mainHeadingIndex - 1 : 0;
    const endIndex = mainHeadingIndex + 2;
    return headings.slice(startIndex, endIndex);
  }

  render() {
    const {
      contextHeadings,
      contextError,
      contextIsLoading,
      relatedHeadings,
      error,
      mainHeading,
      totalBibs,
    } = this.state;

    const { uuid, label } = mainHeading;

    const { location } = this.context.router;

    const linkUrl = contextHeadings && contextHeadings.length ? this.generateFullContextUrl() : '#';

    if (error) {
      return (<div>Not a subject heading</div>);
    }

    return (
      <React.Fragment>
        {
          label &&
          <BibsList
            uuid={uuid}
            key={this.context.router.location.search}
            shepBibCount={totalBibs}
            label={label}
          />
        }
        <div
          className="nypl-column-half subjectHeadingsSideBar"
        >
          <NeighboringHeadingsBox
            contextHeadings={contextHeadings}
            contextIsLoading={contextIsLoading}
            location={location}
            uuid={uuid}
            linkUrl={linkUrl}
            contextError={contextError}
          />
          {relatedHeadings ?
            <SubjectHeadingsTable
              subjectHeadings={relatedHeadings}
              location={location}
              keyId="related"
              container="related"
              tableHeaderText="Related Headings"
            />
            : null
          }
        </div>
      </React.Fragment>
    );
  }
}

SubjectHeadingShow.propTypes = {
  params: PropTypes.object,
  setBannerText: PropTypes.func,
};

SubjectHeadingShow.contextTypes = {
  router: PropTypes.object,
};


export default SubjectHeadingShow;
