import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Link } from 'react-router';

import SubjectHeadingsTableBody from './SubjectHeadingsTableBody';
import Range from '../../models/Range';
import appConfig from '../../data/appConfig';

class SubjectHeading extends React.Component {
  constructor(props) {
    super(props);
    const {
      subjectHeading,
      sortBy,
      direction,
    } = this.props;
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
    this.addMore = this.addMore.bind(this);
    this.generateUrl = this.generateUrl.bind(this);
    this.updateSort = this.updateSort.bind(this);
    this.fetchInitial = this.fetchInitial.bind(this);
  }

  componentDidMount() {
    const {
      subjectHeading,
      preOpen,
    } = this.props;
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

  addMore(element, data) {
    this.setState((prevState) => {
      const { narrower } = prevState;
      data.narrower.forEach(
        (child) => { child.indentation = (this.props.subjectHeading.indentation || 0) + 1; }
      );

      narrower.splice(-1, 1, ...data.narrower);

      if (data.next_url) {
        narrower.splice(-1, 1, {
          button: 'next',
          updateParent: this.fetchAndUpdate(data.next_url),
          indentation: (this.props.subjectHeading.indentation || 0) + 1,
        });
      }

      this.setState({
        narrower,
      });
    });
  }

  fetchAndUpdate(url) {
    return (element) => {
      axios(url)
        .then(
          resp => this.addMore(element, resp.data),
        ).catch((resp) => { console.error(resp); });
    };
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
      },
    } = this.props;
    const path = pathname.replace(/\/subject_headings.*/, '');
    return `${path}/subject_headings/${uuid}`;
  }

  updateSort(sortType, direction) {
    this.fetchInitial({
      sortBy: sortType,
      direction,
      range: this.state.range,
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

    const limit = this.state.narrower.length;

    if (additionalParameters.sortBy) sortBy = additionalParameters.sortBy;
    if (additionalParameters.direction) direction = additionalParameters.direction;
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
          narrower.forEach((child) => { child.indentation = (indentation || 0) + 1; });
          if (next_url) {
            narrower[narrower.length - 1] = { button: 'next', updateParent: this.fetchAndUpdate(next_url), indentation: (indentation || 0) + 1 };
          }
          this.updateSubjectHeading(
            Object.assign(
              { narrower, open: true },
              additionalParameters,
            ),
          );
        },
      ).catch(resp => console.error(resp));
  }

  render() {
    const {
      indentation,
      subjectHeading,
      location,
      location: {
        pathname,
        search,
      } = {
        pathname: '',
        search: '',
      },
      container,
      seeMoreText,
      seeMoreLinkUrl,
    } = this.props;

    const {
      label,
      uuid,
      bib_count,
      desc_count,
      children,
    } = subjectHeading;

    const {
      open,
      narrower,
      sortBy,
      direction,
      range,
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
      const innerText = desc_count > 0 ? symbol : '';
      const props = {};

      props.onClick = this.toggleOpen;
      props.className = 'subjectHeadingToggle';

      if (desc_count > 0) {
        props.onKeyDown = event => handleEnter(event);
      }

      return <button {...props}>{innerText}</button>;
    };

    const positionStyle = ['narrower', 'related'].includes(container) ? null : { marginLeft: 30 * ((indentation || 0) + 1) };
    const isMain = (pathname + search).includes(uuid);
    // changes to HTML structure here will need to be replicated in ./SubjectHeadingTableHeader

    return (
      <React.Fragment>
        <tr
          data={`${subjectHeading.uuid}, ${container}`}
          className={`
            subjectHeadingRow
            ${(open || children || isMain) ? 'openSubjectHeading' : ''}
            ${(indentation || 0) === 0 ? 'topLevel' : ''}
            ${(indentation || 0) !== 0 ? 'nestedSubjectHeading' : ''}
          `}
          style={{ backgroundColor: this.props.backgroundColor }}
        >
          <td className={`subjectHeadingsTableCell subjectHeadingLabel ${sortBy === 'alphabetical' ? 'selected' : ''}`} >
            <div className="subjectHeadingLabelInner" style={positionStyle}>
              { toggle() }
              <Link to={this.generateUrl}>
                <span
                  className={`emph ${isMain ? 'mainHeading' : ''}`}
                >
                  {
                    rest === '' || container === 'context' ?
                    null :
                    <span className="noEmph">
                      {`${rest}\u0020--\u00a0`}
                    </span>
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
            container={container}
            parentUuid={uuid}
            sortBy={sortBy}
            direction={direction}
            key={`${uuid}-list-${sortBy}-${direction}`}
            updateSort={this.updateSort}
            seeMoreText={seeMoreText}
            seeMoreLinkUrl={seeMoreLinkUrl}
            preOpen={false}
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
  container: PropTypes.string,
  direction: PropTypes.string,
  seeMoreText: PropTypes.string,
  seeMoreLinkUrl: PropTypes.string,
  backgroundColor: PropTypes.string,
  preOpen: PropTypes.bool,
};

SubjectHeading.defaultProps = {
  indentation: 0,
  preOpen: false,
};

SubjectHeading.contextTypes = {
  router: PropTypes.object,
};

export default SubjectHeading;
