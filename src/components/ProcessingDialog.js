import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { CircularProgress } from 'material-ui/Progress';
import Dialog from 'material-ui/Dialog';

import constants from '../constants';

const styles = {
  content: {
    overflow: 'hidden',
    padding: 0,
  },
};

class ProcessingDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      thresholdCount: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      this.setState({ thresholdCount: this.state.thresholdCount + 1 });
    } else {
      this.setState({ thresholdCount: 0 });
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.state.open !== nextProps.open;
  }

  render() {
    const { classes } = this.props;
    return (
      <Dialog
        open={constants.PROCESSING_DIALOG_THRESHOLD < this.state.thresholdCount}
      >
        <CircularProgress className={classes.content} size={60} />
      </Dialog>
    );
  }
}

ProcessingDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProcessingDialog);
