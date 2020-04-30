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
      parentUuid,
      pathname,
    } = props;

    this.state = {
      subjectHeadings,
      range: this.initialRange(props),
    };
    this.updateRange = this.updateRange.bind(this);
    this.listItemsInRange = this.listItemsInRange.bind(this);
    this.listItemsInInterval = this.listItemsInInterval.bind(this);
    this.tableRow = this.tableRow.bind(this);
  }

  componentDidMount() {
    const { linked } = this.props;

    if (linked) {
      const url = `${appConfig.baseUrl}/api/subjectHeadings/subject_headings/${linked}/context?type=relatives`;
      axios(url)
        .then((res) => {
          this.mergeSubjectHeadings(res.data.subject_headings, linked);
        })
        .catch(console.error);
    }
  }

  mergeSubjectHeadings(incomingSubjectHeadings, linked) {
    const responseSubjectHeading = incomingSubjectHeadings[0];
    Range.addRangeData(responseSubjectHeading, linked);
    this.setState((prevState) => {
      const { subjectHeadings } = prevState;
      const existingSubjectHeadingIndex = subjectHeadings.findIndex(
        heading => heading.uuid === responseSubjectHeading.uuid,
      );
      subjectHeadings[existingSubjectHeadingIndex] = responseSubjectHeading;
      return { subjectHeadings };
    });
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
    const { subjectHeadings, range } = this.state;
    const { start, end } = interval;
    const subjectHeadingsInInterval = subjectHeadings.filter((el, i) => i >= start && i <= end);
    if (subjectHeadings[start - 1]) {
      subjectHeadingsInInterval.unshift({
        button: 'previous',
        indentation,
        updateParent: () => this.updateRange(range, interval, 'start', -10),
      });
    }
    if (end !== Infinity && subjectHeadings[end + 1]) {
      subjectHeadingsInInterval.push({
        button: 'next',
        indentation,
        noEllipse: index === lastIndex,
        updateParent: () => this.updateRange(range, interval, 'end', 10),
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
    } = this.props;


    const { location } = this.context.router;

    if (listItem.button) {
      return (
        <AdditionalSubjectHeadingsButton
          indentation={listItem.indentation || indentation}
          button={listItem.button}
          updateParent={listItem.updateParent}
          key={`${listItem.button}${listItem.indentation}${index}`}
          nested={nested}
          linkUrl={seeMoreLinkUrl}
          text={seeMoreText}
          noEllipse={listItem.noEllipse}
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
      />
    );
  }

  render() {
    const {
      subjectHeadings,
    } = this.state;

    const {
      nested,
      parentUuid,
      indentation,
      sortBy,
      direction,
      updateSort,
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
          />
          : null
        }
        {
          subjectHeadings ?
          inRange.map(this.tableRow) :
          null
        }
      </React.Fragment>
    );
  }
}

SubjectHeadingsTableBody.propTypes = {
  nested: PropTypes.string,
  subjectHeadings: PropTypes.array,
  indentation: PropTypes.number,
  linked: PropTypes.string,
  sortBy: PropTypes.string,
  parentUuid: PropTypes.string,
  updateSort: PropTypes.func,
  pathname: PropTypes.string,
  seeMoreText: PropTypes.string,
  seeMoreLinkUrl: PropTypes.string,
  direction: PropTypes.string,
};

SubjectHeadingsTableBody.defaultProps = {
  indentation: 0,
};

SubjectHeadingsTableBody.contextTypes = {
  router: PropTypes.object,
  container: PropTypes.string,
};

export default SubjectHeadingsTableBody;
