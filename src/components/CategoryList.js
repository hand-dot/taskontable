import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';

const styles = {
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    maxHeight: 170,
  },
};

function CategoryList(props) {
  const { categories, removeCategory, classes } = props;
  return (
    <div>
      <List className={classes.root} subheader>
        {categories.map((category, index) => (
          <ListItem key={category.id} button>
            <ListItemText primary={category.text} />
            <ListItemIcon onClick={() => removeCategory(index)}>
              <i className="fa fa-trash-o fa-lg" />
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

CategoryList.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
  removeCategory: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CategoryList);
