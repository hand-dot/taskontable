import React from 'react';
import PropTypes from 'prop-types';

function CategoryList(props) {
  const { categories } = props;
  return (
    <ul>
      {categories.map(item => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
};

export default CategoryList;

