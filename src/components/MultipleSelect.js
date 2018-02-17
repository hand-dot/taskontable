import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Input, { InputLabel } from 'material-ui/Input';
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
  const { label, value, options, onChange, disabled, classes, theme } = props;
  return (
    <div className={classes.container}>
      <FormControl>
        <InputLabel style={{ fontSize: 12 }} htmlFor={label}>{label}</InputLabel>
        <Select
          disabled={disabled}
          disableUnderline={disabled}
          style={{ fontSize: 12 }}
          multiple
          value={value}
          onChange={onChange}
          input={<Input id={label} />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
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
                fontWeight:
                  options.indexOf(option) === -1
                    ? theme.typography.fontWeightRegular
                    : theme.typography.fontWeightMedium,
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
  label: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MultipleSelect);
