import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

function DatePickers(props) {
  const { value, changeDate } = props;
  return (
    <form
      noValidate
      style={{ marginBottom: 30, marginTop: 15,
      }}
    >
      <TextField
        id="date"
        label="基準"
        type="date"
        value={value}
        onChange={changeDate}
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}

DatePickers.propTypes = {
  value: PropTypes.string.isRequired,
  changeDate: PropTypes.func.isRequired,
};

export default DatePickers;
