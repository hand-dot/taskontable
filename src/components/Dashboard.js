import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import TodaySummary from './TodaySummary';
import Clock from './Clock';
import DiffChart from './DiffChart';

import util from '../util';

const totalEstimateMinute = datas => datas.map(data => (typeof data.estimate === 'number' ? data.estimate : 0)).reduce((p, c) => p + c, 0);

const totalActuallyMinute = datas => datas.map(data => util.getTimeDiffMinute(data.startTime, data.endTime)).reduce((p, c) => p + c, 0);

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
    this.setState({
      currentTime: util.getCrrentTimeObj(),
      endTime: util.getCrrentTimeObj(),
    });
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const remainingData = nextProps.tableTasks.filter(data => !data.startTime || !data.endTime);
    const remainingMinute = totalEstimateMinute(remainingData);
    const doneData = nextProps.tableTasks.filter(data => data.startTime && data.endTime);
    const currentMoment = moment();
    const endMoment = moment().add(remainingMinute, 'minutes');
    this.setState({
      tableTasks: nextProps.tableTasks,
      estimateTasks: { minute: totalEstimateMinute(nextProps.tableTasks), taskNum: nextProps.tableTasks.length },
      remainingTasks: { minute: remainingMinute, taskNum: remainingData.length },
      doneTasks: { minute: totalEstimateMinute(doneData), taskNum: doneData.length },
      actuallyTasks: { minute: totalActuallyMinute(doneData), taskNum: doneData.length },
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

  getDiffChartData() {
    return this.filterForDiffChart().map(tableTask => ({ estimate: tableTask.estimate || 0, actually: util.getTimeDiffMinute(tableTask.startTime, tableTask.endTime) || 0 }));
  }

  getDiffChartLabel() {
    return this.filterForDiffChart().map(tableTask => tableTask.title || '');
  }

  filterForDiffChart() {
    return this.props.tableTasks.filter(tableTask => tableTask.estimate !== 0 || util.getTimeDiffMinute(tableTask.startTime, tableTask.endTime) !== 0);
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
          <Grid container>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom variant="subheading">
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
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom variant="subheading">
                 時刻
              </Typography>
              <Grid container>
                <Grid item xs={6}>
                  <Clock title={'現在時刻'} caption="" time={this.state.currentTime} />
                </Grid>
                <Grid item xs={6}>
                  <Clock title={'終了時刻*'} caption="*現在時刻と残タスクの合計時間" time={this.state.endTime} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom variant="subheading">
                 見積と実績の乖離
              </Typography>
              <Typography gutterBottom variant="caption">
                *見積に対して実績が　{(() => {
                  const diff = ((this.state.estimateTasks.minute / 60) - (this.state.actuallyTasks.minute / 60)).toFixed(1);
                  return diff > 0 ? `${diff}h　マイナスです` : `${diff * -1}h　オーバーしています`;
                })()}
              </Typography>
              <Grid container>
                <Grid item xs={12}>
                  <DiffChart title={''} chartLabels={['見積', '実績']} data={this.getDiffChartData()} dataLabels={this.getDiffChartLabel()} unit={'h'} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
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
