import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import debounce from 'lodash.debounce';

import Tabs, { Tab } from 'material-ui/Tabs';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Snackbar from 'material-ui/Snackbar';

import Dashboard from '../components/Dashboard';
import TableCtl from '../components/TableCtl';
import TaskPool from '../components/TaskPool';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';

import constants from '../constants';
import util from '../util';

const styles = theme => ({
  root: {
    width: constants.APPWIDTH,
    margin: '0 auto',
  },
});

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.saveTableTasks = debounce(this.saveTableTasks, constants.REQEST_DELAY);
    this.savePoolTasks = debounce(this.savePoolTasks, constants.REQEST_DELAY);
    this.initTableTask = debounce(this.initTableTask, constants.REQEST_DELAY);
    this.oldTimeDiffMinute = '';
    this.bindOpenTaskIntervalID = '';
    this.state = {
      isOpenSaveSnackbar: false,
      isOpenScriptSnackbar: false,
      scriptSnackbarText: '',
      isHotMode: this.props.theme.breakpoints.values.sm < constants.APPWIDTH,
      loading: true,
      saveable: false,
      tab: 0,
      hasOpenTask: false,
      isOpenDashboard: true,
      date: moment().format(constants.DATEFMT),
      lastSaveTime: util.getCrrentTimeObj(),
      tableTasks: [],
      poolTasks: {
        highPriorityTasks: [],
        lowPriorityTasks: [],
        regularTasks: [],
      },
    };
  }

  componentWillMount() {
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
    // テーブルを同期開始&初期化
    this.initTableTask();
  }

  componentWillUnmount() {
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    document.title = constants.TITLE;
    window.onkeydown = '';
    window.onbeforeunload = '';
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).off();
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
  }

  changeTableTasksByMobile(taskActionType, value) {
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
      tableTasks.splice(value, 1);
      this.handleTableTasks(tableTasks);
      setTimeout(() => { this.moveTableTaskToPoolTask(taskPoolType, this.state.tableTasks[value]); });
      return;
    }
    this.handleSaveable(this.state.saveable ? true : !util.equal(tableTasks, this.state.tableTasks));
    this.handleTableTasks(tableTasks);
    setTimeout(() => { this.saveTableTasks(); });
  }

  changePoolTasks(taskActionType, taskPoolType, value) {
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    if (taskActionType === constants.taskActionType.ADD) {
      poolTasks[taskPoolType].push(util.setIdIfNotExist(value));
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
      if (this.state.isHotMode) this.taskTable.setDataForHot(tableTasks);
      if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
         taskPoolType === constants.taskPoolType.LOWPRIORITY) {
        poolTasks[taskPoolType].splice(value, 1);
      }
      // タスクプールからテーブルタスクに移動したら保存する
      setTimeout(() => { this.saveTableTasks(); });
    }
    this.setState({ poolTasks });
    setTimeout(() => this.savePoolTasks());
  }

  moveTableTaskToPoolTask(taskPoolType, task) {
    const willPooltask = util.cloneDeep(task);
    willPooltask.startTime = '';
    willPooltask.endTime = '';
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].push(willPooltask);
    this.setState({ poolTasks });
    // テーブルタスクからタスクプールに移動したら保存する
    setTimeout(() => {
      this.saveTableTasks();
      this.savePoolTasks();
    });
  }

  savePoolTasks() {
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    // IDの生成処理
    Object.keys(poolTasks).forEach((poolTaskKey) => { poolTasks[poolTaskKey] = poolTasks[poolTaskKey].map(poolTask => util.setIdIfNotExist(poolTask)); });
    if (poolTasks.regularTasks) {
      // regularTasksで保存する値のdayOfWeekが['日','月'...]になっているので変換
      // https://github.com/hand-dot/taskontable/issues/118
      poolTasks.regularTasks = poolTasks.regularTasks.map((task) => {
        const copyTask = Object.assign({}, task);
        if (copyTask.dayOfWeek) {
          copyTask.dayOfWeek = copyTask.dayOfWeek.map(day => util.getDayOfWeek(day));
        }
        return copyTask;
      });
    }
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).set(poolTasks);
  }

  saveTableTasks() {
    // IDを生成し並び変えられたデータを取得するために処理が入っている。
    const tableTasks = (this.state.isHotMode ? this.taskTable.getTasksIgnoreEmptyTaskAndProp() : this.state.tableTasks).map(tableTask => util.setIdIfNotExist(tableTask));
    // 開始時刻順に並び替える
    const sortedTableTask = this.resetTable(tableTasks);
    this.setState({ loading: true });
    this.fireScript(sortedTableTask, 'exportScript').then((data) => {
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).set(data).then(() => {
        this.setState({ isOpenSaveSnackbar: true, loading: false, lastSaveTime: util.getCrrentTimeObj(), saveable: false });
      });
    }, () => {
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).set(sortedTableTask).then(() => {
        this.setState({ isOpenSaveSnackbar: true, loading: false, lastSaveTime: util.getCrrentTimeObj(), saveable: false });
      });
    });
  }

  addTask() {
    if (this.state.isHotMode) this.taskTable.addTask();
  }

  handleTabChange(event, tab) {
    this.setState({ tab, isOpenDashboard: true });
    setTimeout(() => this.forceUpdate());
  }

  handleSaveable(saveable) {
    this.setState({ saveable });
  }

  handleTableTasks(tableTasks) {
    if (this.state.isHotMode) this.bindOpenTasksProcessing(tableTasks);
    this.setState({ tableTasks });
  }

  fireShortcut(e) {
    if (constants.shortcuts.NEXTDATE(e) || constants.shortcuts.PREVDATE(e)) {
      // 基準日を変更
      if (this.state.saveable && !window.confirm('保存していない内容があります。')) return false;
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
      this.setState({ date: moment(this.state.date).add(constants.shortcuts.NEXTDATE(e) ? 1 : -1, 'day').format(constants.DATEFMT) });
      setTimeout(() => { this.initTableTask(); });
    } else if (constants.shortcuts.SAVE(e)) {
      e.preventDefault();
      this.saveTableTasks();
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      this.props.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.toggleDashboard();
    }
    return false;
  }
  // 開始しているタスクを見つけ、経過時間をタイトルに反映する
  bindOpenTasksProcessing(tasks) {
    const openTask = tasks.find(hotTask => hotTask.length !== 0 && hotTask.startTime && hotTask.endTime === '');
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    if (util.isToday(this.state.date) && openTask) {
      this.setState({ hasOpenTask: true });
      this.bindOpenTaskIntervalID = setInterval(() => {
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, moment().format(constants.TIMEFMT));
        // 1分に一度タイトルが書き変わったタイミングでセルの色を書き換える必要があるので再描画する。
        if (newTimeDiffMinute !== this.oldTimeDiffMinute) {
          if (this.state.isHotMode) {
            // hotmodeの場合はレンダーする
            this.taskTable.renderHot();
          } else {
            // モバイルの場合は再描画する
            this.forceUpdate();
          }
        }
        if (newTimeDiffMinute === -1) {
          // 開始まで秒単位でカウントダウンする場合
          document.title = `${(moment().format('ss') - 60) * -1}秒後 - ${openTask.title || '無名タスク'}`;
        } else if (newTimeDiffMinute === 0) {
          document.title = `${moment().format('ss')}秒 - ${openTask.title || '無名タスク'}`;
        } else {
          document.title = `${newTimeDiffMinute > 0 ? `${newTimeDiffMinute}分` : `${newTimeDiffMinute * -1}分後`} - ${openTask.title || '無名タスク'}`;
        }
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    } else {
      this.setState({ hasOpenTask: false });
      this.bindOpenTaskIntervalID = '';
      document.title = constants.TITLE;
    }
  }

  attachTableTasks() {
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).on('value', (snapshot) => {
      this.setState({ loading: true });
      if (snapshot.exists() && snapshot.val() && !util.equal(this.state.tableTasks, snapshot.val())) {
        // サーバーにタスクが存在した場合 かつ、サーバーから配信されたデータが自分のデータと違う場合、サーバーのデータでテーブルを初期化する
        this.resetTable(snapshot.val());
      }
      this.setState({ saveable: false, loading: false });
    });
  }

  attachPoolTasks() {
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).on('value', (snapshot) => {
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

  resetTable(tableTasks) {
    const sortedTableTask = util.getSortedTasks(tableTasks);
    if (this.state.isHotMode) this.taskTable.setDataForHot(sortedTableTask);
    this.handleTableTasks(sortedTableTask);
    return sortedTableTask;
  }

  fireScript(data, scriptType = 'exportScript') {
    return new Promise((resolve, reject) => {
      // スクリプトを発火するのは本日のタスクテーブルのみ
      if (!util.isToday(this.state.date)) {
        reject();
        return;
      }
      this.setState({ isOpenScriptSnackbar: false });
      firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).once('value').then((snapshot) => {
        if (snapshot.exists() && snapshot.val() !== '') {
          const script = snapshot.val();
          util.runWorker(script, data,
            (result) => {
              this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText: `${scriptType}を実行しました。` });
              resolve(result);
            },
            (reason) => {
              const scriptSnackbarText = reason ? `エラー[${scriptType}]：${reason}` : `${scriptType}を実行しましたがpostMessageの引数に問題があるため処理を中断しました。`;
              this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText });
              reject();
            },
          );
        } else {
          reject();
        }
      });
    });
  }

  initTableTask() {
    this.setState({ loading: true });
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).once('value').then((snapshot) => {
      if (snapshot.exists() && !util.equal(snapshot.val(), [])) {
        this.fireScript(snapshot.val(), 'importScript').then((data) => { this.resetTable(data); }, () => { this.resetTable(snapshot.val()); });
      } else if (this.state.poolTasks.regularTasks.length !== 0 && moment(this.state.date, constants.DATEFMT).isAfter(moment().subtract(1, 'days'))) {
        // 定期タスクをテーブルに設定する処理。本日以降しか動作しない
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.getDayOfWeekStr(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.getDayOfWeekStr(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        this.fireScript(regularTasks, 'importScript').then((data) => { this.resetTable(data); }, () => { this.resetTable(regularTasks); });
      } else {
        // サーバーにデータが無く、定期タスクも登録されていない場合
        this.fireScript([], 'importScript').then((data) => { this.resetTable(data); }, () => { this.resetTable([]); });
      }
      this.setState({ saveable: false, loading: false });
      // 同期を開始
      setTimeout(() => {
        this.attachTableTasks();
      });
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
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
      this.setState({ date });
      setTimeout(() => {
        if (this.state.isHotMode) this.taskTable.updateIsToday();
        this.initTableTask();
      });
    }
  }

  toggleDashboard() {
    this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
  }

  closeSnackbars() {
    this.setState({ isOpenSaveSnackbar: false, isOpenScriptSnackbar: false });
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={0} className={classes.root} style={{ paddingTop: theme.mixins.toolbar.minHeight }}>
        <Grid item xs={12}>
          <ExpansionPanel expanded={this.state.isOpenDashboard} style={{ margin: 0 }} elevation={1}>
            <ExpansionPanelSummary expandIcon={<div style={{ width: '100vw' }} onClick={this.toggleDashboard.bind(this)}><i className="fa fa-angle-down fa-lg" /></div>}>
              <Tabs value={this.state.tab} onChange={this.handleTabChange.bind(this)} scrollable={false} scrollButtons="off" indicatorColor={constants.brandColor.light.BLUE} >
                <Tab label={<span><i className="fa fa-tachometer fa-lg" />ダッシュボード</span>} />
                <Tab label={<span><i className="fa fa-tasks fa-lg" />タスクプール</span>} />
              </Tabs>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ display: 'block', padding: 0 }} >
              {this.state.tab === 0 && <div><Dashboard tableTasks={this.state.tableTasks} /></div>}
              {this.state.tab === 1 && <div><TaskPool poolTasks={this.state.poolTasks} changePoolTasks={this.changePoolTasks.bind(this)} /></div>}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Paper elevation={1}>
            <TableCtl
              tableTasks={this.state.tableTasks}
              hasOpenTask={this.state.hasOpenTask}
              date={this.state.date}
              isLoading={this.state.loading}
              lastSaveTime={this.state.lastSaveTime}
              saveable={this.state.saveable}
              changeDate={this.changeDate.bind(this)}
              saveTableTasks={this.saveTableTasks.bind(this)}
            />
            {(() => {
              if (this.state.isHotMode) {
                return (<TaskTable
                    onRef={ref => (this.taskTable = ref)} // eslint-disable-line
                  tableTasks={this.state.tableTasks}
                  addTask={this.addTask.bind(this)}
                  handleTableTasks={this.handleTableTasks.bind(this)}
                  handleSaveable={this.handleSaveable.bind(this)}
                  isToday={util.isToday(this.state.date)}
                  moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
                />);
              } return (<TaskTableMobile
                tableTasks={this.state.tableTasks}
                changeTableTasks={this.changeTableTasksByMobile.bind(this)}
                isToday={util.isToday(this.state.date)}
              />);
            })()}
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSaveSnackbar}
          onClose={this.closeSnackbars.bind(this)}
          message={'保存しました。'}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.isOpenScriptSnackbar}
          onClose={this.closeSnackbars.bind(this)}
          message={this.state.scriptSnackbarText}
        />
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
