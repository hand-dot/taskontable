import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import Dialog from 'material-ui/Dialog';

const styles = {
  content: {
    overflow: 'hidden',
    padding: 0,
  },
};

function ProcessingDialog(props) {
  const { open, classes } = props;
  return (
    <Dialog open={open}>
      <CircularProgress className={classes.content} size={60} />
    </Dialog>
  );
}

ProcessingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProcessingDialog);
