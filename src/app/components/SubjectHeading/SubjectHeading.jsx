import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router';

import SubjectHeadingsTableBody from './SubjectHeadingsTableBody';
import Range from '../../models/Range';
import appConfig from '../../data/appConfig';
import { MediaContext } from '../Application/Application';

class SubjectHeading extends React.Component {
  constructor(props) {
    super(props);
    const {
      subjectHeading,
      sortBy,
      direction,
    } = this.props;
    if (!subjectHeading) return;
    const {
      children,
      range,
      preview,
    } = subjectHeading;
    this.state = {
      open: (!!children && !preview) || this.isMain(),
      narrower: (children || []),
      sortBy: sortBy || 'alphabetical',
      direction: direction || 'ASC',
      range: range || Range.default(),
    };
    this.toggleOpen = this.toggleOpen.bind(this);
    this.updateSubjectHeading = this.updateSubjectHeading.bind(this);
    this.generateUrl = this.generateUrl.bind(this);
    this.updateSort = this.updateSort.bind(this);
  }

  componentDidMount() {
    const {
      subjectHeading,
      preOpen,
    } = this.props;
    if (!subjectHeading) return;
    if (preOpen || subjectHeading.preview) {
      this.fetchInitial();
    }
  }

  componentDidUpdate() {
    if (this.state.narrower.length === 0 && this.props.subjectHeading.children) {
      this.setState({
        narrower: this.props.subjectHeading.children,
        open: true,
        range: this.props.subjectHeading.range,
      });
    }
  }

  updateSubjectHeading(properties) {
    this.setState(properties);
  }

  isMain() {
    const {
      subjectHeading: { uuid },
      location: { pathname },
      linked,
    } = this.props;
    return linked === uuid || pathname.includes(uuid);
  }

  toggleOpen() {
    const {
      open,
    } = this.state;
    if (!open) {
      this.fetchInitial();
    } else {
      this.updateSubjectHeading({ open: false });
    }
  }

  addEmphasis(string) {
    const components = string.split(' -- ');
    return { emph: components.slice(-1), rest: components.slice(0, -1).join(' -- ') };
  }

  generateUrl() {
    const {
      location: {
        pathname,
      },
      subjectHeading: {
        uuid,
        label,
      },
    } = this.props;
    const path = pathname.replace(/\/subject_headings.*/, '');
    return `${path}/subject_headings/${uuid}?label=${encodeURIComponent(label)}`;
  }

  updateSort(sortType, direction, numberOpen) {
    this.fetchInitial({
      sortBy: sortType,
      direction,
      range: Range.default(),
      numberOpen,
    });
  }

  fetchInitial(additionalParameters = {}) {
    const {
      uuid,
      indentation,
    } = this.props.subjectHeading;
    let {
      sortBy,
      direction,
    } = this.state;

    let limit;

    if (additionalParameters.sortBy) sortBy = additionalParameters.sortBy;
    if (additionalParameters.direction) direction = additionalParameters.direction;
    if (additionalParameters.numberOpen) limit = additionalParameters.numberOpen;
    let url = `${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${uuid}/narrower?sort_by=${sortBy}`;

    if (direction) url += `&direction=${direction}`;
    if (limit) url += `&limit=${limit}`;

    axios(url)
      .then(
        (resp) => {
          const {
            narrower,
            next_url,
          } = resp.data;
          if (!narrower) return;
          narrower.forEach((child) => {child.indentation = (indentation || 0) + 1; });
          if (next_url) {
            this.setState({ nextUrl: next_url });
          }
          this.updateSubjectHeading(
            Object.assign(
              {
                narrower,
                open: true,
              },
              additionalParameters,
            ),
          );
        },
      ).catch(resp => console.error(resp));
  }

