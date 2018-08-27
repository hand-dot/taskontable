import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TodaySummary from './TodaySummary';
import Clock from './Clock';
import TimelineChart from './TimelineChart';
import util from '../util';
import i18n from '../i18n';
import tasksUtil from '../tasksUtil';

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

  updateStateByTableTasks(tableTasks) {
    const remainingData = tableTasks.filter(data => !data.startTime || !data.endTime);
    const remainingMinute = tasksUtil.getTotalEstimateMinute(remainingData);
    const doneData = tableTasks.filter(data => data.startTime && data.endTime);
    this.setState({
      estimateTasks: { minute: tasksUtil.getTotalEstimateMinute(tableTasks), taskNum: tableTasks.length },
      remainingTasks: { minute: remainingMinute, taskNum: remainingData.length },
      doneTasks: { minute: tasksUtil.getTotalEstimateMinute(doneData), taskNum: doneData.length },
      actuallyTasks: { minute: tasksUtil.getTotalActuallyMinute(doneData), taskNum: doneData.length },
    });
    const currentMoment = moment();
    const endMoment = moment().add(remainingMinute, 'minutes');
    this.setState({
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
    const { tableTasks, isToday, theme } = this.props;
    return (
      <Grid container spacing={theme.spacing.unit} style={{ padding: theme.spacing.unit }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subheading">
            {i18n.t('dashBoad.summary')}
          </Typography>
          <TodaySummary
            data={{
              estimateTasks: this.state.estimateTasks,
              doneTasks: this.state.doneTasks,
              actuallyTasks: this.state.actuallyTasks,
              remainingTasks: this.state.remainingTasks,
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
                <Clock title={i18n.t('dashBoad.currentTime')} time={this.state.currentTime} />
              </Grid>
              <Grid item xs={6}>
                <Clock title={i18n.t('dashBoad.endTime')} time={this.state.endTime} />
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
              <TimelineChart tableTasks={tasksUtil.getEstimateTimelineChartTasks(tableTasks)} pointer={isToday} />
              <TimelineChart tableTasks={tasksUtil.getActuallyTimelineChartTasks(tableTasks)} pointer={isToday} />
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
