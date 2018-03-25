import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import debounce from 'lodash.debounce';

import Tabs, { Tab } from 'material-ui/Tabs';
import IconButton from 'material-ui/IconButton';
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
import openTaskSchema from '../schemas/openTaskSchema';
import util from '../util';

const styles = theme => ({
  root: {
    width: constants.APPWIDTH,
    margin: '0 auto',
  },
});

function getOpenTaskSchema() {
  return util.cloneDeep(openTaskSchema);
}

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.saveTableTasks = debounce(this.saveTableTasks, constants.REQEST_DELAY);
    this.savePoolTasks = debounce(this.savePoolTasks, constants.REQEST_DELAY);
    this.attachTableTasks = debounce(this.attachTableTasks, constants.REQEST_DELAY);
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
      openTask: getOpenTaskSchema(),
      isOpenDashboard: true,
      date: moment().format(constants.DATEFMT),
      lastSaveTime: moment().format(constants.TIMEFMT),
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
      return null;
    };
  }

  componentDidMount() {
    if ('Notification' in window && Notification.permission !== 'granted') Notification.requestPermission();
    // タスクプールをサーバーと同期開始
    this.attachPoolTasks();
    // テーブルを同期開始&初期化
    this.attachTableTasks();
  }

  componentWillUnmount() {
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    document.title = constants.TITLE;
    window.onkeydown = '';
    window.onbeforeunload = '';
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).off();
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
  }
  /**
   * テーブルタスクを開始時刻順にソートしstateに設定します。
   * ソートしたテーブルタスクを返却します。
   * @param  {Array} tableTasks テーブルタスク
   */
  setSortedTableTasks(tableTasks) {
    const sortedTableTask = util.getSortedTasks(tableTasks);
    if (this.state.isHotMode) {
      this.taskTable.setDataForHot(sortedTableTask);
      this.bindOpenTaskProcessing(sortedTableTask);
    }
    this.setState({ tableTasks: sortedTableTask });
    return sortedTableTask;
  }

  /**
   * モバイルのタスクテーブルを変更したときにここでハンドリングを行う
   * @param  {String} taskActionType 操作種別
   * @param  {any} value 値
   */
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
      const removeTask = tableTasks.splice(value, 1)[0];
      this.setState({ tableTasks });
      setTimeout(() => { this.moveTableTaskToPoolTask(taskPoolType, removeTask); });
      return;
    }
    this.setState({ tableTasks, saveable: this.state.saveable ? true : !util.equal(tableTasks, this.state.tableTasks) });
    setTimeout(() => { this.saveTableTasks(); });
  }

  /**
   * テーブルタスクをプールタスクに移動します。
   * @param  {String} taskPoolType プールタスクのタイプ(constants.taskPoolType)
   * @param  {Object} task タスク
   */
  moveTableTaskToPoolTask(taskPoolType, task) {
    const willPooltask = util.cloneDeep(task);
    willPooltask.startTime = '';
    willPooltask.endTime = '';
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].push(willPooltask);
    this.setState({ poolTasks });
    // テーブルタスクからタスクプールに移動したら保存する
    setTimeout(() => { this.saveTableTasks(); this.savePoolTasks(); });
  }

  /**
   * タスクプールを変更したときにここでハンドリングを行う
   * @param  {String} taskActionType 操作種別
   * @param  {any} value 値
   */
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
      if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
         taskPoolType === constants.taskPoolType.LOWPRIORITY) {
        poolTasks[taskPoolType].splice(value, 1);
      }
      // タスクプールからテーブルタスクに移動したら保存する
      this.setState({ tableTasks });
      if (this.state.isHotMode) this.taskTable.setDataForHot(tableTasks);
      setTimeout(() => { this.saveTableTasks(); });
    }
    this.setState({ poolTasks });
    setTimeout(() => this.savePoolTasks());
  }

  /**
   * stateのpoolTasksをサーバーに保存します。
   */
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
          copyTask.dayOfWeek = copyTask.dayOfWeek.map(day => util.convertDayOfWeekFromString(day));
        }
        return copyTask;
      });
    }
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).set(poolTasks);
  }
  /**
   * stateのtableTasksをサーバーに保存します。
   */
  saveTableTasks() {
    // IDを生成し並び変えられたデータを取得するために処理が入っている。
    const tableTasks = (this.state.isHotMode ? this.taskTable.getTasksIgnoreEmptyTaskAndProp() : this.state.tableTasks).map(tableTask => util.setIdIfNotExist(tableTask));
    // 開始時刻順に並び替える
    const sortedTableTask = this.setSortedTableTasks(tableTasks);
    this.setState({ loading: true });
    this.fireScript(sortedTableTask, 'exportScript').then((data) => {
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).set(data).then(() => {
        this.setState({ isOpenSaveSnackbar: true, loading: false, lastSaveTime: moment().format(constants.TIMEFMT), saveable: false });
      });
    }, () => {
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).set(sortedTableTask).then(() => {
        this.setState({ isOpenSaveSnackbar: true, loading: false, lastSaveTime: moment().format(constants.TIMEFMT), saveable: false });
      });
    });
  }

  /**
   * 開始しているタスクを見つけ、経過時間をタイトルに反映する
   * @param  {Array} tasks タスクの配列
   */
  bindOpenTaskProcessing(tasks) {
    if (!this.state.isHotMode) return;
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    const openTask = util.cloneDeep(tasks.find(task => task.startTime && task.endTime === '' && task.estimate));
    if (util.isToday(this.state.date) && openTask) {
      this.bindOpenTaskIntervalID = setInterval(() => {
        const now = moment();
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, now.format(constants.TIMEFMT));
        // 1分に一度タイトルが書き変わったタイミングでセルの色を書き換える必要があるので再描画する。
        if (newTimeDiffMinute !== this.oldTimeDiffMinute) this.taskTable.renderHot();
        if (newTimeDiffMinute >= 0) {
          openTask.now = now.format('HH:mm:ss');
          this.setState({ openTask: util.setIdIfNotExist(openTask) });
          document.title = `${newTimeDiffMinute === 0 ? `${now.format('ss')}秒` : `${newTimeDiffMinute}分経過`} - ${openTask.title || '無名タスク'}`;
        } else {
          document.title = constants.TITLE;
          if (!util.equal(this.state.openTask, openTaskSchema)) this.setState({ openTask: getOpenTaskSchema() });
        }
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    } else {
      this.bindOpenTaskIntervalID = '';
      document.title = constants.TITLE;
      if (!util.equal(this.state.openTask, openTaskSchema)) this.setState({ openTask: getOpenTaskSchema() });
    }
  }
  /**
   * テーブルタスクを同期します。
   */
  attachTableTasks() {
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).on('value', (snapshot) => {
      this.setState({ loading: true });
      if (snapshot.exists() && util.equal(this.state.tableTasks, snapshot.val())) {
        // 同期したがテーブルのデータと差分がなかった場合(自分の更新)
        this.setState({ saveable: false, loading: false });
        return;
      }
      // 下記初期化もしくは自分のテーブル以外の更新
      if (snapshot.exists() && !util.equal(snapshot.val(), [])) {
        // サーバーに保存されたデータが存在する場合
        this.fireScript(snapshot.val(), 'importScript').then((data) => { this.setSortedTableTasks(data); }, () => { this.setSortedTableTasks(snapshot.val()); });
      } else if (this.state.poolTasks.regularTasks.length !== 0 && moment(this.state.date, constants.DATEFMT).isAfter(moment().subtract(1, 'days'))) {
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合(定期タスクをテーブルに設定する処理。本日以降しか動作しない)
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.convertDayOfWeekToString(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.convertDayOfWeekToString(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        this.fireScript(regularTasks, 'importScript').then((data) => { this.setSortedTableTasks(data); }, () => { this.setSortedTableTasks(regularTasks); });
      } else {
        // サーバーにデータが無く、定期タスクも登録されていない場合
        this.fireScript([], 'importScript').then((data) => { this.setSortedTableTasks(data); }, () => { this.setSortedTableTasks([]); });
      }
      this.setState({ saveable: false, loading: false });
    });
  }
  /**
   * プールタスクを同期します。
   */
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
              copyTask.dayOfWeek = poolTasks.regularTasks[index].dayOfWeek.map(d => util.convertDayOfWeekToString(d));
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

  /**
   * ショートカットを実行します。
   * @param  {} e イベント
   */
  fireShortcut(e) {
    if (constants.shortcuts.NEXTDATE(e) || constants.shortcuts.PREVDATE(e)) {
      // 基準日を変更
      if (this.state.saveable && !window.confirm('保存していない内容があります。')) return false;
      const newDate = moment(this.state.date).add(constants.shortcuts.NEXTDATE(e) ? 1 : -1, 'day').format(constants.DATEFMT);
      setTimeout(() => this.changeDate(newDate));
    } else if (constants.shortcuts.SAVE(e)) {
      e.preventDefault();
      this.saveTableTasks();
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      this.props.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
    }
    return false;
  }

  /**
   * スクリプトを取得し、処理データに対してwokerで処理を実行します。
   * @param  {} data 処理データ
   * @param  {} scriptType='exportScript' スクリプト種別(インポートスクリプトorエクスポートスクリプト)
   */
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
          util.runWorker(script, data).then((result) => {
            this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText: `${scriptType}を実行しました。` });
            resolve(result);
          },
          (reason) => {
            const scriptSnackbarText = reason ? `エラー[${scriptType}]：${reason}` : `${scriptType}を実行しましたがpostMessageの引数に問題があるため処理を中断しました。`;
            this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText });
            reject();
          });
        } else {
          reject();
        }
      });
    });
  }

  /**
   * 日付の変更を行います。
   * 同期を解除し、テーブルを初期化します。
   * @param  {String} newDate 変更する日付(constants.DATEFMT)
   */
  changeDate(newDate) {
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
      this.setState({ date: newDate });
      if (this.state.isHotMode) this.taskTable.updateIsToday(util.isToday(newDate));
      setTimeout(() => { this.attachTableTasks(); });
    }
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={0} className={classes.root} style={{ paddingTop: theme.mixins.toolbar.minHeight }}>
        <Grid item xs={12}>
          <ExpansionPanel expanded={this.state.isOpenDashboard} style={{ margin: 0 }} elevation={1}>
            <ExpansionPanelSummary expandIcon={<IconButton onClick={() => { this.setState({ isOpenDashboard: !this.state.isOpenDashboard }); }}><i className="fa fa-angle-down fa-lg" /></IconButton>}>
              <Tabs
                value={this.state.tab}
                onChange={(e, tab) => {
                  this.setState({ tab, isOpenDashboard: true });
                  setTimeout(() => this.forceUpdate());
                }}
                scrollable={false}
                scrollButtons="off"
                indicatorColor={constants.brandColor.light.BLUE}
              >
                <Tab label={<span><i style={{ marginRight: '0.5em' }} className="fa fa-tachometer fa-lg" />ダッシュボード</span>} />
                <Tab label={<span><i style={{ marginRight: '0.5em' }} className="fa fa-tasks fa-lg" />タスクプール</span>} />
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
              openTask={this.state.openTask}
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
                  handleTableTasks={(newTableTasks) => {
                    this.bindOpenTaskProcessing(newTableTasks);
                    this.setState({ tableTasks: newTableTasks });
                  }}
                  handleSaveable={(newVal) => { this.setState({ saveable: newVal }); }}
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
          onClose={() => { this.setState({ isOpenSaveSnackbar: false, isOpenScriptSnackbar: false }); }}
          message={'保存しました。'}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.isOpenScriptSnackbar}
          onClose={() => { this.setState({ isOpenSaveSnackbar: false, isOpenScriptSnackbar: false }); }}
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
