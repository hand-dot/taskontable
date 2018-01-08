import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import { LinearProgress } from 'material-ui/Progress';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Hidden from 'material-ui/Hidden';

import '../styles/handsontable-custom.css';

import GlobalHeader from './GlobalHeader';
import Dashboard from './Dashboard';
import TableCtl from './TableCtl';
import TaskPool from './TaskPool';
import DatePicker from './DatePicker';
import ProcessingDialog from './ProcessingDialog';

import firebaseConf from '../configs/firebase';
import { bindShortcut, hotConf, getEmptyHotData, getEmptyRow, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';

import constants from '../constants';

import util from '../util';

const initialState = {
  user: { displayName: '', photoURL: '', uid: '' },
  loading: true,
  notifiable: true,
  saveable: false,
  isOpenDashboard: false,
  isOpenTaskPool: false,
  isOpenHelpDialog: false,
  isOpenProcessingDialog: false,
  date: moment().format(constants.DATEFMT),
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  tableTasks: getEmptyHotData(),
  poolTasks: {
    highPriorityTasks: [],
    lowPriorityTasks: [],
    regularTasks: [],
  },
};

const styles = {
  root: {
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
};

const NotificationClone = (() => ('Notification' in window ? cloneDeep(Notification) : false))();
firebase.initializeApp(firebaseConf);

let hot = null;
class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.setStateFromUpdateHot = debounce(this.setStateFromUpdateHot, constants.RENDER_DELAY);
    this.setStateFromRenderHot = debounce(this.setStateFromRenderHot, constants.RENDER_DELAY);
    this.openProcessingDialog = throttle(this.openProcessingDialog, constants.PROCESSING_DELAY);
    this.closeProcessingDialog = debounce(this.closeProcessingDialog, constants.RENDER_DELAY);
  }

  componentWillMount() {
    // 初期値の最終保存時刻
    this.setState({
      lastSaveTime: util.getCrrentTimeObj(),
    });
    window.addEventListener('keydown', (e) => {
      this.fireShortcut(e);
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
      contextMenu: {
        callback(key, selection) {
          if (key === 'set_current_time') {
            for (let row = selection.start.row; row <= selection.end.row; row += 1) {
              this.setDataAtCell(row, selection.start.col, moment().format('HH:mm'));
            }
          } else if (key === 'reverse_taskpool_hight' || key === 'reverse_taskpool_low') {
            const taskPoolType = key === 'reverse_taskpool_hight' ? constants.taskPoolType.HIGHPRIORITY : constants.taskPoolType.LOWPRIORITY;
            for (let row = selection.start.row; row <= selection.end.row; row += 1) {
              // テーブルタスクからタスクプールに移すタイミングでテーブルが1行減るので常に選択開始行を処理する
              self.moveTableTaskToPoolTask(taskPoolType, selection.start.row, hot);
            }
          } else if (key === 'done_task') {
            for (let row = selection.start.row; row <= selection.end.row; row += 1) {
              this.setDataAtRowProp(row, 'startTime', moment().format('HH:mm'));
              this.setDataAtRowProp(row, 'endTime', moment().format('HH:mm'));
            }
          }
        },
        items: {
          row_above: {
            name: '上に行を追加する',
          },
          row_below: {
            name: '下に行を追加する',
          },
          hsep1: '---------',
          remove_row: {
            name: '行を削除する',
          },
          hsep2: '---------',
          reverse_taskpool_hight: {
            name: '[すぐにやる]に戻す',
          },
          reverse_taskpool_low: {
            name: '[いつかやる]に戻す',
          },
          hsep3: '---------',
          set_current_time: {
            name: '現在時刻を入力する',
            disabled() {
              const startCol = this.getSelected()[1];
              const endCol = this.getSelected()[3];
              const prop = this.colToProp(startCol);
              return startCol !== endCol || !(prop === 'endTime' || prop === 'startTime');
            },
          },
          done_task: {
            name: 'タスクを完了にする',
          },
        },
      },
      afterRender() {
        self.openProcessingDialog();
        self.setStateFromRenderHot();
        self.closeProcessingDialog();
      },
      afterUpdateSettings() { self.setStateFromUpdateHot(); },
      afterInit() { bindShortcut(this); },
    }));
    window.hot = hot;
  }

  setAInitialState() {
    this.setState(cloneDeep(initialState));
  }

  setStateFromRenderHot() {
    const hotTasks = getHotTasksIgnoreEmptyTask(hot);
    if (!util.isSameObj(this.state.tableTasks, []) && !util.isSameObj(hotTasks, this.state.tableTasks)) {
      this.setState({
        saveable: true,
        tableTasks: hotTasks,
      });
    } else if (util.isSameObj(hotTasks, this.state.tableTasks)) {
      this.setState({
        saveable: false,
      });
    }
    setTimeout(() => this.forceUpdate());
  }

  setStateFromUpdateHot() {
    this.setState({
      saveable: false,
      tableTasks: getHotTasksIgnoreEmptyTask(hot),
    });
    setTimeout(() => this.forceUpdate());
  }

  openProcessingDialog() {
    this.setState({ isOpenProcessingDialog: true });
  }

  closeProcessingDialog() {
    this.setState({ isOpenProcessingDialog: false });
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
    } else if (constants.shortcuts.INSERT(e)) {
      if (hot) hot.alter('insert_row');
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      this.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.toggleDashboard();
    } else if (constants.shortcuts.TOGGLE_TASKPOOL(e)) {
      e.preventDefault();
      this.toggleTaskPool();
    } else if (constants.shortcuts.SELECT_TABLE(e)) {
      e.preventDefault();
      hot.selectCell(0, 0);
    }
    return false;
  }

  toggleHelpDialog() {
    this.setState({ isOpenHelpDialog: !this.state.isOpenHelpDialog });
  }

  openHelpDialog() {
    this.setState({ isOpenHelpDialog: true });
  }

  closeHelpDialog() {
    this.setState({ isOpenHelpDialog: false });
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
    const poolTasks = cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].splice(index, 2, poolTasks[taskPoolType][index + 1], poolTasks[taskPoolType][index]);
    this.setState({ poolTasks });
  }

  upPoolTask(taskPoolType, index) {
    if (index === 0) return;
    const poolTasks = cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].splice(index - 1, 2, poolTasks[taskPoolType][index], poolTasks[taskPoolType][index - 1]);
    this.setState({ poolTasks });
  }

  movePoolTaskToTableTask(taskPoolType, index) {
    if (!hot) return;
    const hotData = hot.getSourceData();
    let insertPosition = hotData.lastIndexOf(data => util.isSameObj(getEmptyRow(), data));
    if (insertPosition === -1) {
      insertPosition = getHotTasksIgnoreEmptyTask(hot).length;
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

  moveTableTaskToPoolTask(taskPoolType, index, hotInstance) {
    const task = hotInstance.getSourceDataAtRow(index);
    if (!task.title) {
      alert('作業内容が未記入のタスクはタスクプールに戻せません。');
      return;
    }
    this.addPoolTask(taskPoolType, hotInstance.getSourceDataAtRow(index));
    hotInstance.alter('remove_row', index);
    // テーブルタスクからタスクプールに移動したら保存する
    setTimeout(() => {
      this.saveHot();
      this.savePoolTasks(this.state.poolTasks);
    });
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
    firebase.database().ref(`/${this.state.user.uid}/poolTasks`).set(tasks);
  }

  saveHot() {
    if (hot) {
      // 並び変えられたデータを取得するために処理が入っている。
      this.saveTableTask(getHotTasksIgnoreEmptyTask(hot));
    }
  }

  saveTableTask(data) {
    this.setState(() => ({
      loading: true,
    }));
    firebase.database().ref(`/${this.state.user.uid}/tableTasks/${this.state.date}`).set(data.length === 0 ? getEmptyHotData() : data).then(() => {
      this.setState(() => ({
        loading: false,
        lastSaveTime: util.getCrrentTimeObj(),
        saveable: false,
      }));
    });
  }

  attachPoolTasks() {
    firebase.database().ref(`/${this.state.user.uid}/poolTasks`).on('value', (snapshot) => {
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
    if (hot) {
      hot.updateSettings({ data: getEmptyHotData() });
      firebase.database().ref(`/${this.state.user.uid}/tableTasks`).on('value', (snapshot) => {
        this.setState(() => ({
          loading: true,
        }));
        if (snapshot.exists()) {
          if (snapshot.exists() && !util.isSameObj(getHotTasksIgnoreEmptyTask(hot), snapshot.val()[this.state.date])) {
            // サーバーにタスクが存在した場合 かつ、サーバーから配信されたデータが自分のデータと違う場合、
            // サーバーのデータでテーブルを初期化する
            setDataForHot(hot, snapshot.val()[this.state.date]);
          }
        }
        this.setState(() => ({
          loading: false,
        }));
      });
    }
  }

  fetchTableTask() {
    this.setState(() => ({ loading: true }));
    return firebase.database().ref(`/${this.state.user.uid}/tableTasks/${this.state.date}`).once('value').then((snapshot) => {
      this.setState(() => ({ loading: false }));
      return snapshot;
    });
  }

  initTableTask() {
    this.fetchTableTask().then((snapshot) => {
      if (hot) {
        hot.updateSettings({ data: getEmptyHotData() });
        if (snapshot.exists() && !util.isSameObj(snapshot.val(), getEmptyHotData())) {
          // サーバーに初期値以外のタスクが存在した場合サーバーのデータでテーブルを初期化する
          setDataForHot(hot, snapshot.val());
        } else if (this.state.poolTasks.regularTasks.length !== 0) {
          // 定期タスクをテーブルに設定する処理。
          const dayAndCount = util.getDayAndCount(new Date(this.state.date));
          // 定期のタスクが設定されており、サーバーにデータが存在しない場合
          // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
          // util.getDayOfWeekStr(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
          // https://github.com/hand-dot/taskontable/issues/118
          const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.getDayOfWeekStr(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
          setDataForHot(hot, regularTasks);
        }
      }
    });
  }

  loginCallback(user) {
    this.setState({ user: { displayName: user.displayName, photoURL: user.photoURL, uid: user.uid } });
    // userが更新されたあとに処理する
    setTimeout(() => {
      // タスクプールをサーバーと同期開始
      this.attachPoolTasks();
      // テーブルをサーバーと同期開始
      this.attachTableTasks();
      // テーブルを初期化
      this.initTableTask();
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
      date = moment(this.state.date).add(nav === 'next' ? 1 : -1, 'day').format(constants.DATEFMT);
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

  render() {
    const { classes } = this.props;
    return (
      <div>
        <GlobalHeader
          user={this.state.user}
          isOpenHelpDialog={this.state.isOpenHelpDialog}
          openHelpDialog={this.openHelpDialog.bind(this)}
          closeHelpDialog={this.closeHelpDialog.bind(this)}
          loginCallback={this.loginCallback.bind(this)}
          logoutCallback={this.logoutCallback.bind(this)}
        />
        <Grid container alignItems="stretch" justify="center" className={classes.root}>
          <Hidden xsDown>
            <Grid item xs={0} sm={1}>
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
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={1}>
                <div style={{ padding: '24px 24px 0' }}>
                  <i className="fa fa-table fa-lg" />
                  <Typography style={{ display: 'inline', marginRight: 20 }}>
                    　テーブル
                  </Typography>
                  <DatePicker value={this.state.date} changeDate={this.changeDate.bind(this)} label={''} />
                  <Hidden xsDown>
                    <TableCtl
                      saveable={this.state.saveable}
                      lastSaveTime={this.state.lastSaveTime}
                      saveHot={this.saveHot.bind(this)}
                      notifiable={this.state.notifiable}
                      toggleNotifiable={this.toggleNotifiable.bind(this)}
                    />
                  </Hidden>
                </div>
                <div style={{ paddingTop: 10 }}>
                  <LinearProgress style={{ visibility: this.state.loading ? 'visible' : 'hidden' }} />
                  <div id="hot" />
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Hidden xsDown>
            <Grid item xs={0} sm={1}>
              <Button color="default" className={classes.navButton} onClick={this.changeDate.bind(this)} data-date-nav="next" >
                <i className="fa fa-angle-right fa-lg" />
              </Button>
            </Grid>
          </Hidden>
        </Grid>
        <ProcessingDialog
          open={this.state.isOpenProcessingDialog}
        />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
