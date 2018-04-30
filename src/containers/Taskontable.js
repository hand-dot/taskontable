import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import debounce from 'lodash.debounce';

import Tabs, { Tab } from 'material-ui/Tabs';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
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
import Members from '../components/Members';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';

import constants from '../constants';
import tasksUtil from '../tasksUtil';
import util from '../util';

const styles = {
  root: {
    width: constants.APPWIDTH,
    margin: '0 auto',
  },
};

const database = firebase.database();

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.saveTableTasks = debounce(this.saveTableTasks, constants.REQEST_DELAY);
    this.savePoolTasks = debounce(this.savePoolTasks, constants.REQEST_DELAY);
    this.saveMemo = debounce(this.saveMemo, constants.REQEST_DELAY);
    this.attachTableTasks = debounce(this.attachTableTasks, constants.REQEST_DELAY);
    this.attachMemo = debounce(this.attachMemo, constants.REQEST_DELAY);
    this.state = {
      mode: '', // teams or users
      id: '',
      members: [],
      isOpenSnackbar: false,
      snackbarText: '',
      isMobile: util.isMobile(),
      saveable: false,
      tab: 0,
      isOpenDashboard: false,
      date: moment().format(constants.DATEFMT),
      lastSaveTime: moment().format(constants.TIMEFMT),
      tableTasks: [],
      poolTasks: {
        highPriorityTasks: [],
        lowPriorityTasks: [],
        regularTasks: [],
      },
      memo: '',
      importScript: '',
      exportScript: '',
    };
  }

  componentWillMount() {
    // urlのidから保存先を決定する
    if (this.props.match.params.id === this.props.userId) {
      this.setState({ mode: 'users', id: this.props.userId });
    } else {
      database.ref(`/teams/${this.props.match.params.id}/users/`).once('value').then((snapshot) => {
        if (snapshot.exists() && snapshot.val() !== []) {
          const promises = snapshot.val().map(uid => database.ref(`/users/${uid}/settings/`).once('value'));
          Promise.all(promises).then((members) => {
            this.setState({ mode: 'teams', id: this.props.match.params.id, members: members.map(member => member.val()) });
          });
        }
      });
    }
    if (!this.state.isMobile) window.onkeydown = (e) => { this.fireShortcut(e); };
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
    this.fetchScripts().then(() => {
      // テーブルを同期開始&初期化
      this.attachTableTasks();
    });
    // タスクプールをサーバーと同期開始
    this.attachPoolTasks();
    // メモを同期開始
    this.attachMemo();
  }

  componentWillUnmount() {
    if (!this.state.isMobile) window.onkeydown = '';
    window.onbeforeunload = '';
    database.ref(`/${this.state.mode}/${this.state.id}/poolTasks`).off();
    database.ref(`/${this.state.mode}/${this.state.id}/tableTasks/${this.state.date}`).off();
    database.ref(`/${this.state.mode}/${this.state.id}/memos/${this.state.date}`).off();
  }
  /**
   * テーブルタスクを開始時刻順にソートしstateに設定します。
   * ソートしたテーブルタスクを返却します。
   * @param  {Array} tableTasks テーブルタスク
   */
  setSortedTableTasks(tableTasks) {
    const sortedTableTask = tasksUtil.getSortedTasks(tableTasks);
    if (!this.state.isMobile && this.taskTable) this.taskTable.setDataForHot(sortedTableTask);
    this.setState({ tableTasks: sortedTableTask });
    return sortedTableTask;
  }

  /**
   * モバイルのタスクテーブルを変更したときにここでハンドリングを行う
   * @param  {String} taskActionType 操作種別
   * @param  {any} value 値
   */
  changeTableTasksByMobile(taskActionType, value) {
    if (taskActionType === constants.taskActionType.ADD) {
      this.state.tableTasks.push(value);
    } else if (taskActionType === constants.taskActionType.EDIT) {
      const target = this.state.tableTasks;
      target[value.index] = value.task;
    } else if (taskActionType === constants.taskActionType.REMOVE) {
      this.state.tableTasks.splice(value, 1);
    } else if (taskActionType === constants.taskActionType.DOWN) {
      if (this.state.tableTasks.length === value + 1) return;
      const target = this.state.tableTasks;
      target.splice(value, 2, target[value + 1], target[value]);
    } else if (taskActionType === constants.taskActionType.UP) {
      if (value === 0) return;
      const target = this.state.tableTasks;
      target.splice(value - 1, 2, target[value], target[value - 1]);
    } else if (taskActionType === constants.taskActionType.BOTTOM) {
      if (this.state.tableTasks.length === value + 1) return;
      const target = this.state.tableTasks.splice(value, 1)[0];
      this.state.tableTasks.push(target);
    } else if (taskActionType === constants.taskActionType.TOP) {
      if (value === 0) return;
      const target = this.state.tableTasks.splice(value, 1)[0];
      this.state.tableTasks.unshift(target);
    } else if (taskActionType === constants.taskActionType.MOVE_POOL_HIGHPRIORITY || taskActionType === constants.taskActionType.MOVE_POOL_LOWPRIORITY) {
      const taskPoolType = taskActionType === constants.taskActionType.MOVE_POOL_HIGHPRIORITY ? constants.taskPoolType.HIGHPRIORITY : constants.taskPoolType.LOWPRIORITY;
      const removeTask = this.state.tableTasks.splice(value, 1)[0];
      setTimeout(() => { this.moveTableTaskToPoolTask(taskPoolType, removeTask); });
      return;
    }
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
    if (taskActionType === constants.taskActionType.ADD) {
      this.state.poolTasks[taskPoolType].push(util.setIdIfNotExist(value));
    } else if (taskActionType === constants.taskActionType.EDIT) {
      const target = this.state.poolTasks[taskPoolType];
      target[value.index] = value.task;
    } else if (taskActionType === constants.taskActionType.REMOVE) {
      this.state.poolTasks[taskPoolType].splice(value, 1);
    } else if (taskActionType === constants.taskActionType.DOWN) {
      if (this.state.poolTasks[taskPoolType].length === value + 1) return;
      const target = this.state.poolTasks[taskPoolType];
      target.splice(value, 2, target[value + 1], target[value]);
    } else if (taskActionType === constants.taskActionType.UP) {
      if (value === 0) return;
      const target = this.state.poolTasks[taskPoolType];
      target.splice(value - 1, 2, target[value], target[value - 1]);
    } else if (taskActionType === constants.taskActionType.BOTTOM) {
      if (this.state.poolTasks[taskPoolType].length === value + 1) return;
      const target = this.state.poolTasks[taskPoolType].splice(value, 1)[0];
      this.state.poolTasks[taskPoolType].push(target);
    } else if (taskActionType === constants.taskActionType.TOP) {
      if (value === 0) return;
      const target = this.state.poolTasks[taskPoolType].splice(value, 1)[0];
      this.state.poolTasks[taskPoolType].unshift(target);
    } else if (taskActionType === constants.taskActionType.MOVE_TABLE) {
      const tableTasks = util.cloneDeep(this.state.tableTasks);
      tableTasks.push(Object.assign({}, this.state.poolTasks[taskPoolType][value]));
      if (taskPoolType === constants.taskPoolType.HIGHPRIORITY ||
         taskPoolType === constants.taskPoolType.LOWPRIORITY) {
        this.state.poolTasks[taskPoolType].splice(value, 1);
      }
      // タスクプールからテーブルタスクに移動したら保存する
      this.setState({ tableTasks });
      if (!this.state.isMobile) this.taskTable.setDataForHot(tableTasks);
      setTimeout(() => { this.saveTableTasks(); });
    }
    setTimeout(() => this.savePoolTasks());
  }

  /**
   * stateのpoolTasksをサーバーに保存します。
   */
  savePoolTasks() {
    // IDの生成処理
    Object.keys(this.state.poolTasks).forEach((poolTaskKey) => {
      const poolTasks = this.state.poolTasks;
      poolTasks[poolTaskKey] = this.state.poolTasks[poolTaskKey].map(poolTask => util.setIdIfNotExist(poolTask));
    });
    if (this.state.poolTasks.regularTasks) {
      // regularTasksで保存する値のdayOfWeekが['日','月'...]になっているので変換
      // https://github.com/hand-dot/taskontable/issues/118
      const poolTasks = this.state.poolTasks;
      poolTasks.regularTasks = this.state.poolTasks.regularTasks.map((task) => {
        const copyTask = Object.assign({}, task);
        if (copyTask.dayOfWeek) {
          copyTask.dayOfWeek = copyTask.dayOfWeek.map(day => util.convertDayOfWeekFromString(day));
        }
        return copyTask;
      });
    }
    database.ref(`/${this.state.mode}/${this.state.id}/poolTasks`).set(this.state.poolTasks);
  }
  /**
   * stateのtableTasksとmemoをサーバーに保存します。
   */
  saveWorkSheet() {
    this.saveTableTasks();
    this.saveMemo();
  }

  /**
   * stateのtableTasksをサーバーに保存します。
   */
  saveTableTasks() {
    // IDを生成し無駄なプロパティを削除する。また、hotで並び変えられたデータを取得するために処理が入っている。
    const tableTasks = (!this.state.isMobile ? this.taskTable.getTasksIgnoreEmptyTaskAndProp() : this.state.tableTasks).map(tableTask => tasksUtil.deleteUselessTaskProp(util.setIdIfNotExist(tableTask)));
    // 開始時刻順に並び替える
    const sortedTableTask = this.setSortedTableTasks(tableTasks);
    this.fireScript(sortedTableTask, 'exportScript').then((data) => {
      database.ref(`/${this.state.mode}/${this.state.id}/tableTasks/${this.state.date}`).set(data).then(() => {
        this.setState({
          isOpenSnackbar: true,
          snackbarText: 'エクスポートスクリプトを実行し、保存しました。',
          lastSaveTime: moment().format(constants.TIMEFMT),
          saveable: false,
        });
      });
    }, () => {
      database.ref(`/${this.state.mode}/${this.state.id}/tableTasks/${this.state.date}`).set(sortedTableTask).then(() => {
        this.setState({
          isOpenSnackbar: true, snackbarText: '保存しました。', lastSaveTime: moment().format(constants.TIMEFMT), saveable: false,
        });
      });
    });
  }
  /**
   * stateのmemoをサーバーに保存します。
   */
  saveMemo() {
    database.ref(`/${this.state.mode}/${this.state.id}/memos/${this.state.date}`).set(this.state.memo);
  }

  /**
   * テーブルタスクを同期します。
   */
  attachTableTasks() {
    database.ref(`/${this.state.mode}/${this.state.id}/tableTasks/${this.state.date}`).on('value', (snapshot) => {
      if (snapshot.exists() && util.equal(this.state.tableTasks, snapshot.val())) {
        // 同期したがテーブルのデータと差分がなかった場合(自分の更新)
        this.setState({ saveable: false });
        return;
      }
      let tableTasks = [];
      // 初期化もしくは自分のテーブル以外の更新
      if (snapshot.exists() && !util.equal(snapshot.val(), [])) {
        // サーバーに保存されたデータが存在する場合
        tableTasks = snapshot.val();
      } else if (this.state.poolTasks.regularTasks.length !== 0 && moment(this.state.date, constants.DATEFMT).isAfter(moment().subtract(1, 'days'))) {
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合(定期タスクをテーブルに設定する処理。本日以降しか動作しない)
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.convertDayOfWeekToString(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.convertDayOfWeekToString(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        tableTasks = regularTasks;
      }
      this.fireScript(tableTasks, 'importScript').then(
        (data) => {
          this.setSortedTableTasks(data);
          this.setState({ isOpenSnackbar: true, snackbarText: 'インポートスクリプトを実行しました。' });
        },
        () => { this.setSortedTableTasks(tableTasks); },
      );
      this.setState({ saveable: false });
    });
  }
  /**
   * プールタスクを同期します。
   */
  attachPoolTasks() {
    database.ref(`/${this.state.mode}/${this.state.id}/poolTasks`).on('value', (snapshot) => {
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
   * プールタスクを同期します。
   */
  attachMemo() {
    database.ref(`/${this.state.mode}/${this.state.id}/memos/${this.state.date}`).on('value', (snapshot) => {
      const memo = snapshot.val();
      if (snapshot.exists() && memo) {
        if (this.state.memo !== memo) this.setState({ memo });
      } else {
        this.setState({ memo: '' });
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
      this.saveWorkSheet();
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      e.preventDefault();
      this.props.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
    }
    return false;
  }

  /**
   * スクリプトを取得します。
   */
  fetchScripts() {
    const scriptsPath = `/users/${this.props.userId}/scripts/`;
    const promises = [database.ref(`${scriptsPath}importScript`).once('value'), database.ref(`${scriptsPath}exportScript`).once('value')];
    return Promise.all(promises).then((snapshots) => {
      const [importScriptSnapshot, exportScriptSnapshot] = snapshots;
      if (importScriptSnapshot.exists() && importScriptSnapshot.val() !== '') {
        this.setState({ importScript: importScriptSnapshot.val() });
      }
      if (exportScriptSnapshot.exists() && exportScriptSnapshot.val() !== '') {
        this.setState({ exportScript: exportScriptSnapshot.val() });
      }
    });
  }

  /**
   * 処理データに対してstateのインポートスクリプトorエクスポートスクリプトで処理を実行します。
   * @param  {} data 処理データ
   * @param  {} scriptType='exportScript' スクリプト種別(インポートスクリプトorエクスポートスクリプト)
   */
  fireScript(data, scriptType = 'exportScript') {
    const script = scriptType === 'exportScript' ? this.state.exportScript : this.state.importScript;
    return new Promise((resolve, reject) => {
      if (script === '' || !util.isToday(this.state.date)) {
        reject();
        return;
      }
      // スクリプトを発火するのはスクリプトが存在する かつ 本日のタスクテーブルのみ
      util.runWorker(script, data).then((result) => { resolve(result); }, () => { reject(); });
    });
  }

  /**
   * 日付の変更を行います。
   * 同期を解除し、テーブルを初期化します。
   * @param  {String} newDate 変更する日付(constants.DATEFMT)
   */
  changeDate(newDate) {
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      database.ref(`/${this.state.mode}/${this.state.id}/tableTasks/${this.state.date}`).off();
      database.ref(`/${this.state.mode}/${this.state.id}/memos/${this.state.date}`).off();
      this.setState({ date: newDate });
      if (!this.state.isMobile) {
        this.taskTable.updateIsActive(util.isToday(newDate));
        this.taskTable.setDataForHot([{
          id: '', title: 'loading...', estimate: '0', startTime: '', endTime: '', memo: 'please wait...',
        }]);
      }
      setTimeout(() => { this.attachTableTasks(); this.attachMemo(); });
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
                  this.setState({ tab, isOpenDashboard: !(this.state.isOpenDashboard && this.state.tab === tab) });
                  setTimeout(() => this.forceUpdate());
                }}
                scrollable={false}
                scrollButtons="off"
                indicatorColor="primary"
              >
                <Tab label={<span><i style={{ marginRight: '0.5em' }} className="fa fa-tachometer fa-lg" />ダッシュボード</span>} />
                <Tab label={<span><i style={{ marginRight: '0.5em' }} className="fa fa-tasks fa-lg" />タスクプール</span>} />
                {this.state.mode === 'teams' && (
                  <Tab label={<span><i style={{ marginRight: '0.5em' }} className="fa fa-users fa-lg" />メンバー</span>} />
                )}
              </Tabs>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ display: 'block', padding: 0 }} >
              {this.state.tab === 0 && <div><Dashboard tableTasks={this.state.tableTasks} /></div>}
              {this.state.tab === 1 && <div><TaskPool poolTasks={this.state.poolTasks} changePoolTasks={this.changePoolTasks.bind(this)} /></div>}
              {this.state.tab === 2 && <div><Members members={this.state.members} /></div>}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Paper elevation={1}>
            <TableCtl
              tableTasks={this.state.tableTasks}
              date={this.state.date}
              lastSaveTime={this.state.lastSaveTime}
              saveable={this.state.saveable}
              changeDate={this.changeDate.bind(this)}
              saveWorkSheet={this.saveWorkSheet.bind(this)}
            />
            {(() => {
              if (this.state.isMobile) {
                return (<TaskTableMobile
                  tableTasks={this.state.tableTasks}
                  changeTableTasks={this.changeTableTasksByMobile.bind(this)}
                  isActive={util.isToday(this.state.date)}
                />);
              }
              return (<TaskTable
                onRef={ref => (this.taskTable = ref)} // eslint-disable-line
                tableTasks={this.state.tableTasks}
                handleTableTasks={(newTableTasks) => {
                  this.setState({ tableTasks: newTableTasks });
                }}
                handleSaveable={(newVal) => { this.setState({ saveable: newVal }); }}
                isActive={util.isToday(this.state.date)}
                moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
              />);
            })()}
            <Divider />
            <TextField
              fullWidth
              InputProps={{ style: { fontSize: 13 } }}
              onChange={(e) => { this.setState({ memo: e.target.value, saveable: true }); }}
              value={this.state.memo}
              label={`${this.state.date}のメモ`}
              multiline
              margin="normal"
            />
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          message={this.state.snackbarText}
        />
      </Grid>
    );
  }
}

Taskontable.propTypes = {
  userId: PropTypes.string.isRequired,
  toggleHelpDialog: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Taskontable);
