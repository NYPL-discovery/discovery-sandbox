import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Button, Icon } from '@nypl/design-system-react-components';
import FocusTrap from 'focus-trap-react';

import { isOptionSelected } from '../../utils/utils';

// export for testing purposes
export const parseDistinctOptions = options => Array.from(
  new Set(options.reduce((optionIds, option) => {
    if (option.id && option.id.length) optionIds.push(option.id);
    return optionIds;
  }, [])))
  .map(id => ({
    id,
    label: options.find(option => (option.id === id && option.label.length)).label,
  }));

const ItemFilter = ({
  filter,
  options,
  openFilter,
  manageFilterDisplay,
  mobile,
  selectedFilters,
  submitFilterSelections,
  updateSelectedFilters,
}, { router }) => {
  const { location } = router;
  const { query } = location;
  const [selectionMade, setSelectionMade] = useState(false);

  const selectFilter = (value) => {
    const updatedSelectedFilters = selectedFilters;
    const prevSelection = selectedFilters[filter];
    if (!prevSelection || !prevSelection.length) updatedSelectedFilters[filter] = [value.id];
    else {
      updatedSelectedFilters[filter] = Array.isArray(prevSelection) ?
        [...prevSelection, value.id] : [prevSelection, value.id];
    }
    updateSelectedFilters(updatedSelectedFilters);
  };

  const deselectFilter = (value) => {
    const updatedSelectedFilters = selectedFilters;
    const previousSelection = selectedFilters[filter];
    updatedSelectedFilters[filter] = Array.isArray(previousSelection) ?
      previousSelection.filter(prevSelection => prevSelection !== value.id)
      : [];
    updateSelectedFilters(updatedSelectedFilters);
  };

  const handleCheckbox = (option) => {
    if (!selectionMade) setSelectionMade(true);
    const currentSelection = selectedFilters[filter];
    if (currentSelection && currentSelection.includes(option.id)) {
      deselectFilter(option);
    } else selectFilter(option);
  };

  const isSelected = (option) => {
    if (!query) return false;
    const result = isOptionSelected(query[filter], option.id);

    return result;
  };

  const distinctOptions = parseDistinctOptions(options);
  const initialFilters = location.query ? location.query : {};
  const thisFilterSelections = initialFilters[filter];
  const determineNumOfSelections = () => {
    if (!thisFilterSelections) return null;
    return typeof thisFilterSelections === 'string' ? 1 : thisFilterSelections.length;
  };
  const numOfSelections = determineNumOfSelections();

  const isOpen = openFilter === filter;

  return (
    <div
      className="item-filter"
    >
      <FocusTrap
        focusTrapOptions={{
          clickOutsideDeactivates: true,
          onDeactivate: () => manageFilterDisplay('none'),
          returnFocusOnDeactivate: false,
        }}
        active={isOpen}
      >
        <Button
          className={`item-filter-button ${
            isOpen ? ' open' : ''}`}
          buttonType="outline"
          onClick={() => manageFilterDisplay(filter)}
          type="button"
        >
          {filter}{numOfSelections ? ` (${numOfSelections})` : null} <Icon name={isOpen ? 'minus' : 'plus'} />
        </Button>
        {isOpen ? (
          <div
            className="item-filter-content"
          >
            <fieldset>
              {distinctOptions.map((option, i) => (
                <Checkbox
                  labelOptions={{
                    id: option.id,
                    labelContent: option.label,
                  }}
                  onChange={() => handleCheckbox(option)}
                  key={option.id || i}
                  isSelected={isSelected(option)}
                />
              ))}
            </fieldset>
            {
              !mobile ?
              (
                <div className="item-filter-buttons">
                  <Button
                    buttonType="link"
                    onClick={() => manageFilterDisplay('none')}
                  >Clear
                  </Button>
                  <Button
                    onClick={() => submitFilterSelections(selectedFilters)}
                    disabled={!selectionMade}
                  >Apply
                  </Button>
                </div>
              ) : null
            }
          </div>
        ) : null}
      </FocusTrap>
    </div>
  );
};

ItemFilter.propTypes = {
  filter: PropTypes.string,
  options: PropTypes.array,
  openFilter: PropTypes.string,
  manageFilterDisplay: PropTypes.func,
  mobile: PropTypes.bool,
  selectedFilters: PropTypes.object,
  submitFilterSelections: PropTypes.func,
  updateSelectedFilters: PropTypes.func,
};

ItemFilter.contextTypes = {
  router: PropTypes.object,
};

export default ItemFilter;
