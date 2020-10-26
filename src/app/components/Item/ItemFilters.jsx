import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@nypl/design-system-react-components';
import ItemFilter from './ItemFilter';
import ItemFiltersMobile from './ItemFiltersMobile';
import { trackDiscovery } from '../../utils/utils';
import { itemFilters } from '../../data/constants';

import { MediaContext } from '../Application/Application';


const ItemFilters = ({ items, hasFilterApplied, numOfFilteredItems }, { router }) => {
  if (!items || !items.length) return null;
  const [openFilter, changeOpenFilter] = useState('none');
  const { location, createHref } = router;
  const initialFilters = location.query ? location.query : {};
  const [selectedFilters, updateSelectedFilters] = useState(initialFilters);

  const manageFilterDisplay = (filterType) => {
    if (filterType === openFilter) {
      trackDiscovery('Search Filters', `Close Filter - ${filterType}`);
      changeOpenFilter('none');
    } else {
      if (filterType === 'none') trackDiscovery('Search Filters', `Close Filter - ${openFilter}`);
      else {
        trackDiscovery('Search Filters', `Open Filter - ${openFilter}`);
      }
      changeOpenFilter(filterType);
    }
  };

  const options = {};
  const mapFilterIdsToLabel = {};
  itemFilters.forEach((filter) => {
    const optionsObjEntry = options[filter.type];
    const filterOptions = optionsObjEntry || filter.options(items);
    if (!optionsObjEntry) options[filter.type] = filterOptions;
    filterOptions.forEach((option) => {
      mapFilterIdsToLabel[option.id] = option.label;
    });
  });

  // join filter selections and add single quotes
  const parsedFilterSelections = () => {
    let filterSelections = itemFilters.map(
      (filter) => {
        const selection = location.query[filter.type];
        if (Array.isArray(selection)) return selection.map(id => mapFilterIdsToLabel[id]);
        return mapFilterIdsToLabel[selection];
      }).filter(selections => selections);
    if (filterSelections.flat) filterSelections = filterSelections.flat();
    const joinedText = filterSelections.join("', '");
    return `'${joinedText}'`;
  };

  const resetFilters = () => {
    const href = router.createHref({
      pathname: router.location.pathname,
      hash: '#item-filters',
    });
    router.push(href);
  };

  const submitFilterSelections = (filters) => {
    const href = createHref({
      ...location,
      ...{
        query: filters,
        hash: '#item-filters',
        search: '',
      },
    });
    trackDiscovery('Search Filters', `Apply Filter - ${JSON.stringify(filters)}`);
    router.push(href);
  };

  const itemFilterComponentProps = {
    openFilter,
    selectedFilters,
    manageFilterDisplay,
    updateSelectedFilters,
    submitFilterSelections,
  };

  return (
    <Fragment>
      <MediaContext.Consumer>
        {
          media =>
          (
            <Fragment>
              {
              ['mobile', 'tabletPortrait'].includes(media) ?
              (<ItemFiltersMobile
                options={options}
                {...itemFilterComponentProps}
              />) :
              (
                <div id="item-filters" className="item-table-filters">
                  {
                    itemFilters.map(filter => (
                      <ItemFilter
                        filter={filter.type}
                        key={filter.type}
                        options={options[filter.type]}
                        {...itemFilterComponentProps}
                      />
                    ))
                  }
                </div>
              )
            }
            </Fragment>
          )
        }
      </MediaContext.Consumer>
      <div className="item-filter-info">
        <h3>{numOfFilteredItems} Result{numOfFilteredItems > 1 ? 's' : null} Found</h3>
        {hasFilterApplied ? <span>Filtered by {parsedFilterSelections()}</span> : null}
        {
          hasFilterApplied ? (
            <Button
              buttonType="link"
              onClick={() => resetFilters()}
            >Clear all filters
            </Button>
          ) : null
        }
      </div>
    </Fragment>
  );
};

ItemFilters.propTypes = {
  items: PropTypes.array,
  hasFilterApplied: PropTypes.bool,
  numOfFilteredItems: PropTypes.number,
};

ItemFilters.contextTypes = {
  router: PropTypes.object,
};

export default ItemFilters;
