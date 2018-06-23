import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter, Link } from 'react-router-dom';
import moment from 'moment';
import debounce from 'lodash.debounce';
import localforage from 'localforage';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Snackbar from '@material-ui/core/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import ExpandMore from '@material-ui/icons/ExpandMore';
import People from '@material-ui/icons/People';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import AvTimer from '@material-ui/icons/AvTimer';
import Close from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Person from '@material-ui/icons/Person';
import Lock from '@material-ui/icons/Lock';
import LockOpen from '@material-ui/icons/LockOpen';
import Power from '@material-ui/icons/Power';
import ShowChart from '@material-ui/icons/ShowChart';

import Dashboard from '../components/Dashboard';
import TableCtl from '../components/TableCtl';
import TaskPool from '../components/TaskPool';
import Members from '../components/Members';
import OpenRange from '../components/OpenRange';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';

import constants from '../constants';
import tasksUtil from '../tasksUtil';
import util from '../util';

const database = util.getDatabase();

const styles = {
  root: {
    width: '100%',
    margin: '0 auto',
  },
  link: {
    textDecoration: 'none',
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
  expansionPanelSummary: {
    marginBottom: 3,
  },
};

class WorkSheet extends Component {
  constructor(props) {
    super(props);
    this.saveWorkSheet = debounce(this.saveWorkSheet, constants.REQEST_DELAY_FAST);
    this.attachTableTasks = debounce(this.attachTableTasks, constants.REQEST_DELAY_FAST);
    this.attachMemo = debounce(this.attachMemo, constants.REQEST_DELAY_FAST);
    this.state = {
      worksheetId: '',
      worksheetOpenRange: '', // public or private
      worksheetName: '',
      members: [],
      invitedEmails: [],
      isOpenSnackbar: false,
      snackbarText: '',
      isMobile: util.isMobile(),
      readOnly: true,
      saveable: false,
      tab: 0,
      isOpenDashboard: false,
      date: moment().format(constants.DATEFMT),
      savedAt: moment().format(constants.TIMEFMT),
      taskTableFilterBy: '',
      tableTasks: [],
      poolTasks: {
        highPriorityTasks: [],
        lowPriorityTasks: [],
        regularTasks: [],
      },
      memo: '',
      importScript: '',
      exportScript: '',
      isSyncedTableTasks: false,
      isOpenReceiveMessage: false,
      receiveMessage: {
        body: '',
        icon: '',
      },
    };
  }

  componentWillMount() {
    const worksheetId = encodeURI(this.props.match.params.id);
    if (worksheetId === 'index.html') {
      this.props.history.push('/');
      return;
    }
    Promise.all([
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/invitedEmails/`).once('value'),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members/`).once('value'),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/name/`).once('value'),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/openRange/`).once('value'),
    ]).then((snapshots) => {
      const [invitedEmails, memberIds, worksheetName, worksheetOpenRange] = snapshots;
      if (!worksheetOpenRange.exists()) {
        // 公開範囲が存在しない(そもそもワークシートが存在しない)ワークシートには参加できない
        this.props.history.push('/');
        return;
      } else if (worksheetOpenRange.val() === constants.worksheetOpenRange.PRIVATE && (!memberIds.exists() || !memberIds.val().includes(this.props.userId))) {
        // 自分がいないプライベートワークシートには参加できない
        this.props.history.push('/');
        return;
      }
      if (memberIds.exists() && memberIds.val() !== [] && worksheetName.exists() && worksheetName.val() !== '') { // メンバーの情報を取得する処理
        Promise.all(memberIds.val().map(uid => database.ref(`/${constants.API_VERSION}/users/${uid}/settings/`).once('value'))).then((members) => {
          this.setState({
            readOnly: !memberIds.val().includes(this.props.userId),
            worksheetId,
            worksheetOpenRange: worksheetOpenRange.exists() ? worksheetOpenRange.val() : constants.worksheetOpenRange.PUBLIC,
            worksheetName: worksheetName.exists() ? worksheetName.val() : 'Unknown',
            members: members.filter(member => member.exists()).map(member => member.val()),
            invitedEmails: invitedEmails.exists() ? invitedEmails.val() : [],
          });
          this.fetchScripts().then(() => { this.syncWorkSheet(); });
        });
      } else {
        // メンバーがいないワークシートには遷移できない
        this.props.history.push('/');
      }
    });
    // 消えてしまった通知を取得する処理。
    this.getRecentMessage(worksheetId);
    window.onfocus = () => { this.getRecentMessage(worksheetId); };

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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userId) {
      database.ref(`/${constants.API_VERSION}/worksheets/${encodeURI(this.props.match.params.id)}/members/`).once('value').then((userIds) => {
        if (userIds.exists() && userIds.val() !== []) {
          this.setState({ readOnly: !userIds.val().includes(this.props.userId) });
        }
      });
    }
  }

  componentWillUnmount() {
    if (!this.state.isMobile) window.onkeydown = '';
    window.onbeforeunload = '';
    window.onfocus = '';
    database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/poolTasks`).off();
    database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).off();
    database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/memos/${this.state.date}`).off();
  }

  getRecentMessage(worksheetId) {
    return localforage.getItem(`recentMessage.${worksheetId}`).then((message) => {
      if (message) {
        // メッセージが作成された時間が本日だったら時刻を出すが、本日のメッセージじゃなかったら日付+時刻を出す
        const createdDateStr = moment(message.createdAt).format(constants.DATEFMT);
        const createdTimeStr = moment(message.createdAt).format(constants.TIMEFMT);
        const createdAt = util.isToday(createdDateStr) ? createdTimeStr : `${createdDateStr}-${createdTimeStr}`;
        this.setState({
          isOpenReceiveMessage: true,
          receiveMessage: {
            body: `${message.body} (${createdAt})`,
            icon: message.icon,
          },
        });
      }
      return Promise.resolve();
    }).then(() => localforage.removeItem(`recentMessage.${worksheetId}`)).catch((err) => {
      throw new Error(`消えてしまった通知の取得に失敗しました:${err}`);
    });
  }

  /**
   * テーブルタスクを開始時刻順にソートしstateに設定します。
   * ソートしたテーブルタスクを返却します。
   * @param  {Array} tableTasks テーブルタスク
   */
  setSortedTableTasks(tableTasks) {
    const sortedTableTask = tasksUtil.getSortedTasks(tableTasks);
    if (!this.state.isMobile && this.taskTable) this.taskTable.setDataForHot(this.state.taskTableFilterBy ? tasksUtil.getTasksByAssign(sortedTableTask, this.state.taskTableFilterBy) : sortedTableTask);
    this.setState({ tableTasks: sortedTableTask });
    return sortedTableTask;
  }


  getHotTaskIgnoreFilter(hotTasks) {
    const tableTasks = this.state.taskTableFilterBy ? tasksUtil.getTasksByNotAssign(this.state.tableTasks, this.state.taskTableFilterBy).concat(hotTasks) : hotTasks;
    return tableTasks.map(tableTask => util.setIdIfNotExist(tableTask)).filter((o1, i, self) => self.findIndex(o2 => o2.id === o1.id) === i);
  }

  /**
   * モバイルのワークシートを変更したときにここでハンドリングを行う
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
    setTimeout(() => {
      this.saveTableTasks().then((snackbarText) => {
        const savedAt = moment().format(constants.TIMEFMT);
        this.setState({
          isOpenSnackbar: true,
          snackbarText: `${snackbarText}テーブルタスクを保存しました。(${savedAt})`,
          savedAt,
          saveable: false,
        });
      });
    });
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
    setTimeout(() => {
      Promise.all([this.saveTableTasks(), this.savePoolTasks()]).then(() => {
        this.setState({
          isOpenSnackbar: true,
          snackbarText: 'テーブルタスクをタスクプールに移動しました。',
          savedAt: moment().format(constants.TIMEFMT),
          saveable: false,
        });
      });
    });
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
      // タスクプールからテーブルタスクに移動したらテーブルタスクを保存する
      this.setState({ tableTasks });
      if (!this.state.isMobile) this.taskTable.setDataForHot(this.state.taskTableFilterBy ? tasksUtil.getTasksByAssign(tableTasks, this.state.taskTableFilterBy) : tableTasks);
      setTimeout(() => { this.saveTableTasks(); });
    }
    setTimeout(() => {
      this.savePoolTasks().then(() => {
        this.setState({
          isOpenSnackbar: true,
          snackbarText: taskActionType === constants.taskActionType.MOVE_TABLE ? 'タスクプールからテーブルタスクに移動しました。' : 'タスクプールを保存しました。',
        });
      });
    });
  }

  /**
   * stateのpoolTasksをサーバーに保存します。
   */
  savePoolTasks() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: 'メンバーでないため編集が許可されていません。' });
      return Promise.resolve();
    }
    // IDの生成処理
    Object.keys(this.state.poolTasks).forEach((poolTaskKey) => {
      const { poolTasks } = this.state;
      poolTasks[poolTaskKey] = this.state.poolTasks[poolTaskKey].map(poolTask => util.setIdIfNotExist(poolTask));
    });
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/poolTasks`).set(this.state.poolTasks);
  }

  /**
   * stateのtableTasksとmemoをサーバーに保存します。
   */
  saveWorkSheet() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: 'メンバーでないため編集が許可されていません。' });
      return Promise.resolve();
    }
    return Promise.all([this.saveTableTasks(), this.saveMemo()]).then((snackbarTexts) => {
      const savedAt = moment().format(constants.TIMEFMT);
      this.setState({
        isOpenSnackbar: true,
        snackbarText: `${snackbarTexts[0]}ワークシートを保存しました。(${savedAt})`,
        savedAt,
        saveable: false,
      });
    });
  }

  /**
   * stateのtableTasksをサーバーに保存します。
   */
  saveTableTasks() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: 'メンバーでないため編集が許可されていません。' });
      return Promise.resolve();
    }
    // IDを生成し無駄なプロパティを削除する。また、hotで並び変えられたデータを取得するために処理が入っている。
    const tableTasks = !this.state.isMobile ? this.getHotTaskIgnoreFilter(this.taskTable.getTasksIgnoreEmptyTaskAndProp()) : this.state.tableTasks;
    // 開始時刻順に並び替える
    const sortedTableTask = this.setSortedTableTasks(tableTasks.map(tableTask => tasksUtil.deleteUselessTaskProp(tableTask)));
    return this.fireScript(sortedTableTask, 'exportScript')
      .then(
        data => database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).set(data)
          .then(() => 'エクスポートスクリプトを実行しました。(success) - '),
        reason => database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).set(sortedTableTask)
          .then(() => (reason ? `エクスポートスクリプトを実行しました。(error)：${reason} - ` : '')),
      );
  }
  /**
   * stateのmemoをサーバーに保存します。
   */
  saveMemo() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: 'メンバーでないため編集が許可されていません。' });
      return Promise.resolve();
    }
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/memos/${this.state.date}`).set(this.state.memo ? this.state.memo : null);
  }

  /**
   * WorkSheet全体の同期を開始します。
   */
  syncWorkSheet() {
    // テーブルを同期開始&初期化
    this.attachTableTasks();
    // タスクプールをサーバーと同期開始
    this.attachPoolTasks();
    // メモを同期開始
    this.attachMemo();
    // メンバー,招待中のメールアドレスを同期開始
    this.attachMembersAndInvitedEmails();
  }

  /**
   * テーブルタスクを同期します。
   */
  attachTableTasks() {
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).on('value', (snapshot) => {
      const prevTableTasks = (!this.state.isMobile ? this.getHotTaskIgnoreFilter(this.taskTable.getTasksIgnoreEmptyTaskAndProp()) : this.state.tableTasks);
      if (snapshot.exists() && util.equal(tasksUtil.getSortedTasks(prevTableTasks).map(tableTask => tasksUtil.deleteUselessTaskProp(tableTask)), snapshot.val())) {
        // 同期したがテーブルのデータと差分がなかった場合(自分の更新)
        this.setState({ saveable: false });
        return;
      }
      let snackbarText = '';
      let newTableTasks = [];
      // 初期化もしくは自分のテーブル以外の更新
      if (snapshot.exists() && !util.equal(snapshot.val(), [])) {
        // サーバーに保存されたデータが存在する場合
        const savedAt = moment().format(constants.TIMEFMT);
        if (this.state.isSyncedTableTasks) snackbarText = `テーブルが更新されました。(${savedAt})`; // ほかのユーザーの更新
        newTableTasks = snapshot.val();
      } else if (this.state.poolTasks.regularTasks.length !== 0 && moment(this.state.date, constants.DATEFMT).isAfter(moment().subtract(1, 'days'))) {
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合(定期タスクをテーブルに設定する処理。本日以降しか動作しない)
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        newTableTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === dayAndCount.day) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        if (newTableTasks.length !== 0) snackbarText = '定期タスクを読み込みました。';
      }
      this.fireScript(newTableTasks, 'importScript').then(
        (data) => {
          this.setSortedTableTasks(data);
          this.setState({ isSyncedTableTasks: true, isOpenSnackbar: true, snackbarText: `インポートスクリプトを実行しました。(success)${snackbarText ? ` - ${snackbarText}` : ''}` });
        },
        (reason) => {
          this.setSortedTableTasks(newTableTasks);
          if (reason) snackbarText = `インポートスクリプトを実行しました。(error)：${reason}${snackbarText ? ` - ${snackbarText}` : ''}`;
          this.setState({ isSyncedTableTasks: true, isOpenSnackbar: snackbarText !== '', snackbarText });
        },
      );
      this.setState({ saveable: false });
    });
  }
  /**
   * プールタスクを同期します。
   */
  attachPoolTasks() {
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/poolTasks`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const poolTasks = snapshot.val();
        const statePoolTasks = Object.assign({}, this.state.poolTasks);
        statePoolTasks.highPriorityTasks = poolTasks.highPriorityTasks ? poolTasks.highPriorityTasks : [];
        statePoolTasks.lowPriorityTasks = poolTasks.lowPriorityTasks ? poolTasks.lowPriorityTasks : [];
        statePoolTasks.regularTasks = poolTasks.regularTasks ? poolTasks.regularTasks : [];
        this.setState({
          poolTasks: statePoolTasks,
        });
      }
    });
  }
  /**
   * メモを同期します。
   */
  attachMemo() {
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/memos/${this.state.date}`).on('value', (snapshot) => {
      if (snapshot.exists() && snapshot.val()) {
        if (this.state.memo !== snapshot.val()) this.setState({ memo: snapshot.val() });
      } else {
        this.setState({ memo: '' });
      }
    });
  }
  /**
   * メンバー,招待中のメールアドレスを同期します。
   */
  attachMembersAndInvitedEmails() {
    return [
      database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/members`).on('value', (userIds) => {
        if (userIds.exists() && userIds.val() !== []) { // メンバーの情報を取得する処理
          return Promise.all(userIds.val().map(uid => database.ref(`/${constants.API_VERSION}/users/${uid}/settings/`).once('value'))).then((members) => {
            const memberSettings = members.filter(member => member.exists()).map(member => member.val());
            if (memberSettings !== []) {
              if (!util.equal(this.state.members, memberSettings)) this.setState({ members: memberSettings });
            } else {
              this.setState({ members: [] });
            }
          });
        }
        return Promise.resolve();
      }),
      database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/invitedEmails`).on('value', (invitedEmails) => {
        if (invitedEmails.exists() && invitedEmails.val() !== []) {
          if (this.state.invitedEmails !== invitedEmails.val()) this.setState({ invitedEmails: invitedEmails.val() });
        } else {
          this.setState({ invitedEmails: [] });
        }
      }),
    ];
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
    if (this.state.readOnly) return Promise.resolve();
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/scripts/enable`).once('value').then((snapshot) => {
      if (snapshot.exists() && snapshot.val()) return true;
      return false;
    }).then((enable) => {
      if (!enable) return Promise.resolve();
      const scriptsPath = `/worksheets/${this.state.worksheetId}/scripts/`;
      const promises = [database.ref(`/${constants.API_VERSION}${scriptsPath}importScript`).once('value'), database.ref(`/${constants.API_VERSION}${scriptsPath}exportScript`).once('value')];
      return Promise.all(promises).then((snapshots) => {
        const [importScriptSnapshot, exportScriptSnapshot] = snapshots;
        if (importScriptSnapshot.exists() && importScriptSnapshot.val() !== '') {
          this.setState({ importScript: importScriptSnapshot.val() });
        }
        if (exportScriptSnapshot.exists() && exportScriptSnapshot.val() !== '') {
          this.setState({ exportScript: exportScriptSnapshot.val() });
        }
      });
    });
  }

  /**
   * 処理データに対してstateのインポートスクリプトorエクスポートスクリプトで処理を実行します。
   * @param  {Array} data 処理データ
   * @param  {String} scriptType='exportScript' スクリプト種別(インポートスクリプトorエクスポートスクリプト)
   */
  fireScript(data, scriptType = 'exportScript') {
    const script = scriptType === 'exportScript' ? this.state.exportScript : this.state.importScript;
    return new Promise((resolve, reject) => {
      if (script === '' || !util.isToday(this.state.date)) {
        reject();
        return;
      }
      // スクリプトを発火するのはスクリプトが存在する かつ 本日のワークシートのみ
      util.runWorker(script, data).then((result) => { resolve(result); }, (reason) => { reject(reason); });
    });
  }

  /**
   * 日付の変更を行います。
   * 同期を解除し、テーブルを初期化します。
   * @param  {String} newDate 変更する日付(constants.DATEFMT)
   */
  changeDate(newDate) {
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).off();
      database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/memos/${this.state.date}`).off();
      this.setState({ date: newDate, isSyncedTableTasks: false });
      if (!this.state.isMobile) {
        this.taskTable.updateIsActive(util.isToday(newDate));
        this.taskTable.setDataForHot([{
          id: '', assign: '', title: 'loading...', estimate: '0', startTime: '', endTime: '', memo: 'please wait...',
        }]);
      }
      setTimeout(() => { this.attachTableTasks(); this.attachMemo(); });
    }
  }

  handleTab(e, tab) {
    // 0,1,2,3以外のタブはページ遷移
    if ([0, 1, 2, 3].includes(tab)) {
      this.setState({ tab, isOpenDashboard: !(this.state.isOpenDashboard && this.state.tab === tab) });
    }
  }

  handleMembers(newMembers) {
    this.setState({ members: newMembers });
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/members/`).set(newMembers.map(newMember => newMember.uid)).then(() => {
      this.setState({ isOpenSnackbar: true, snackbarText: 'メンバーを更新しました。' });
      return Promise.resolve();
    });
  }

  handleInvitedEmails(newEmails) {
    this.setState({ invitedEmails: newEmails });
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/invitedEmails/`).set(newEmails);
  }

  handleWorksheetOpenRange(worksheetOpenRange) {
    this.setState({ worksheetOpenRange });
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/openRange/`).set(worksheetOpenRange).then(() => {
      this.setState({ isOpenSnackbar: true, snackbarText: `公開範囲を${worksheetOpenRange === constants.worksheetOpenRange.PUBLIC ? '公開' : '非公開'}に設定しました。` });
      return Promise.resolve();
    });
  }


  render() {
    const {
      userId, classes, history, theme,
    } = this.props;
    return (
      <Grid container spacing={0} className={classes.root} style={{ padding: this.state.isMobile ? 0 : theme.spacing.unit, paddingTop: (this.state.isMobile ? 0 : 17) + theme.mixins.toolbar.minHeight }}>
        <Grid
          item
          xs={12}
          style={{
            padding: theme.spacing.unit * 2, backgroundColor: constants.brandColor.base.YELLOW, display: userId ? 'none' : 'block',
          }}
        >
          <Typography align="center" variant="title">
          👋{constants.TITLE}のアカウントはお持ちですか？<Link style={{ margin: theme.spacing.unit }} className={classes.link} to="/signup">アカウント作成</Link>または<Link style={{ margin: theme.spacing.unit }} className={classes.link} to="/">{constants.TITLE}について詳しくみる</Link>
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ExpansionPanel expanded={this.state.isOpenDashboard} style={{ margin: 0 }} elevation={1}>
            <ExpansionPanelSummary classes={{ content: classes.expansionPanelSummary }} expandIcon={<IconButton onClick={() => { this.setState({ isOpenDashboard: !this.state.isOpenDashboard }); }}><ExpandMore /></IconButton>}>
              <Tabs
                value={this.state.tab}
                onChange={this.handleTab.bind(this)}
                scrollable
                scrollButtons="off"
                indicatorColor="secondary"
              >
                <Tab label={<span><AvTimer style={{ fontSize: 16, marginRight: '0.5em' }} />ダッシュボード</span>} />
                <Tab disabled={this.state.readOnly} label={<span><FormatListBulleted style={{ fontSize: 16, marginRight: '0.5em' }} />タスクプール</span>} />
                <Tab disabled={this.state.readOnly} label={<span><People style={{ fontSize: 16, marginRight: '0.5em' }} />メンバー</span>} />
                <Tab disabled={this.state.readOnly} label={<span>{this.state.worksheetOpenRange === constants.worksheetOpenRange.PUBLIC ? <LockOpen style={{ fontSize: 16, marginRight: '0.5em' }} /> : <Lock style={{ fontSize: 16, marginRight: '0.5em' }} />}公開範囲</span>} />
                {!this.state.isMobile && (<Tab disabled={this.state.readOnly} onClick={() => { history.push(`/${this.state.worksheetId}/scripts`); }} label={<span><Power style={{ fontSize: 16, marginRight: '0.5em' }} />プラグイン(α版)</span>} />)}
                {!this.state.isMobile && (<Tab disabled={this.state.readOnly} onClick={() => { history.push(`/${this.state.worksheetId}/activity`); }} label={<span><ShowChart style={{ fontSize: 16, marginRight: '0.5em' }} />アクティビティ(α版)</span>} />)}
              </Tabs>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ display: 'block', padding: 0 }} >
              {this.state.tab === 0 && <div><Dashboard tableTasks={this.state.taskTableFilterBy ? tasksUtil.getTasksByAssign(this.state.tableTasks, this.state.taskTableFilterBy) : this.state.tableTasks} /></div>}
              {this.state.tab === 1 && <div><TaskPool userId={userId} poolTasks={this.state.poolTasks} members={this.state.members} changePoolTasks={this.changePoolTasks.bind(this)} /></div>}
              {this.state.tab === 2 && (
                <div style={{ overflow: 'auto' }}>
                  <Members
                    userId={userId}
                    userName={this.props.userName}
                    userPhotoURL={this.props.userPhotoURL}
                    worksheetId={this.state.worksheetId}
                    worksheetName={this.state.worksheetName}
                    members={this.state.members}
                    invitedEmails={this.state.invitedEmails}
                    handleMembers={this.handleMembers.bind(this)}
                    handleInvitedEmails={this.handleInvitedEmails.bind(this)}
                  />
                </div>
              )}
              {this.state.tab === 3 && (
                <div style={{ overflow: 'auto' }}>
                  <OpenRange
                    worksheetOpenRange={this.state.worksheetOpenRange}
                    handleWorksheetOpenRange={this.handleWorksheetOpenRange.bind(this)}
                  />
                </div>
              )}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Paper elevation={1}>
            <TableCtl
              userId={userId}
              taskTableFilterBy={this.state.taskTableFilterBy}
              members={this.state.members}
              tableTasks={this.state.tableTasks}
              date={this.state.date}
              savedAt={this.state.savedAt}
              saveable={Boolean(userId && this.state.saveable)}
              changeDate={this.changeDate.bind(this)}
              saveWorkSheet={this.saveWorkSheet.bind(this)}
              handleTaskTableFilter={(value) => { this.setState({ taskTableFilterBy: value }); }}
            />
            {this.state.isMobile && (<TaskTableMobile
              userId={userId}
              tableTasks={this.state.tableTasks}
              changeTableTasks={this.changeTableTasksByMobile.bind(this)}
              isActive={util.isToday(this.state.date)}
              readOnly={this.state.readOnly}
            />)}
            {!this.state.isMobile && (<TaskTable
              onRef={ref => (this.taskTable = ref)} // eslint-disable-line
              userId={userId}
              taskTableFilterBy={this.state.taskTableFilterBy}
              members={this.state.members}
              tableTasks={this.state.tableTasks}
              handleTableTasks={(newTableTasks) => {
                this.setState({ tableTasks: this.getHotTaskIgnoreFilter(newTableTasks) });
              }}
              handleSaveable={(newVal) => { this.setState({ saveable: newVal }); }}
              isActive={util.isToday(this.state.date)}
              moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
            />)}
            <Divider />
            <TextField
              fullWidth
              style={{ padding: theme.spacing.unit }}
              InputProps={{ style: { fontSize: 13, padding: theme.spacing.unit } }}
              onChange={(e) => { this.setState({ memo: e.target.value, saveable: true }); }}
              onBlur={() => {
                if (this.state.isMobile && this.state.saveable) {
                  this.saveMemo().then(() => {
                    this.setState({
                      isOpenSnackbar: true,
                      snackbarText: 'メモを保存しました。',
                      saveable: false,
                    });
                  });
                }
              }}
              value={this.state.memo}
              label={
                <span style={{ fontSize: 13, padding: this.props.theme.spacing.unit }}>
                  {`${this.state.date}のメモ`}
                </span>
              }
              multiline
              margin="normal"
            />
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          ContentProps={{ 'aria-describedby': 'info-id' }}
          message={
            <span id="info-id" style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon style={{ color: constants.brandColor.base.GREEN }} />
              <span style={{ paddingLeft: theme.spacing.unit }}>{this.state.snackbarText}</span>
            </span>
          }
        />
        <Snackbar
          key="notification"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={
            <span id="message-id" style={{ display: 'flex', alignItems: 'center' }}>
              {this.state.receiveMessage.icon ? <Avatar className={classes.userPhoto} src={this.state.receiveMessage.icon} /> : <Person className={classes.userPhoto} />}
              <span style={{ paddingLeft: theme.spacing.unit }}>{this.state.receiveMessage.body}</span>
            </span>
          }
          open={this.state.isOpenReceiveMessage}
          action={[<IconButton key="close" color="inherit" onClick={() => { this.setState({ isOpenReceiveMessage: false, receiveMessage: { body: '', icon: '' } }); }}><Close /></IconButton>]}
        />
        <Dialog open={!this.state.isSyncedTableTasks}>
          <div style={{ padding: this.props.theme.spacing.unit }}><CircularProgress className={classes.circularProgress} size={40} /></div>
        </Dialog>
      </Grid>
    );
  }
}

WorkSheet.propTypes = {
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userPhotoURL: PropTypes.string.isRequired,
  toggleHelpDialog: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
  match: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
  location: PropTypes.object.isRequired, // eslint-disable-line
};

export default withRouter(withStyles(styles, { withTheme: true })(WorkSheet));
