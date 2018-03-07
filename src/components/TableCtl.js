import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import DatePicker from '../components/DatePicker';
import constants from '../constants';

const styles = {
  tableCtlButton: {
    fontSize: 11,
    minWidth: 25,
  },
};

function TableCtl(props) {
  const { tableTasks, hasOpenTask, date, lastSaveTime, saveable, changeDate, saveTableTasks, classes, theme } = props;
  return (
    <Grid style={{ padding: `${theme.spacing.unit * 2}px 0` }} container spacing={0}>
      <Hidden xsDown>
        <Grid style={{ textAlign: 'center' }} item xs={3}>
          <Typography style={{ marginTop: 10, color: hasOpenTask ? constants.brandColor.base.RED : constants.brandColor.light.GREY, animation: hasOpenTask ? 'blink 1s infinite' : '' }} variant="caption">[●REC]</Typography>
        </Grid>
      </Hidden>
      <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
        <DatePicker value={date} changeDate={changeDate} label={''} />
      </Grid>
      <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
        {(() => {
          if (tableTasks.length === 0) {
            return (
              <Typography style={{ marginTop: 10 }} variant="caption"><i className="fa fa-asterisk" />タスクがありません</Typography>
            );
          } else if (tableTasks.length === tableTasks.filter(data => data.startTime && data.endTime).length) {
            return (
              <Typography style={{ marginTop: 10 }} variant="caption"><i className="fa fa-thumbs-up" />Complete!</Typography>
            );
          }
          return (
            <Typography style={{ marginTop: 10 }} variant="caption">
              <i className="fa fa-exclamation-circle" />
              {tableTasks.filter(data => !data.startTime || !data.endTime).length}Open
              <span>&nbsp;</span>
              <i className="fa fa-check" />
              {tableTasks.filter(data => data.startTime && data.endTime).length}Close
            </Typography>
          );
        })()}
      </Grid>
      <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
        <Tooltip title={moment(date, 'YYYY-MM-DD').add(-1, 'day').format('YYYY/MM/DD')} placement="top">
          <div style={{ display: 'inline-block' }}>
            <Button className={classes.tableCtlButton} variant="raised" onClick={changeDate} data-date-nav="prev" ><i className="fa fa-angle-left fa-lg" /></Button>
          </div>
        </Tooltip>
        {(() => {
          if (theme.breakpoints.values.sm < constants.APPWIDTH) {
            return (
              <Tooltip title={`最終保存時刻 : ${(`00${lastSaveTime.hour}`).slice(-2)}:${(`00${lastSaveTime.minute}`).slice(-2)}`} placement="top">
                <div style={{ display: 'inline-block' }}>
                  <Button className={classes.tableCtlButton} disabled={!saveable} variant="raised" onClick={saveTableTasks} color="default"><i className="fa fa-floppy-o fa-lg" /></Button>
                </div>
              </Tooltip>
            );
          }
          return null;
        })()}
        <Tooltip title={moment(date, 'YYYY-MM-DD').add(1, 'day').format('YYYY/MM/DD')} placement="top">
          <div style={{ display: 'inline-block' }}>
            <Button className={classes.tableCtlButton} variant="raised" onClick={changeDate} data-date-nav="next" ><i className="fa fa-angle-right fa-lg" /></Button>
          </div>
        </Tooltip>
      </Grid>
    </Grid>
  );
}

TableCtl.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  hasOpenTask: PropTypes.bool.isRequired,
  date: PropTypes.string.isRequired,
  lastSaveTime: PropTypes.shape({
    hour: PropTypes.number.isRequired,
    minute: PropTypes.number.isRequired,
    second: PropTypes.number.isRequired,
  }).isRequired,
  saveable: PropTypes.bool.isRequired,
  changeDate: PropTypes.func.isRequired,
  saveTableTasks: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TableCtl);

