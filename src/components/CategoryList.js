import React from 'react';
import PropTypes from 'prop-types';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import { withStyles } from 'material-ui/styles';
import DeleteIcon from 'material-ui-icons/Delete';

const styles = theme => ({
  root: {
    width: '100%',
    background: theme.palette.background.paper,
    position: 'relative',
    overflow: 'auto',
    maxHeight: 170,
  },
  listSection: {
    background: 'inherit',
  },
});

function CategoryList(props) {
  const { categories, removeCategory, classes } = props;
  return (
    <div>
      <List className={classes.root} subheader>
        {categories.map((category, index) => (
          <ListItem key={category.id} button>
            <ListItemText primary={category.text} />
            <ListItemIcon onClick={() => removeCategory(index)} aria-label="Delete">
              <DeleteIcon />
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
