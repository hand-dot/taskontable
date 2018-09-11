import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TodaySummary from './TodaySummary';
import Clock from './Clock';
import TimelineChart from './TimelineChart';
import util from '../utils/util';
import i18n from '../i18n';
import tasksUtil from '../utils/tasksUtil';

const {
  getTotalEstimateMinute,
  getTotalActuallyMinute,
} = tasksUtil;

const styles = {};
class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      estimateTasks: { minute: 0, taskNum: 0 },
      doneTasks: { minute: 0, taskNum: 0 },
      actuallyTasks: { minute: 0, taskNum: 0 },
      remainingTasks: { minute: 0, taskNum: 0 },
      currentTime: { hour: 0, minute: 0, second: 0 },
      endTime: { hour: 0, minute: 0, second: 0 },
    };
  }

  componentWillMount() {
    // 初期値の現在時刻と終了時刻
    const currentMoment = moment();
    const timeObj = {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
    this.setState({
      currentTime: timeObj,
      endTime: timeObj,
    });
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByTableTasks(nextProps.tableTasks);
  }

  updateStateByTableTasks(task) {
    const remainingData = task.filter(data => !data.startTime || !data.endTime);
    const remainingMinute = getTotalEstimateMinute(remainingData);
    const doneData = task.filter(data => data.startTime && data.endTime);

    const estimateTasks = { minute: getTotalEstimateMinute(task), taskNum: task.length };
    const remainingTasks = { minute: remainingMinute, taskNum: remainingData.length };
    const doneTasks = { minute: getTotalEstimateMinute(doneData), taskNum: doneData.length };
    const actuallyTasks = { minute: getTotalActuallyMinute(doneData), taskNum: doneData.length };

    const currentMoment = moment();
    const endMoment = moment().add(remainingMinute, 'minutes');
    this.setState({
      estimateTasks,
      remainingTasks,
      doneTasks,
      actuallyTasks,
      currentTime: {
        hour: currentMoment.hour(),
        minute: currentMoment.minute(),
        second: currentMoment.second(),
      },
      endTime: {
        hour: endMoment.hour(),
        minute: endMoment.minute(),
        second: endMoment.second(),
      },
    });
  }

  render() {
    const {
      estimateTasks,
      doneTasks,
      actuallyTasks,
      remainingTasks,
      currentTime,
      endTime,
    } = this.state;
    const { tableTasks, isToday, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} style={{ padding: theme.spacing.unit }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subheading">
            {i18n.t('dashBoad.summary')}
          </Typography>
          <TodaySummary
            data={{
              estimateTasks,
              doneTasks,
              actuallyTasks,
              remainingTasks,
            }}
          />
        </Grid>
        {!util.isMobile() && (
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom variant="subheading">
              {i18n.t('dashBoad.clock')}
            </Typography>
            <Grid container>
              <Grid item xs={6}>
                <Clock title={i18n.t('dashBoad.currentTime')} time={currentTime} />
              </Grid>
              <Grid item xs={6}>
                <Clock title={i18n.t('dashBoad.endTime')} time={endTime} />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item xs={12}>
          <Typography gutterBottom variant="subheading">
            {i18n.t('dashBoad.timeline')}
          </Typography>
          <Grid container>
            <Grid item xs={12}>
              <TimelineChart
                tableTasks={tasksUtil.getEstimateTimelineChartTasks(tableTasks)}
                pointer={isToday}
              />
              <TimelineChart
                tableTasks={tasksUtil.getActuallyTimelineChartTasks(tableTasks)}
                pointer={isToday}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Dashboard.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  isToday: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Dashboard);
