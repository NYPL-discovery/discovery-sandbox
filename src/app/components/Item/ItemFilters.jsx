import React, { useState } from 'react';
import PropTypes from 'prop-types';

import ItemFilter from './ItemFilter';
import { trackDiscovery } from '../../utils/utils';

const ItemFilters = ({ items }) => {
  if (!items || !items.length) return null;
  const [openFilter, changeOpenFilter] = useState('none');

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

  const filters = [
    {
      type: 'location',
      options: items.map(item => ({
        label: item.location,
        id: item.holdingLocationCode.startsWith('loc:rc') ? 'offsite' : item.holdingLocationCode,
      })),
    },
    {
      type: 'format',
      options: items.map(item => ({
        label: item.format || '',
        id: item.materialType ? item.materialType['@id'] : '',
      })),
    },
    {
      type: 'status',
      options: items.map(item => ({
        label: item.requestable ? 'Requestable' : item.status.prefLabel,
        id: item.requestable ? 'requestable' : item.status['@id'],
      })),
    },
  ];

  return (
    <div id="item-filters" className="item-table-filters">
      {
        filters.map(filter => (
          <ItemFilter
            filter={filter.type}
            options={filter.options}
            open={openFilter === filter.type}
            manageFilterDisplay={manageFilterDisplay}
            key={filter.type}
          />
        ))
      }
    </div>
  );
};

ItemFilters.propTypes = {
  items: PropTypes.array,
};

export default ItemFilters;
