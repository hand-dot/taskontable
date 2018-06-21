import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

function MultipleSelect(props) {
  const {
    value, options, onChange, disabled, classes,
  } = props;
  return (
    <div className={classes.container}>
      <FormControl>
        <Select
          disabled={disabled}
          disableUnderline={disabled}
          style={{ fontSize: 12 }}
          multiple
          value={value}
          onChange={onChange}
          input={<Input />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: (ITEM_HEIGHT * 4.5) + ITEM_PADDING_TOP,
                width: 200,
              },
            },
          }}
        >
          {options.map(option => (
            <MenuItem
              key={option.key}
              value={option.value}
              style={{ fontSize: 12 }}
            >
              {option.key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}


MultipleSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired,  // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(MultipleSelect);
