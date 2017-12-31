import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';

import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import { LinearProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';

import '../styles/handsontable-custom.css';

import GlobalHeader from './GlobalHeader';
import Dashboard from './Dashboard';
import TableCtl from './TableCtl';
import TaskPool from './TaskPool';
import DatePicker from './DatePicker';

import firebaseConf from '../configs/firebase';
import { bindShortcut, hotConf, getEmptyHotData } from '../hot';

import constants from '../constants';

import util from '../util';

const initialState = {
  userId: '',
  loading: true,
  notifiable: true,
  saveable: false,
  isOpenDashboard: false,
  isOpenTaskPool: true,
  date: moment().format('YYYY-MM-DD'),
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  tableTasks: getEmptyHotData(),
  poolTasks: {
    highPriorityTasks: [],
    lowPriorityTasks: [],
    regularTasks: [],
    dailyTasks: [],
  },
};

const styles = {
  root: {
    margin: '0 auto',
    paddingBottom: 20,
    maxWidth: constants.APPWIDTH,
  },
  navButton: {
    height: '100%',
    width: '100%',
  },
  helpButton: {
    fontSize: 15,
    width: 20,
    height: 20,
  },
};

const NotificationClone = (() => ('Notification' in window ? cloneDeep(Notification) : false))();
firebase.initializeApp(firebaseConf);

let hot = null;

// 行の並び替えにも対応した空行を除いたハンズオンテーブルのデータ取得メソッド
const getHotTasksIgnoreEmptyTask = () => {
  if (hot) {
    const emptyRow = JSON.stringify(getEmptyHotData()[0]);
    const hotData = hot.getSourceData().map((data, index) => hot.getSourceDataAtRow(hot.toPhysicalRow(index)));
    return hotData.filter(data => emptyRow !== JSON.stringify(data));
  }
  return getEmptyHotData();
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.setStateFromHot = debounce(this.setStateFromHot, 1000);
    this.fireShortcut = debounce(this.fireShortcut, constants.KEYEVENT_DELAY);
  }

  componentWillMount() {
    // 初期値の最終保存時刻
    this.setState({
      lastSaveTime: util.getCrrentTimeObj(),
    });
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && Object.values(constants.shortcuts).find(shortcut => shortcut === e.keyCode) !== undefined) {
        e.preventDefault();
        this.fireShortcut(e);
      }
    });
    window.addEventListener('beforeunload', (e) => {
      if (this.state.saveable) {
        const dialogText = '保存していない内容があります。';
        e.returnValue = dialogText;
        return dialogText;
      }
      return false;
    });
  }

  componentDidMount() {
    const self = this;
    hot = new Handsontable(document.getElementById('hot'), Object.assign(hotConf, {
      afterRender() {
        const hotTasks = getHotTasksIgnoreEmptyTask();
        if (JSON.stringify(self.state.tableTasks) !== JSON.stringify(hotTasks)) {
          self.setState({
            saveable: true,
            tableTasks: hotTasks,
          });
        }
        setTimeout(() => self.forceUpdate());
      },
      afterUpdateSettings() { self.setStateFromHot(); },
      afterInit() {
        self.setStateFromHot();
        bindShortcut(this);
      },
    }));
    window.hot = hot;
  }

  setAInitialState() {
    this.setState(cloneDeep(initialState));
  }

  setStateFromHot() {
    this.setState({
      saveable: false,
      tableTasks: getHotTasksIgnoreEmptyTask(),
    });
    setTimeout(() => this.forceUpdate());
  }

  fireShortcut(e) {
    if ((e.keyCode === constants.shortcuts.NEXTDATE || e.keyCode === constants.shortcuts.PREVDATE)) {
      // 基準日を変更
      if (this.state.saveable && !window.confirm('保存していない内容があります。')) return false;
      this.setState({ date: moment(this.state.date).add(e.keyCode === 190 ? 1 : -1, 'day').format('YYYY-MM-DD') });
      setTimeout(() => { this.initTableTask(); });
    } else if (e.keyCode === constants.shortcuts.SAVE) {
      this.saveHot();
    } else if (e.keyCode === constants.shortcuts.INSERT) {
      if (hot) hot.alter('insert_row');
    } else if (e.keyCode === constants.shortcuts.TOGGLE_DASHBOAD) {
      this.toggleDashboard();
    } else if (e.keyCode === constants.shortcuts.TOGGLE_TASKPOOL) {
      this.toggleTaskPool();
    } else if (e.keyCode === constants.shortcuts.SELECT_TABLE) {
      hot.selectCell(0, 0);
    }
    return false;
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

  movePoolTaskToTableTask(taskPoolType, index) {
    if (!hot) return;
    const emptyRow = JSON.stringify(getEmptyHotData()[0]);
    const hotData = hot.getSourceData().map((data, i) => hot.getSourceDataAtRow(hot.toPhysicalRow(i)));
    let insertPosition = hotData.lastIndexOf(data => emptyRow === JSON.stringify(data));
    if (insertPosition === -1) {
      insertPosition = this.state.tableTasks.length;
    }
    const target = Object.assign({}, this.state.poolTasks[taskPoolType][index]);
    Object.keys(target).forEach((key) => {
      hot.setDataAtRowProp(insertPosition, key, target[key]);
    });
    if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
       taskPoolType === constants.taskPoolType.LOWPRIORITY) {
      this.removePoolTask(taskPoolType, index);
    }
    // タスクプールからテーブルタスクに移動したら保存する
    setTimeout(() => { this.saveHot(); });
  }

  toggleNotifiable(event, checked) {
    if ('Notification' in window) {
      Notification = checked ? NotificationClone : false;　// eslint-disable-line
      this.setState(() => ({
        notifiable: checked,
      }));
      if (!checked) {
        hot.getData().forEach((data, index) => {
          hot.removeCellMeta(index, hot.propToCol('startTime'), 'notification');
        });
        hot.render();
      }
    }
  }

  attachTableTasks() {
    firebase.database().ref(`/${this.state.userId}/tableTasks`).on('value', (snapshot) => {
      this.setState(() => ({
        loading: true,
      }));
      if (snapshot.exists() && hot) {
        if ((this.state.poolTasks.dailyTasks.length === 0 || snapshot.exists()) && !util.isSameObj(getHotTasksIgnoreEmptyTask(), snapshot.val()[this.state.date])) {
          // デイリーのタスクが空 or サーバーにタスクが存在した場合 かつ、
          // サーバーから配信されたデータが自分のデータと違う場合サーバーのデータでテーブルを初期化する
          hot.updateSettings({ data: snapshot.val()[this.state.date] });
        }
      }
      this.setState(() => ({
        loading: false,
      }));
    });
  }

  fetchTableTask() {
    this.setState(() => ({
      loading: true,
    }));
    return firebase.database().ref(`/${this.state.userId}/tableTasks/${this.state.date}`).once('value').then((snapshot) => {
      this.setState(() => ({
        loading: false,
      }));
      return snapshot;
    });
  }

  initTableTask() {
    this.fetchTableTask().then((snapshot) => {
      if (hot) {
        hot.updateSettings({ data: getEmptyHotData() });
        if (this.state.poolTasks.dailyTasks.length === 0 || snapshot.exists()) {
          // デイリーのタスクが空 or サーバーにタスクが存在した場合サーバーのデータでテーブルを初期化する
          hot.updateSettings({ data: snapshot.val() });
        } else {
          // デイリーのタスクが設定されており、サーバーにデータが存在しない場合、
          // デイリーのタスクの計算処理を動かすためにsetDataAtRowPropし、テーブルを構築する
          cloneDeep(this.state.poolTasks.dailyTasks).forEach((data, rowIndex) => {
            Object.keys(data).forEach((key) => {
              hot.setDataAtRowProp(rowIndex, key, data[key]);
            });
          });
        }
      }
    });
  }

  attachPoolTasks() {
    firebase.database().ref(`/${this.state.userId}/poolTasks`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const poolTasks = snapshot.val();
        const statePoolTasks = Object.assign({}, this.state.poolTasks);
        statePoolTasks.highPriorityTasks = poolTasks.highPriorityTasks ? poolTasks.highPriorityTasks : [];
        statePoolTasks.lowPriorityTasks = poolTasks.lowPriorityTasks ? poolTasks.lowPriorityTasks : [];
        statePoolTasks.regularTasks = poolTasks.regularTasks ? poolTasks.regularTasks : [];
        statePoolTasks.dailyTasks = poolTasks.dailyTasks ? poolTasks.dailyTasks : [];
        this.setState({
          poolTasks: statePoolTasks,
        });
      }
    });
  }

  savePoolTasks(poolTasks) {
    firebase.database().ref(`/${this.state.userId}/poolTasks`).set(poolTasks);
  }

  changeUserId(e) {
    this.setState({ userId: e.target.value });
  }

  loginCallback(userId) {
    this.setState({ userId });
    // userIdが更新されたあとに処理する
    setTimeout(() => {
      // タスクプールをサーバーと同期開始
      this.attachPoolTasks();
      // テーブルの初期化
      this.initTableTask();
      // テーブルをサーバーと同期開始
      this.attachTableTasks();
    });
  }

  logoutCallback() {
    // stateの初期化
    this.setAInitialState();
    // テーブルのクリア
    setTimeout(() => { if (hot) hot.updateSettings({ data: getEmptyHotData() }); });
  }

  changeDate(event) {
    if (!hot) return;
    const nav = event.currentTarget.getAttribute('data-date-nav');
    let date;
    if (nav) {
      date = moment(this.state.date).add(nav === 'next' ? 1 : -1, 'day').format('YYYY-MM-DD');
    } else if (moment(event.target.value).isValid()) {
      event.persist();
      date = event.target.value;
    } else {
      date = constants.INITIALDATE;
    }
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      this.setState(() => ({
        date,
      }));
      setTimeout(() => { this.initTableTask(); });
    }
  }

  saveHot() {
    if (hot) {
      // 並び変えられたデータを取得するために処理が入っている。
      this.saveTableTask(getHotTasksIgnoreEmptyTask());
    }
  }

  saveTableTask(data) {
    this.setState(() => ({
      loading: true,
    }));
    firebase.database().ref(`/${this.state.userId}/tableTasks/${this.state.date}`).set(data.length === 0 ? getEmptyHotData() : data).then(() => {
      this.setState(() => ({
        loading: false,
        lastSaveTime: util.getCrrentTimeObj(),
        saveable: false,
      }));
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <GlobalHeader
          userId={this.state.userId}
          changeUserId={this.changeUserId.bind(this)}
          loginCallback={this.loginCallback.bind(this)}
          logoutCallback={this.logoutCallback.bind(this)}
        />
        <Grid container alignItems="stretch" justify="center" spacing={40} className={classes.root}>
          <Grid item xs={1}>
            <Button color="default" className={classes.navButton} onClick={this.changeDate.bind(this)} data-date-nav="prev" >
              <i className="fa fa-angle-left fa-lg" />
            </Button>
          </Grid>
          <Grid item xs={10}>
            <Grid item xs={12} className={classes.root}>
              <Dashboard
                date={this.state.date}
                isOpenDashboard={this.state.isOpenDashboard}
                toggleDashboard={this.toggleDashboard.bind(this)}
                changeDate={this.changeDate.bind(this)}
                tableTasks={this.state.tableTasks}
              />
              <TaskPool
                isOpenTaskPool={this.state.isOpenTaskPool}
                toggleTaskPool={this.toggleTaskPool.bind(this)}
                poolTasks={this.state.poolTasks}
                changePoolTasks={this.changePoolTasks.bind(this)}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={1}>
                <div style={{ padding: '24px 24px 0' }}>
                  <i className="fa fa-table fa-lg" />
                  <Typography style={{ display: 'inline', marginRight: 20 }}>
                    　テーブル
                  </Typography>
                  <DatePicker value={this.state.date} changeDate={this.changeDate.bind(this)} label={''} />
                  <TableCtl
                    lastSaveTime={this.state.lastSaveTime}
                    saveHot={this.saveHot.bind(this)}
                    notifiable={this.state.notifiable}
                    toggleNotifiable={this.toggleNotifiable.bind(this)}
                  />
                </div>
                <LinearProgress style={{ visibility: this.state.loading ? 'visible' : 'hidden' }} />
                <div style={{ padding: '0 24px 24px 24px' }}>
                  <div id="hot" />
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={1}>
            <Button color="default" className={classes.navButton} onClick={this.changeDate.bind(this)} data-date-nav="next" >
              <i className="fa fa-angle-right fa-lg" />
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
