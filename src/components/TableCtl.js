import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import Typography from 'material-ui/Typography';
import { LinearProgress } from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';
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
    const { tableTasks, date, isLoading, lastSaveTime, saveable, saveTableTasks, classes, theme } = this.props;
    const progressPer = (tasksUtil.getDoneTasks(tableTasks).length) * (100 / tableTasks.length);
    return (
      <div>
        <LinearProgress classes={{ root: classes.progress, barColorPrimary: classes.blue, colorPrimary: classes.lightBlue }} variant={isLoading ? 'indeterminate' : 'determinate'} value={progressPer} />
        <Grid style={{ padding: `${theme.spacing.unit}px 0` }} container alignItems={'center'} justify={'center'} spacing={0}>
          <Hidden xsDown>
            <Grid item xs={3}>
              <TaskProcessing tableTasks={tableTasks} date={date} />
            </Grid>
          </Hidden>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            <DatePicker value={date} changeDate={this.changeDate.bind(this)} label={''} />
          </Grid>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            {(() => {
              if (tableTasks.length === 0) {
                return (
                  <Typography style={{ marginTop: 10 }} variant="caption"><i className="fa fa-asterisk" />タスクがありません</Typography>
                );
              } else if (tableTasks.length === tasksUtil.getDoneTasks(tableTasks).length) {
                return (
                  <Typography style={{ animation: 'good 1s linear 0s 1', marginTop: 10, color: constants.brandColor.base.BLUE }} variant="caption"><i className="fa fa-thumbs-up" />Complete!</Typography>
                );
              }
              return (
                <Typography style={{ marginTop: 10 }} variant="caption">
                  <i className="fa fa-exclamation-circle" />
                  {tasksUtil.getOpenTasks(tableTasks).length}Open
                  <span>&nbsp;</span>
                  <i className="fa fa-check" />
                  {tasksUtil.getDoneTasks(tableTasks).length}Close
                </Typography>
              );
            })()}
          </Grid>
          <Grid style={{ textAlign: 'center' }} item xs={4} sm={3}>
            <Tooltip title={moment(date, constants.DATEFMT).add(-1, 'day').format(constants.DATEFMT)} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="prev" ><i className="fa fa-angle-left fa-lg" /></Button>
              </div>
            </Tooltip>
            {(() => {
              if (!util.isMobile()) {
                return (
                  <Tooltip title={`最終保存時刻 : ${lastSaveTime}`} placement="top">
                    <div style={{ display: 'inline-block' }}>
                      <Button className={classes.tableCtlButton} disabled={!saveable} variant="raised" onClick={saveTableTasks} color="default"><i className="fa fa-floppy-o fa-lg" /></Button>
                    </div>
                  </Tooltip>
                );
              }
              return null;
            })()}
            <Tooltip title={moment(date, constants.DATEFMT).add(1, 'day').format(constants.DATEFMT)} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="next" ><i className="fa fa-angle-right fa-lg" /></Button>
              </div>
            </Tooltip>
          </Grid>
        </Grid>
      </div>
    );
  }
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
  date: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  lastSaveTime: PropTypes.string.isRequired,
  saveable: PropTypes.bool.isRequired,
  changeDate: PropTypes.func.isRequired,
  saveTableTasks: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TableCtl);