  render() {
    const {
      subjectHeading,
      seeMoreText,
      seeMoreLinkUrl,
      indentation,
      container,
      location,
    } = this.props;

    if (!subjectHeading) return null;

    const {
      pathname,
      search,
      query: {
        filter,
      },
    } = location;

    const { media } = this.context;

    const {
      label,
      uuid,
      bib_count,
      desc_count,
      onMainPath,
    } = subjectHeading;

    const {
      open,
      narrower,
      sortBy,
      direction,
      range,
      nextUrl,
    } = this.state;

    const {
      emph,
      rest,
    } = this.addEmphasis(label);

    const handleEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.toggleOpen();
      }
    };

    const toggle = () => {
      const symbol = !open ? '+' : '-';
      const props = {};

      props.onClick = this.toggleOpen;
      props.className = 'subjectHeadingToggle';

      if (desc_count > 0) {
        props.onKeyDown = event => handleEnter(event);
      }

      return <button {...props}>{symbol}</button>;
    };

    const marginSize = media === 'mobile' ? 10 : 30;

    const positionStyle = container === 'related' ? null : { marginLeft: marginSize * ((indentation || 0) + 1) };
    const isMain = (pathname + search).includes(uuid);

    const topLevel = indentation === 0;

    const showRest = (
      rest !== '' &&
      container !== 'context' &&
      (media !== 'mobile' || (filter && topLevel))
    );

    // changes to HTML structure here will need to be replicated in ./SubjectHeadingTableHeader
    return (
      <React.Fragment>
        <tr
          className={`
            subjectHeadingRow
            ${open && narrower.length ? 'openSubjectHeading' : ''}
            ${topLevel ? 'topLevel' : 'nestedSubjectHeading'}
          `}
        >
          <td className={`subjectHeadingsTableCell subjectHeadingLabel ${onMainPath ? 'selected' : ''}`} >
            <div className="subjectHeadingLabelInner" style={positionStyle}>
              { desc_count > 0 && toggle() }
              <Link to={this.generateUrl}>
                <span
                  className={`emph ${isMain ? 'mainHeading' : ''}`}
                >
                  {
                    showRest ?
                      <span className="noEmph">
                        {`${rest}\u0020--\u00a0`}
                      </span> :
                      null
                  }
                  {emph}
                </span>
              </Link>
            </div>
          </td>
          <td className={`subjectHeadingsTableCell subjectHeadingAttribute narrower ${sortBy === 'descendants' ? 'selected' : ''}`}>
            <div className="subjectHeadingAttributeInner">
              {`${desc_count || '-'}`}
            </div>
          </td>
          <td className={`subjectHeadingsTableCell subjectHeadingAttribute titles ${sortBy === 'bibs' ? 'selected' : ''}`}>
            <div className="subjectHeadingAttributeInner">
              {bib_count}
            </div>
          </td>
        </tr>
        { open && narrower.length > 0 ?
          <SubjectHeadingsTableBody
            pathname={location.pathname}
            subjectHeadings={narrower}
            nested="true"
            indentation={(indentation || 0) + 1}
            range={range}
            parentUuid={uuid}
            sortBy={sortBy}
            direction={direction}
            key={`${uuid}-list-${sortBy}-${direction}`}
            updateSort={this.updateSort}
            seeMoreText={seeMoreText}
            seeMoreLinkUrl={seeMoreLinkUrl}
            preOpen={false}
            marginSize={marginSize}
            nextUrl={nextUrl}
          />
          : null}
      </React.Fragment>
    );
  }
}

SubjectHeading.propTypes = {
  subjectHeading: PropTypes.object,
  location: PropTypes.object,
  sortBy: PropTypes.string,
  linked: PropTypes.string,
  indentation: PropTypes.number,
  direction: PropTypes.string,
  seeMoreText: PropTypes.string,
  seeMoreLinkUrl: PropTypes.string,
  preOpen: PropTypes.bool,
  container: PropTypes.string,
};

SubjectHeading.defaultProps = {
  indentation: 0,
  preOpen: false,
};

// with new context API, class components may only subscribe to one context
SubjectHeading.contextType = MediaContext;

export default SubjectHeading;
