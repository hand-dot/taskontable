import React from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import constants from '../constants';

const styles = {
  barColorPrimary: {
    background: constants.brandColor.light.BLUE,
  },
  barColorSecondary: {
    background: constants.brandColor.base.BLUE,
  },
};

function TableStatus(props) {
  const { tableTasks, isLoading, classes } = props;
  return (
    <LinearProgress classes={{ barColorPrimary: classes.barColorPrimary, barColorSecondary: classes.barColorSecondary }} variant={isLoading ? 'indeterminate' : 'determinate'} value={(tableTasks.filter(data => data.startTime && data.endTime).length) * (100 / tableTasks.length)} />
  );
}

TableStatus.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TableStatus);
