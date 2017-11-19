import React from "react";
import { withStyles } from "material-ui/styles";
import TextField from "material-ui/TextField";

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  }
});

function DatePickers(props) {
  return (
    <form noValidate>
      <TextField
        id="date"
        label="基準"
        type="date"
        defaultValue="2017-05-24"
        InputLabelProps={{
          shrink: true
        }}
      />
    </form>
  );
}

export default withStyles(styles)(DatePickers);
