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
import Hidden from 'material-ui/Hidden';

import '../styles/handsontable-custom.css';

import Dashboard from './Dashboard';
import TableStatus from './TableStatus';
import TaskPool from './TaskPool';
import TaskTable from './TaskTable';
import DatePicker from './DatePicker';

import { getEmptyHotData } from '../hot';

import constants from '../constants';

import util from '../util';

const styles = {
  root: {
    paddingTop: '2.25em',
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
    minWidth: 60,
  },
};

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      return false;
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

  changePoolTasks(taskPoolActionType, taskPoolType, value) {
    if (taskPoolActionType === constants.taskPoolActionType.ADD) {
      this.addPoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.EDIT) {
      this.editPoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.MOVE) {
      this.movePoolTaskToTableTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.REMOVE) {
      this.removePoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.DOWN) {
      this.downPoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.UP) {
      this.upPoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.BOTTOM) {
      this.bottomPoolTask(taskPoolType, value);
    } else if (taskPoolActionType === constants.taskPoolActionType.TOP) {
      this.topPoolTask(taskPoolType, value);
    }
    setTimeout(() => this.savePoolTasks(this.state.poolTasks));
  }

  addPoolTask(taskPoolType, task) {
    const poolTasks = Object.assign({}, this.state.poolTasks);
    poolTasks[taskPoolType].push(task);
    this.setState({ poolTasks });
  }

  editPoolTask(taskPoolType, { task, index }) {
    const poolTasks = Object.assign({}, this.state.poolTasks);
    poolTasks[taskPoolType][index] = task;
    this.setState({ poolTasks });
  }


  removePoolTask(taskPoolType, index) {
    const poolTasks = Object.assign({}, this.state.poolTasks);
    poolTasks[taskPoolType].splice(index, 1);
    this.setState({ poolTasks });
  }

  downPoolTask(taskPoolType, index) {
    if (this.state.poolTasks[taskPoolType].length === index + 1) return;
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    const target = poolTasks[taskPoolType];
    target.splice(index, 2, target[index + 1], target[index]);
    this.setState({ poolTasks });
  }

  bottomPoolTask(taskPoolType, index) {
    if (this.state.poolTasks[taskPoolType].length === index + 1) return;
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    const target = poolTasks[taskPoolType].splice(index, 1)[0];
    poolTasks[taskPoolType].push(target);
    this.setState({ poolTasks });
  }

  upPoolTask(taskPoolType, index) {
    if (index === 0) return;
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    const target = poolTasks[taskPoolType];
    target.splice(index - 1, 2, target[index], target[index - 1]);
    this.setState({ poolTasks });
  }


  topPoolTask(taskPoolType, index) {
    if (index === 0) return;
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    const target = poolTasks[taskPoolType].splice(index, 1)[0];
    poolTasks[taskPoolType].unshift(target);
    this.setState({ poolTasks });
  }

  movePoolTaskToTableTask(taskPoolType, index) {
    const tableTasks = this.state.tableTasks;
    tableTasks.push(Object.assign({}, this.state.poolTasks[taskPoolType][index]));
    this.setState({ tableTasks });
    this.taskTable.setData(tableTasks);
    if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
       taskPoolType === constants.taskPoolType.LOWPRIORITY) {
      this.removePoolTask(taskPoolType, index);
    }
    // タスクプールからテーブルタスクに移動したら保存する
    setTimeout(() => { this.saveHot(); });
  }

  moveTableTaskToPoolTask(taskPoolType, task) {
    this.addPoolTask(taskPoolType, task);
    // テーブルタスクからタスクプールに移動したら保存する
    this.saveHot();
    this.savePoolTasks(this.state.poolTasks);
  }

  savePoolTasks(poolTasks) {
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
    const tableTasks = this.taskTable.getTasksIgnoreEmptyTaskAndProp();
    this.setState({ tableTasks });
    this.saveTableTask(tableTasks);
  }

  addTask() {
    this.taskTable.addTask();
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
      if (snapshot.exists() && !util.equal(this.taskTable.getTasksIgnoreEmptyTaskAndProp(), snapshot.val()[this.state.date])) {
      // サーバーにタスクが存在した場合 かつ、サーバーから配信されたデータが自分のデータと違う場合、サーバーのデータでテーブルを初期化する
        this.taskTable.clear();
        this.taskTable.setData(snapshot.val()[this.state.date]);
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
    this.taskTable.clear();
    this.fetchTableTask().then((snapshot) => {
      if (snapshot.exists() && !util.equal(snapshot.val(), getEmptyHotData())) {
        // サーバーに初期値以外のタスクが存在した場合サーバーのデータでテーブルを初期化する
        this.taskTable.setData(snapshot.val());
      } else if (this.state.poolTasks.regularTasks.length !== 0) {
        // 定期タスクをテーブルに設定する処理。
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.getDayOfWeekStr(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.getDayOfWeekStr(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        this.taskTable.setData(regularTasks);
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
        <Hidden xsDown>
          <Grid item sm={1}>
            <Button color="default" className={classes.navButton} onClick={this.changeDate.bind(this)} data-date-nav="prev" >
              <i className="fa fa-angle-left fa-lg" />
            </Button>
          </Grid>
        </Hidden>
        <Grid item xs={12} sm={10}>
          <Grid item xs={12} className={classes.root}>
            <Dashboard
              isOpenDashboard={this.state.isOpenDashboard}
              toggleDashboard={this.toggleDashboard.bind(this)}
              tableTasks={this.state.tableTasks}
            />
            <TaskPool
              isOpenTaskPool={this.state.isOpenTaskPool}
              toggleTaskPool={this.toggleTaskPool.bind(this)}
              poolTasks={this.state.poolTasks}
              changePoolTasks={this.changePoolTasks.bind(this)}
            />
            <Paper elevation={1}>
              <div style={{ padding: 24 }}>
                <i className="fa fa-table fa-lg" />
                <Typography style={{ display: 'inline' }}>
                  　テーブル
                </Typography>
                <div>
                  <DatePicker value={this.state.date} changeDate={this.changeDate.bind(this)} label={''} />
                  <div style={{ display: 'inline-block', float: 'right' }}>
                    <Button className={classes.tableCtlButton} variant="raised" onClick={this.addTask.bind(this)} color="default">
                      <i className="fa fa-plus fa-lg" />
                          行追加
                    </Button>
                    <Tooltip title={`最終保存時刻 : ${(`00${this.state.lastSaveTime.hour}`).slice(-2)}:${(`00${this.state.lastSaveTime.minute}`).slice(-2)}`} placement="top">
                      <div style={{ display: 'inline-block' }}>
                        <Button className={classes.tableCtlButton} disabled={!this.state.saveable} variant="raised" onClick={this.saveHot.bind(this)} color="default">
                          <i className="fa fa-floppy-o fa-lg" />
                            保存
                        </Button>
                      </div>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <TableStatus tableTasks={this.state.tableTasks} isLoading={this.state.loading} />
              <TaskTable
                onRef={ref => (this.taskTable = ref)}
                tableTasks={this.state.tableTasks}
                addTask={this.addTask.bind(this)}
                handleTableTasks={this.handleTableTasks.bind(this)}
                handleSaveable={this.handleSaveable.bind(this)}
                moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
              />
            </Paper>
          </Grid>
        </Grid>
        <Hidden xsDown>
          <Grid item sm={1}>
            <Button color="default" className={classes.navButton} onClick={this.changeDate.bind(this)} data-date-nav="next" >
              <i className="fa fa-angle-right fa-lg" />
            </Button>
          </Grid>
        </Hidden>
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
};

export default withStyles(styles)(Taskontable);
