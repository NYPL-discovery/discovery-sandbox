import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import SubjectHeading from './SubjectHeading';
import AdditionalSubjectHeadingsButton from './AdditionalSubjectHeadingsButton';
import NestedTableHeader from './NestedTableHeader';
import Range from '../../models/Range';
import appConfig from '../../data/appConfig';

class SubjectHeadingsTableBody extends React.Component {
  constructor(props) {
    super(props);
    const {
      subjectHeadings,
      nextUrl,
    } = props;

    this.state = {
      subjectHeadings,
      range: this.initialRange(props),
      nextUrl,
    };
    this.updateRange = this.updateRange.bind(this);
    this.listItemsInRange = this.listItemsInRange.bind(this);
    this.listItemsInInterval = this.listItemsInInterval.bind(this);
    this.tableRow = this.tableRow.bind(this);
    this.fetchAndUpdate = this.fetchAndUpdate.bind(this);
  }

  initialRange(props) {
    if (props.range) return props.range;
    if (props.subjectHeadings) return new Range(0, Infinity, [{ start: 0, end: Infinity }]);
    return null;
  }

  updateRange(rangeElement, intervalElement, endpoint, increment) {
    // eslint-disable-next-line no-param-reassign
    intervalElement[endpoint] += increment;
    rangeElement.normalize();
    this.setState(prevState => prevState);
  }

  fetchAndUpdate() {
    const {
      nextUrl,
      subjectHeadings,
    } = this.state;
    const apiUrl = nextUrl.replace(/.*\/api\/v0\.1/, `${appConfig.baseUrl}/api/subjectHeadings`);
    axios(apiUrl)
      .then(
        (resp) => {
          const {
            data: {
              narrower,
              next_url,
            },
          } = resp;
          if (narrower) {
            this.setState({
              subjectHeadings: subjectHeadings.concat(narrower),
              nextUrl: next_url,
            });
          } else {
            this.setState({ nextUrl: false });
          }
        },
      ).catch((resp) => { console.error(resp); });
  }

  listItemsInRange() {
    const {
      range,
    } = this.state;

    const lastIndex = range.intervals.length - 1;

    return range.intervals.reduce((acc, interval, index) =>
      acc.concat(this.listItemsInInterval(interval, index, lastIndex))
      , []);
  }

  listItemsInInterval(interval, index, lastIndex) {
    const { indentation } = this.props;
    const { subjectHeadings, range, nextUrl } = this.state;
    const { container } = this.context;
    const { start, end } = interval;
    const subjectHeadingsInInterval = subjectHeadings.filter((el, i) => i >= start && i <= end);
    const isContext = container === 'context';
    if (subjectHeadings[start - 1] && !isContext) {
      subjectHeadingsInInterval.unshift({
        button: 'previous',
        indentation,
        updateParent: () => this.updateRange(range, interval, 'start', -10),
      });
    }
    if (end !== Infinity && subjectHeadings[end + 1]) {
      subjectHeadingsInInterval.push({
        button: isContext ? 'contextMore' : 'next',
        indentation,
        noEllipse: index === lastIndex,
        updateParent: () => this.updateRange(range, interval, 'end', 10),
      });
    }
    if (end === Infinity && nextUrl) {
      subjectHeadingsInInterval.push({
        button: isContext ? 'contextMore' : 'next',
        indentation,
        noEllipse: true,
        updateParent: this.fetchAndUpdate,
      });
    }
    return subjectHeadingsInInterval;
  }

  tableRow(listItem, index) {
    const {
      indentation,
      nested,
      sortBy,
      linked,
      direction,
      seeMoreText,
      seeMoreLinkUrl,
      preOpen,
      marginSize,
    } = this.props;
    const { container, router } = this.context;
    const { location } = this.context.router;

    if (listItem.button) {
      return (
        <AdditionalSubjectHeadingsButton
          indentation={listItem.indentation + 1 || indentation + 1}
          button={listItem.button}
          updateParent={listItem.updateParent}
          key={`${listItem.button}${listItem.indentation}${index}`}
          nested={nested}
          text={seeMoreText}
          noEllipse={listItem.noEllipse}
          marginSize={marginSize}
        />
      );
    }

    return (
      <SubjectHeading
        subjectHeading={listItem}
        key={listItem.uuid}
        nested={nested}
        indentation={indentation}
        location={location}
        sortBy={sortBy}
        linked={linked}
        seeMoreText={seeMoreText}
        seeMoreLinkUrl={seeMoreLinkUrl}
        direction={direction}
        preOpen={preOpen}
        container={container}
        router={router}
      />
    );
  }

  render() {
    const {
      subjectHeadings,
    } = this.state;

    if (!subjectHeadings) return null;

    const {
      nested,
      parentUuid,
      indentation,
      sortBy,
      direction,
      updateSort,
      marginSize,
    } = this.props;

    const {
      container,
    } = this.context;

    const inRange = this.listItemsInRange(subjectHeadings);

    const numberOpen = inRange.filter(item => !item.button).length;

    return (
      <React.Fragment>
        {nested && subjectHeadings && container !== 'context' ?
          <NestedTableHeader
            parentUuid={parentUuid}
            key={`nestedTableHeader${indentation}`}
            indentation={indentation}
            sortBy={sortBy}
            direction={direction}
            updateSort={updateSort}
            interactive={subjectHeadings.length > 1}
            numberOpen={numberOpen}
            marginSize={marginSize}
          />
          : null
        }
        {inRange.map(this.tableRow)}
      </React.Fragment>
    );
  }
}

SubjectHeadingsTableBody.propTypes = {
  nested: PropTypes.bool,
  subjectHeadings: PropTypes.array,
  indentation: PropTypes.number,
  linked: PropTypes.string,
  sortBy: PropTypes.string,
  parentUuid: PropTypes.string,
  updateSort: PropTypes.func,
  nextUrl: PropTypes.string,
  seeMoreText: PropTypes.string,
  seeMoreLinkUrl: PropTypes.string,
  direction: PropTypes.string,
  preOpen: PropTypes.bool,
  marginSize: PropTypes.number,
};

SubjectHeadingsTableBody.defaultProps = {
  indentation: 0,
};

SubjectHeadingsTableBody.contextTypes = {
  router: PropTypes.object,
  container: PropTypes.string,
};

export default SubjectHeadingsTableBody;
