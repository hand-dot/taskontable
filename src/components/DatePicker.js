import React from 'react';
import TextField from 'material-ui/TextField';

const marginBottom30 = {
  marginBottom: 30,
};

function DatePickers() {
  return (
    <form noValidate style={marginBottom30}>
      <TextField
        id="date"
        label="基準"
        type="date"
        defaultValue="2017-05-24"
        InputLabelProps={{
          shrink: true,
        }}
      />
    </form>
  );
}

export default DatePickers;
