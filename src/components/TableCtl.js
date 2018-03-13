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
import DatePicker from '../components/DatePicker';
import constants from '../constants';

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
  grey: {
    background: constants.brandColor.base.GREY,
  },
  yellow: {
    background: constants.brandColor.base.YELLOW,
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
    const { tableTasks, hasOpenTask, date, isLoading, lastSaveTime, saveable, saveTableTasks, classes, theme } = this.props;
    const progressPer = (tableTasks.filter(data => data.startTime && data.endTime).length) * (100 / tableTasks.length);
    const isComplete = progressPer >= 100;
    return (
      <div>
        <LinearProgress classes={{ root: classes.progress, barColorPrimary: isComplete ? classes.yellow : classes.blue, colorPrimary: isComplete ? classes.yellow : classes.lightBlue }} variant={isLoading ? 'indeterminate' : 'determinate'} value={progressPer} />
        <Grid style={{ padding: `${theme.spacing.unit}px 0` }} container spacing={0}>
          <Hidden xsDown>
            <Grid style={{ textAlign: 'center' }} item xs={3}>
              <Typography style={{ marginTop: 10, color: hasOpenTask ? constants.brandColor.base.RED : constants.brandColor.light.GREY, animation: hasOpenTask ? 'blink 1s infinite' : '' }} variant="caption">[●REC]</Typography>
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
                <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="prev" ><i className="fa fa-angle-left fa-lg" /></Button>
              </div>
            </Tooltip>
            {(() => {
              if (theme.breakpoints.values.sm < constants.APPWIDTH) {
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
            <Tooltip title={moment(date, 'YYYY-MM-DD').add(1, 'day').format('YYYY/MM/DD')} placement="top">
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
  hasOpenTask: PropTypes.bool.isRequired,
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

