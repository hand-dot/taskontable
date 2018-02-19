import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';

import Typography from 'material-ui/Typography';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';

import Dashboard from '../components/Dashboard';
import TableStatus from '../components/TableStatus';
import TaskPool from '../components/TaskPool';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';
import DatePicker from '../components/DatePicker';

import { getEmptyHotData } from '../hot';

import constants from '../constants';

import util from '../util';

const styles = {
  root: {
    paddingTop: '2em',
    margin: '0 auto',
    paddingBottom: 20,
    maxWidth: constants.APPWIDTH,
  },
  navButton: {
    color: '#fff',
    height: '100%',
    width: '100%',
  },
  helpButton: {
    fontSize: 15,
    width: 20,
    height: 20,
  },
  tableCtlButton: {
    fontSize: '9pt',
    minWidth: 40,
  },
};

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHotMode: this.props.theme.breakpoints.values.sm < constants.APPWIDTH,
      loading: true,
      saveable: false,
      isOpenDashboard: false,
      isOpenTaskPool: false,
      date: moment().format(constants.DATEFMT),
      lastSaveTime: { hour: 0, minute: 0, second: 0 },
      tableTasks: getEmptyHotData(),
      poolTasks: {
        highPriorityTasks: [],
        lowPriorityTasks: [],
        regularTasks: [],
      },
    };
  }

  componentWillMount() {
    // 初期値の最終保存時刻
    this.setState({
      lastSaveTime: util.getCrrentTimeObj(),
    });
    window.onkeydown = (e) => {
      this.fireShortcut(e);
    };
    window.onbeforeunload = (e) => {
      if (this.state.saveable) {
        const dialogText = '保存していない内容があります。';
        e.returnValue = dialogText;
        return dialogText;
      }
    };
  }

  componentDidMount() {
    if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission();
    // タスクプールをサーバーと同期開始
    this.attachPoolTasks();
    // テーブルをサーバーと同期開始
    this.attachTableTasks();
    // テーブルを初期化
    this.initTableTask();
  }

  componentWillUnmount() {
    window.onkeydown = '';
    window.onbeforeunload = '';
    firebase.database().ref(`/${this.props.user.uid}/poolTasks`).off();
    firebase.database().ref(`/${this.props.user.uid}/tableTasks`).off();
  }

  toggleDashboard() {
    this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
  }

  toggleTaskPool() {
    this.setState({ isOpenTaskPool: !this.state.isOpenTaskPool });
  }

  changeTableTasks(taskActionType, value) {
    const tableTasks = util.cloneDeep(this.state.tableTasks);
    if (taskActionType === constants.taskActionType.ADD) {
      tableTasks.push(value);
    } else if (taskActionType === constants.taskActionType.EDIT) {
      tableTasks[value.index] = value.task;
    } else if (taskActionType === constants.taskActionType.REMOVE) {
      tableTasks.splice(value, 1);
    } else if (taskActionType === constants.taskActionType.DOWN) {
      if (this.state.tableTasks.length === value + 1) return;
      const target = tableTasks;
      target.splice(value, 2, target[value + 1], target[value]);
    } else if (taskActionType === constants.taskActionType.UP) {
      if (value === 0) return;
      const target = tableTasks;
      target.splice(value - 1, 2, target[value], target[value - 1]);
    } else if (taskActionType === constants.taskActionType.BOTTOM) {
      if (this.state.tableTasks.length === value + 1) return;
      const target = tableTasks.splice(value, 1)[0];
      tableTasks.push(target);
    } else if (taskActionType === constants.taskActionType.TOP) {
      if (value === 0) return;
      const target = tableTasks.splice(value, 1)[0];
      tableTasks.unshift(target);
    } else if (taskActionType === constants.taskActionType.MOVE_POOL_HIGHPRIORITY || taskActionType === constants.taskActionType.MOVE_POOL_LOWPRIORITY) {
      const taskPoolType = taskActionType === constants.taskActionType.MOVE_POOL_HIGHPRIORITY ? constants.taskPoolType.HIGHPRIORITY : constants.taskPoolType.LOWPRIORITY;
      const poolTasks = this.state.poolTasks;
      poolTasks[taskPoolType].push(Object.assign({}, this.state.tableTasks[value]));
      this.setState({ poolTasks });
      tableTasks.splice(value, 1);
      // テーブルタスクからタスクプールに移動したら保存する
      setTimeout(() => {
        this.saveHot();
        this.savePoolTasks(poolTasks);
      });
    }
    const saveable = this.state.saveable ? true : !util.equal(tableTasks, this.state.tableTasks);
    this.setState({ tableTasks, saveable });
  }

  changePoolTasks(taskActionType, taskPoolType, value) {
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    if (taskActionType === constants.taskActionType.ADD) {
      poolTasks[taskPoolType].push(value);
    } else if (taskActionType === constants.taskActionType.EDIT) {
      poolTasks[taskPoolType][value.index] = value.task;
    } else if (taskActionType === constants.taskActionType.REMOVE) {
      poolTasks[taskPoolType].splice(value, 1);
    } else if (taskActionType === constants.taskActionType.DOWN) {
      if (this.state.poolTasks[taskPoolType].length === value + 1) return;
      const target = poolTasks[taskPoolType];
      target.splice(value, 2, target[value + 1], target[value]);
    } else if (taskActionType === constants.taskActionType.UP) {
      if (value === 0) return;
      const target = poolTasks[taskPoolType];
      target.splice(value - 1, 2, target[value], target[value - 1]);
    } else if (taskActionType === constants.taskActionType.BOTTOM) {
      if (this.state.poolTasks[taskPoolType].length === value + 1) return;
      const target = poolTasks[taskPoolType].splice(value, 1)[0];
      poolTasks[taskPoolType].push(target);
    } else if (taskActionType === constants.taskActionType.TOP) {
      if (value === 0) return;
      const target = poolTasks[taskPoolType].splice(value, 1)[0];
      poolTasks[taskPoolType].unshift(target);
    } else if (taskActionType === constants.taskActionType.MOVE_TABLE) {
      const tableTasks = this.state.tableTasks;
      tableTasks.push(Object.assign({}, this.state.poolTasks[taskPoolType][value]));
      this.setState({ tableTasks });
      if (this.state.isHotMode) this.taskTable.setData(tableTasks);
      if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
         taskPoolType === constants.taskPoolType.LOWPRIORITY) {
        poolTasks[taskPoolType].splice(value, 1);
      }
      // タスクプールからテーブルタスクに移動したら保存する
      setTimeout(() => { this.saveHot(); });
    }
    setTimeout(() => this.savePoolTasks(poolTasks));
  }

  moveTableTaskToPoolTask(taskPoolType, task) {
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].push(task);
    // テーブルタスクからタスクプールに移動したら保存する
    this.saveHot();
    this.savePoolTasks(poolTasks);
  }

  savePoolTasks(poolTasks) {
    this.setState({ poolTasks });
    const tasks = Object.assign({}, poolTasks);
    if (tasks.regularTasks) {
      // regularTasksで保存する値のdayOfWeekが['日','月'...]になっているので変換
      // https://github.com/hand-dot/taskontable/issues/118
      tasks.regularTasks = tasks.regularTasks.map((task) => {
        const copyTask = Object.assign({}, task);
        if (copyTask.dayOfWeek) {
          copyTask.dayOfWeek = copyTask.dayOfWeek.map(day => util.getDayOfWeek(day));
        }
        return copyTask;
      });
    }
    firebase.database().ref(`/${this.props.user.uid}/poolTasks`).set(tasks);
  }

  saveHot() {
    // 並び変えられたデータを取得するために処理が入っている。
    const tableTasks = this.state.isHotMode ? this.taskTable.getTasksIgnoreEmptyTaskAndProp() : this.state.tableTasks;
    this.setState({ tableTasks });
    this.saveTableTask(tableTasks);
  }

  saveTableTask(data) {
    this.setState({
      loading: true,
    });
    firebase.database().ref(`/${this.props.user.uid}/tableTasks/${this.state.date}`).set(data.length === 0 ? getEmptyHotData() : data).then(() => {
      this.setState({
        loading: false,
        lastSaveTime: util.getCrrentTimeObj(),
        saveable: false,
      });
    });
  }

  addTask() {
    if (this.state.isHotMode) this.taskTable.addTask();
  }

  handleSaveable(saveable) {
    this.setState({ saveable });
  }

  handleTableTasks(tableTasks) {
    this.setState({ tableTasks });
  }

  fireShortcut(e) {
    if (constants.shortcuts.NEXTDATE(e) || constants.shortcuts.PREVDATE(e)) {
      // 基準日を変更
      if (this.state.saveable && !window.confirm('保存していない内容があります。')) return false;
      this.setState({ date: moment(this.state.date).add(constants.shortcuts.NEXTDATE(e) ? 1 : -1, 'day').format(constants.DATEFMT) });
      setTimeout(() => { this.initTableTask(); });
    } else if (constants.shortcuts.SAVE(e)) {
      e.preventDefault();
      this.saveHot();
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      this.props.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.toggleDashboard();
    } else if (constants.shortcuts.TOGGLE_TASKPOOL(e)) {
      e.preventDefault();
      this.toggleTaskPool();
    }
    return false;
  }

  attachPoolTasks() {
    firebase.database().ref(`/${this.props.user.uid}/poolTasks`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const poolTasks = snapshot.val();
        const statePoolTasks = Object.assign({}, this.state.poolTasks);
        statePoolTasks.highPriorityTasks = poolTasks.highPriorityTasks ? poolTasks.highPriorityTasks : [];
        statePoolTasks.lowPriorityTasks = poolTasks.lowPriorityTasks ? poolTasks.lowPriorityTasks : [];
        if (poolTasks.regularTasks) {
          statePoolTasks.regularTasks = poolTasks.regularTasks;
          statePoolTasks.regularTasks = statePoolTasks.regularTasks.map((task, index) => {
            const copyTask = Object.assign({}, task);
            // regularTasksで保存する値のdayOfWeekが[0, 1...]になっているので、
            // MultipleSelectコンポーネントで扱えるように,['日','月'...]へ変換
            // https://github.com/hand-dot/taskontable/issues/118
            if (poolTasks.regularTasks[index].dayOfWeek) {
              copyTask.dayOfWeek = poolTasks.regularTasks[index].dayOfWeek.map(d => util.getDayOfWeekStr(d));
            } else {
              copyTask.dayOfWeek = [];
            }
            copyTask.week = poolTasks.regularTasks[index].week ? poolTasks.regularTasks[index].week : [];
            return copyTask;
          });
        } else {
          statePoolTasks.regularTasks = [];
        }
        this.setState({
          poolTasks: statePoolTasks,
        });
      }
    });
  }

  attachTableTasks() {
    firebase.database().ref(`/${this.props.user.uid}/tableTasks`).on('value', (snapshot) => {
      this.setState({
        loading: true,
      });
      if (snapshot.exists() && snapshot.val()[this.state.date] && !util.equal(this.state.tableTasks, snapshot.val()[this.state.date])) {
      // サーバーにタスクが存在した場合 かつ、サーバーから配信されたデータが自分のデータと違う場合、サーバーのデータでテーブルを初期化する
        if (this.state.isHotMode) {
          this.taskTable.clear();
          this.taskTable.setData(snapshot.val()[this.state.date]);
        }
        this.setState({
          tableTasks: snapshot.val()[this.state.date],
        });
      }
      this.setState({
        saveable: false,
        loading: false,
      });
    });
  }

  fetchTableTask() {
    this.setState({ loading: true });
    return firebase.database().ref(`/${this.props.user.uid}/tableTasks/${this.state.date}`).once('value').then((snapshot) => {
      this.setState({
        saveable: false,
        loading: false,
      });
      return snapshot;
    });
  }

  initTableTask() {
    if (this.state.isHotMode) this.taskTable.clear();
    this.fetchTableTask().then((snapshot) => {
      if (snapshot.exists() && !util.equal(snapshot.val(), getEmptyHotData())) {
        // サーバーに初期値以外のタスクが存在した場合サーバーのデータでテーブルを初期化する
        if (this.state.isHotMode) this.taskTable.setData(snapshot.val());
        this.setState({
          tableTasks: snapshot.val(),
        });
      } else if (this.state.poolTasks.regularTasks.length !== 0) {
        // 定期タスクをテーブルに設定する処理。
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.getDayOfWeekStr(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.getDayOfWeekStr(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        if (this.state.isHotMode) this.taskTable.setData(regularTasks);
        this.setState({
          tableTasks: regularTasks,
        });
      }
    });
  }

  changeDate(event) {
    const nav = event.currentTarget.getAttribute('data-date-nav');
    let date;
    if (nav) {
      date = moment(this.state.date).add(nav === 'next' ? 1 : -1, 'day').format(constants.DATEFMT);
    } else if (moment(event.target.value).isValid()) {
      event.persist();
      date = event.target.value;
    } else {
      date = constants.INITIALDATE;
    }
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      this.setState({ date });
      setTimeout(() => { this.initTableTask(); });
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={0} alignItems="stretch" justify="center" className={classes.root}>
        <Grid item xs={12}>
          <Grid item xs={12} className={classes.root}>
            <Dashboard isOpenDashboard={this.state.isOpenDashboard} toggleDashboard={this.toggleDashboard.bind(this)} tableTasks={this.state.tableTasks} />
            <TaskPool isOpenTaskPool={this.state.isOpenTaskPool} toggleTaskPool={this.toggleTaskPool.bind(this)} poolTasks={this.state.poolTasks} changePoolTasks={this.changePoolTasks.bind(this)} />
            <Paper elevation={1}>
              <div style={{ padding: 24 }}>
                <div>
                  <i className="fa fa-table fa-lg" />
                  <Typography style={{ display: 'inline', marginRight: 20 }}>　テーブル</Typography>
                </div>
                <DatePicker value={this.state.date} changeDate={this.changeDate.bind(this)} label={''} />
                <div style={{ display: 'inline-block', float: 'right' }}>
                  <Tooltip title={moment(this.state.date, 'YYYY-MM-DD').add(-1, 'day').format('YYYY/MM/DD')} placement="top">
                    <div style={{ display: 'inline-block' }}>
                      <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="prev" ><i className="fa fa-angle-left fa-lg" /></Button>
                    </div>
                  </Tooltip>
                  <Tooltip title={`最終保存時刻 : ${(`00${this.state.lastSaveTime.hour}`).slice(-2)}:${(`00${this.state.lastSaveTime.minute}`).slice(-2)}`} placement="top">
                    <div style={{ display: 'inline-block' }}>
                      <Button className={classes.tableCtlButton} disabled={!this.state.saveable} variant="raised" onClick={this.saveHot.bind(this)} color="default"><i className="fa fa-floppy-o fa-lg" /></Button>
                    </div>
                  </Tooltip>
                  <Tooltip title={moment(this.state.date, 'YYYY-MM-DD').add(1, 'day').format('YYYY/MM/DD')} placement="top">
                    <div style={{ display: 'inline-block' }}>
                      <Button className={classes.tableCtlButton} variant="raised" onClick={this.changeDate.bind(this)} data-date-nav="next" ><i className="fa fa-angle-right fa-lg" /></Button>
                    </div>
                  </Tooltip>
                </div>
              </div>
              <TableStatus tableTasks={this.state.tableTasks} isLoading={this.state.loading} />
              {(() => {
                if (this.state.isHotMode) {
                  return (<TaskTable
                    onRef={ref => (this.taskTable = ref)} // eslint-disable-line
                    tableTasks={this.state.tableTasks}
                    addTask={this.addTask.bind(this)}
                    handleTableTasks={this.handleTableTasks.bind(this)}
                    handleSaveable={this.handleSaveable.bind(this)}
                    moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
                  />);
                } return (<TaskTableMobile
                  tableTasks={this.state.tableTasks}
                  changeTableTasks={this.changeTableTasks.bind(this)}
                />);
              })()}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

Taskontable.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  toggleHelpDialog: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Taskontable);
