import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles } from '@material-ui/core/styles';
import ThumbUp from '@material-ui/icons/ThumbUp';
import Error from '@material-ui/icons/Error';
import CheckCircle from '@material-ui/icons/CheckCircle';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import Save from '@material-ui/icons/Save';
import DatePicker from './DatePicker';
import TaskProcessing from './TaskProcessing';
import constants from '../constants';
import util from '../util';
import tasksUtil from '../tasksUtil';

const styles = theme => ({
  progress: {
    height: theme.spacing.unit,
  },
  blue: {
    background: constants.brandColor.base.BLUE,
  },
  lightBlue: {
    background: constants.brandColor.light.BLUE,
  },
  tableCtlButton: {
    fontSize: 11,
    minWidth: 25,
  },
});

class TableCtl extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  /**
   * 日付の変更を変更し、propsのchangeDateに新しい日付の文字列を返します。
   * @param  {Object} e イベント
   */
  changeDate(e) {
    const nav = e.currentTarget.getAttribute('data-date-nav');
    let newDate;
    if (nav) {
      newDate = moment(this.props.date).add(nav === 'next' ? 1 : -1, 'day').format(constants.DATEFMT);
    } else if (moment(e.target.value).isValid()) {
      e.persist();
      newDate = e.target.value;
    } else {
      newDate = constants.INITIALDATE;
    }
    this.props.changeDate(newDate);
  }

  render() {
    const {
      userId, tableTasks, date, savedAt, saveable, saveWorkSheet, classes, theme,
    } = this.props;
    const progressPer = (tasksUtil.getDoneTasks(tableTasks).length) * (100 / tableTasks.length);
    return (
      <div>
        <LinearProgress classes={{ root: classes.progress, barColorPrimary: classes.blue, colorPrimary: classes.lightBlue }} variant="determinate" value={progressPer} />
        <Grid style={{ padding: `${theme.spacing.unit}px 0` }} container alignItems="center" justify="center" spacing={0}>
          <Hidden xsDown>
            <Grid item xs={3}>
              <TaskProcessing tableTasks={tableTasks.filter(task => task.assign === '' || task.assign === userId)} date={date} />
            </Grid>
          </Hidden>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            <DatePicker value={date} changeDate={this.changeDate.bind(this)} label="" />
          </Grid>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            {(() => {
              if (tableTasks.length === 0) {
                return (
                  <Typography style={{ marginTop: 10 }} variant="caption">タスクがありません</Typography>
                );
              } else if (tableTasks.length === tasksUtil.getDoneTasks(tableTasks).length) {
                return (
                  <Typography style={{ animation: 'good 1s linear 0s 1', marginTop: 10, color: constants.brandColor.base.BLUE }} variant="caption">
                    <ThumbUp style={{ fontSize: 16 }} />
                  Complete!
                  </Typography>
                );
              }
              return (
                <Typography style={{ marginTop: 10 }} variant="caption">
                  <Error style={{ fontSize: 16 }} />
                  {tasksUtil.getOpenTasks(tableTasks).length}Open
                  <span>&nbsp;</span>
                  <CheckCircle style={{ fontSize: 16 }} />
                  {tasksUtil.getDoneTasks(tableTasks).length}Close
                </Typography>
              );
            })()}
          </Grid>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            <Tooltip title={moment(date, constants.DATEFMT).add(-1, 'day').format(constants.DATEFMT)} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="prev" ><NavigateBefore style={{ fontSize: 16 }} /></Button>
              </div>
            </Tooltip>
            {!util.isMobile() && (
            <Tooltip title={`最終保存時刻 : ${savedAt}`} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.tableCtlButton} disabled={!saveable} variant="raised" onClick={saveWorkSheet} color="default"><Save style={{ fontSize: 16 }} /></Button>
              </div>
            </Tooltip>
            )}
            <Tooltip title={moment(date, constants.DATEFMT).add(1, 'day').format(constants.DATEFMT)} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="next" ><NavigateNext style={{ fontSize: 16 }} /></Button>
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
    );
  }
}

TableCtl.propTypes = {
  userId: PropTypes.string.isRequired,
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  date: PropTypes.string.isRequired,
  savedAt: PropTypes.string.isRequired,
  saveable: PropTypes.bool.isRequired,
  changeDate: PropTypes.func.isRequired,
  saveWorkSheet: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TableCtl);

