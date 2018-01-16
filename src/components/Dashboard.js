import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Hidden from 'material-ui/Hidden';

import TodaySummary from './TodaySummary';
import Clock from './Clock';

import util from '../util';

const totalMinute = (datas, prop) => datas.map(data => (typeof data[prop] === 'number' ? data[prop] : 0)).reduce((p, c) => p + c, 0);

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableTasks: [],
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
    const timeObj = util.getCrrentTimeObj();
    this.setState({
      currentTime: timeObj,
      endTime: timeObj,
    });
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const remainingData = nextProps.tableTasks.filter(data => !data.done);
    const remainingMinute = totalMinute(remainingData, 'estimate');
    const doneData = nextProps.tableTasks.filter(data => data.done);
    const currentMoment = moment();
    const endMoment = moment().add(remainingMinute, 'minutes');
    this.setState({
      tableTasks: nextProps.tableTasks,
      estimateTasks: { minute: totalMinute(nextProps.tableTasks, 'estimate'), taskNum: nextProps.tableTasks.length },
      remainingTasks: { minute: remainingMinute, taskNum: remainingData.length },
      doneTasks: { minute: totalMinute(doneData, 'estimate'), taskNum: doneData.length },
      actuallyTasks: { minute: totalMinute(doneData, 'actually'), taskNum: doneData.length },
      currentTime: {
        hour: currentMoment.hour(),
        minute: currentMoment.minute(),
        second: currentMoment.second(),
      },
      endTime: { hour: endMoment.hour(),
        minute: endMoment.minute(),
        second: endMoment.second(),
      },
    });
  }

  render() {
    const { isOpenDashboard, toggleDashboard } = this.props;
    return (
      <ExpansionPanel expanded={isOpenDashboard}>
        <ExpansionPanelSummary onClick={toggleDashboard} expandIcon={<i className="fa fa-angle-down fa-lg" />}>
          <i className="fa fa-tachometer fa-lg" />
          <Typography>　ダッシュボード</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid item xs={12} sm={6}>
            <Typography gutterBottom type="subheading">
                 サマリ
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
          <Hidden xsDown>
            <Grid item sm={6}>
              <Typography gutterBottom type="subheading">
                 時刻
              </Typography>
              <Grid container spacing={8}>
                <Grid item xs={6}>
                  <Clock title={'現在時刻'} caption="" time={this.state.currentTime} />
                </Grid>
                <Grid item xs={6}>
                  <Clock title={'終了時刻*'} caption="*現在時刻と残タスクの合計時間" time={this.state.endTime} />
                </Grid>
              </Grid>
            </Grid>
          </Hidden>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

Dashboard.propTypes = {
  isOpenDashboard: PropTypes.bool.isRequired,
  toggleDashboard: PropTypes.func.isRequired,
  tableTasks: PropTypes.array.isRequired,
};

export default Dashboard;
