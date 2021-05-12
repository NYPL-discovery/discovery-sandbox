import React from 'react';
import PropTypes from 'prop-types';

import AscendingIcon from '../../../client/icons/Ascending';
import DescendingIcon from '../../../client/icons/Descending';
import DefaultIcon from '../../../client/icons/DefaultSort';

const SortButton = (props) => {
  const {
    type,
    calculateDirection,
    handler,
    interactive,
    numberOpen,
    active,
  } = props;

  const columnText = {
    bibs: 'Titles',
    descendants: 'Subheadings',
    alphabetical: 'Heading',
  }[type];

  if (!columnText) return null;

  const defaultSort = {
    alphabetical: 'ASC',
    bibs: 'DESC',
    descendants: 'DESC',
  }[type];

  const nextDirection = calculateDirection ? calculateDirection(type) : defaultSort;

  const icon = () => {
    if (!active) return <DefaultIcon />;
    else if (nextDirection === 'ASC') return <DescendingIcon />;
    return <AscendingIcon />;
  };

  return (
    <button
      className="subjectSortButton"
      onClick={() => handler(type, nextDirection, numberOpen)}
      disabled={!handler || !interactive || numberOpen < 2}
    >
      <span className="emph">
        <span className="noEmph">{columnText}
          {(handler && interactive) ? <span className="sortCharacter">{ icon() }</span> : null}
        </span>
      </span>
    </button>
  );
};

SortButton.propTypes = {
  handler: PropTypes.func,
  type: PropTypes.string,
  interactive: PropTypes.bool,
  numberOpen: PropTypes.number,
  calculateDirection: PropTypes.func,
  active: PropTypes.bool,
};

export default SortButton;
