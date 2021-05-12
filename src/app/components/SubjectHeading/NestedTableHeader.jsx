import React from 'react';
import PropTypes from 'prop-types';
import calculateDirection from '@calculateDirection';

import SortButton from './SortButton';

const NestedTableHeader = (props) => {
  const {
    indentation,
    sortBy,
    direction,
    updateSort,
    numberOpen,
    interactive,
    marginSize,
  } = props;

  const positionStyle = { marginLeft: marginSize * ((indentation || 0) + 1) };
  const calculateDirectionForType = calculateDirection(sortBy, direction);

  const sortButtons = {};
  ['alphabetical', 'descendants', 'bibs'].forEach((type) => {
    sortButtons[type] = (
      <SortButton
        handler={updateSort}
        type={type}
        calculateDirection={calculateDirectionForType}
        interactive={interactive}
        numberOpen={numberOpen}
        active={sortBy === type}
      />
    );
  });


  return (
    <tr
      className="nestedTableHeader"
    >
      <th className={`subjectHeadingsTableCell subjectHeadingLabel ${sortBy === 'alphabetical' ? 'selected' : ''}`} >
        <div className="subjectHeadingLabelInner" style={positionStyle}>
          {sortButtons.alphabetical}
        </div>
      </th>
      <th className={`subjectHeadingsTableCell subjectHeadingAttribute narrower ${sortBy === 'descendants' ? 'selected' : ''}`}>
        {sortButtons.descendants}
      </th>
      <th className={`subjectHeadingsTableCell subjectHeadingAttribute titles ${sortBy === 'bibs' ? 'selected' : ''}`}>
        {sortButtons.bibs}
      </th>
    </tr>
  );
};

NestedTableHeader.propTypes = {
  indentation: PropTypes.number,
  sortBy: PropTypes.string,
  direction: PropTypes.string,
  updateSort: PropTypes.func,
  interactive: PropTypes.bool,
  numberOpen: PropTypes.number,
  marginSize: PropTypes.number,
};

NestedTableHeader.defaultProps = {
  // value used for desktop margins
  marginSize: 30,
};

export default NestedTableHeader;
