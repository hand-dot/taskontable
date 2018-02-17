import React from 'react';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
import constants from '../constants';

const styles = {
  primaryColor: {
    background: constants.brandColor.light.BLUE,
  },
  primaryColorBar: {
    background: constants.brandColor.base.BLUE,
  },
  informationText: {
    paddingLeft: 24,
  },
};

function TableStatus(props) {
  const { tableTasks, isLoading, classes } = props;
  return (
    <div>
      <div className={classes.informationText}>
        {(() => {
          const tableTasksLength = tableTasks.length;
          const dontTasksLength = tableTasks.filter(data => data.startTime && data.endTime).length;
          if (tableTasksLength === 0) {
            return (
              <Typography gutterBottom variant="caption"><i className="fa fa-asterisk" />タスクがありません</Typography>
            );
          } else if (tableTasksLength === dontTasksLength) {
            return (
              <Typography gutterBottom variant="caption"><i className="fa fa-thumbs-up" />タスクをすべて完了しました!</Typography>
            );
          }
          return (
            <Typography gutterBottom variant="caption">
              <i className="fa fa-exclamation-circle" />
              {tableTasks.length}Open
              <span>&nbsp;</span>
              <i className="fa fa-check" />
              {tableTasks.filter(data => data.startTime && data.endTime).length}Closed
            </Typography>
          );
        })()}
      </div>
      <LinearProgress classes={{ primaryColor: classes.primaryColor, primaryColorBar: classes.primaryColorBar }} variant={isLoading ? 'indeterminate' : 'determinate'} value={(tableTasks.filter(data => data.startTime && data.endTime).length) * (100 / tableTasks.length)} />
    </div>
  );
}

TableStatus.propTypes = {
  tableTasks: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TableStatus);
