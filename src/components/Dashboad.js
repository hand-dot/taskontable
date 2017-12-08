import cloneDeep from 'lodash.clonedeep';
import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import Typography from 'material-ui/Typography';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';

import { withStyles } from 'material-ui/styles';

import TodaySummary from './TodaySummary';
import DatePicker from './DatePicker';
import Clock from './Clock';
import CategoryList from './CategoryList';

import { hotConf } from '../confings/hot';


const styles = {
  root: {
    padding: '0 0 20px',
  },
};

function updateHotCategory(source) {
  const $hotConf = cloneDeep(hotConf);
  $hotConf.columns[$hotConf.columns.findIndex(col => col.data === 'category')].source = source;
  if (window.hot) {
    setTimeout(() => {
      window.hot.updateSettings({ columns: $hotConf.columns });
    }, 0);
  }
}

const totalMinute = (datas, prop) => datas.map(data => (typeof data[prop] === 'number' ? data[prop] : 0)).reduce((p, c) => p + c, 0);

class Dashboad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allTasks: [],
      estimateTasks: { minute: 0, taskNum: 0 },
      doneTasks: { minute: 0, taskNum: 0 },
      actuallyTasks: { minute: 0, taskNum: 0 },
      remainingTasks: { minute: 0, taskNum: 0 },
      currentTime: { hour: 0, minute: 0, second: 0 },
      endTime: { hour: 0, minute: 0, second: 0 },
      categories: [],
      categoryInput: '',
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
    this.initCategories();
  }

  componentWillReceiveProps(nextProps) {
    const remainingData = nextProps.allTasks.filter(data => !data.done);
    const remainingMinute = totalMinute(remainingData, 'estimate');
    const doneData = nextProps.allTasks.filter(data => data.done);
    const currentMoment = moment();
    const endMoment = moment().add(remainingMinute, 'minutes');
    this.setState({
      allTasks: nextProps.allTasks,
      estimateTasks: { minute: totalMinute(nextProps.allTasks, 'estimate'), taskNum: nextProps.allTasks.length },
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

  initCategories() {
    const labels = ['生活', '業務', '雑務', '休憩'];
    const timestamp = Date.now();
    const initCategories = labels.map((label, index) => ({ id: timestamp + index, text: label }));
    this.setState(() => ({
      categories: initCategories,
      categoryInput: '',
    }));
    updateHotCategory(initCategories.map(cat => cat.text));
  }

  addCategory(e) {
    e.preventDefault();
    if (!this.state.categoryInput.length) {
      return;
    }
    const newItem = {
      text: this.state.categoryInput,
      id: Date.now(),
    };
    this.setState(prevState => ({
      categories: prevState.categories.concat(newItem),
      categoryInput: '',
    }));
    updateHotCategory(this.state.categories.concat(newItem).map(cat => cat.text));
  }

  removeCategory(index) {
    const categories = cloneDeep(this.state.categories);
    categories.splice(index, 1);
    this.setState(() => ({
      categories,
    }));
    updateHotCategory(categories.map(cat => cat.text));
  }

  changeCategoryInput(e) {
    this.setState({ categoryInput: e.target.value });
  }

  render() {
    const { classes, date, changeDate } = this.props;
    return (
      <Grid item xs={12} className={classes.root}>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>ダッシュボード</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid item xs={4}>
              <Typography gutterBottom type="title">
                 本日のサマリ
              </Typography>
              <DatePicker value={date} changeDate={changeDate} />
              <TodaySummary
                data={{
                  estimateTasks: this.state.estimateTasks,
                  doneTasks: this.state.doneTasks,
                  actuallyTasks: this.state.actuallyTasks,
                  remainingTasks: this.state.remainingTasks,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography gutterBottom type="title">
                 時刻
              </Typography>
              <Grid container spacing={5}>
                <Grid item xs={6}>
                  <Clock title={'現在時刻'} caption="" time={this.state.currentTime} />
                </Grid>
                <Grid item xs={6}>
                  <Clock title={'終了時刻*'} caption="*残タスクの合計時間" time={this.state.endTime} updateFlg />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <Typography title="*追加・削除したカテゴリはタスク一覧カテゴリ列の選択肢に反映されます。" gutterBottom type="title">
        カテゴリ*
              </Typography>
              <CategoryList categories={this.state.categories} removeCategory={this.removeCategory.bind(this)} />
              <form onSubmit={this.addCategory.bind(this)}>
                <Input
                  fullWidth
                  placeholder="カテゴリを追加"
                  onChange={this.changeCategoryInput.bind(this)}
                  value={this.state.categoryInput}
                />
              </form>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Grid>
    );
  }
}

Dashboad.propTypes = {
  date: PropTypes.string.isRequired,
  changeDate: PropTypes.func.isRequired,
  allTasks: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboad);
