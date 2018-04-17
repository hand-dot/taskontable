import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Input from 'material-ui/Input';
import { MenuItem } from 'material-ui/Menu';
import { FormControl } from 'material-ui/Form';
import Select from 'material-ui/Select';

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

// FIXME keyとvalueで値をやりとりしたい
function MultipleSelect(props) {
  const { value, options, onChange, disabled, classes } = props;
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
              key={option}
              value={option}
              style={{
                fontSize: 12,
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}


MultipleSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.any).isRequired,
  options: PropTypes.arrayOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired,  // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(MultipleSelect);
