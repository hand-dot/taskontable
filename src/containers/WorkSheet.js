import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import debounce from 'lodash.debounce';
import localforage from 'localforage';

import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import Close from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Error from '@material-ui/icons/Error';
import Person from '@material-ui/icons/Person';

import NotLoginSection from '../components/NotLoginSection';
import WorkSheetPanels from '../components/WorkSheetPanels';
import TableCtl from '../components/TableCtl';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';

import constants from '../constants';
import tasksUtil from '../tasksUtil';
import util from '../util';
import i18n from '../i18n';
import editing from '../images/editing.gif';

const database = util.getDatabase();

const styles = theme => ({
  root: {
    width: '100%',
    margin: '0 auto',
  },
  userPhoto: {
    marginRight: theme.spacing.unit,
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
});

class WorkSheet extends Component {
  constructor(props) {
    super(props);
    this.saveWorkSheet = debounce(this.saveWorkSheet, constants.REQEST_DELAY_FAST);
    this.attachTableTasks = debounce(this.attachTableTasks, constants.REQEST_DELAY_FAST);
    this.attachMemo = debounce(this.attachMemo, constants.REQEST_DELAY_FAST);
    this.attachEditingUserId = debounce(this.attachEditingUserId, constants.REQEST_DELAY_FAST);
    this.state = {
      worksheetId: '',
      worksheetOpenRange: '', // public or private
      worksheetName: '',
      editingUserId: null,
      members: [],
      invitedEmails: [],
      isOpenSnackbar: false,
      snackbarText: '',
      snackbarType: constants.messageType.SUCCESS,
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
      isSyncedMemo: false,
      isOpenReceiveMessage: false,
      receiveMessage: {
        body: '',
        icon: '',
      },
    };
  }

  componentWillMount() {
    const worksheetId = encodeURI(this.props.match.params.id);
    if (!util.validateDatabaseKey(worksheetId)) {
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
      } if (worksheetOpenRange.val() === constants.worksheetOpenRange.PRIVATE && (!memberIds.exists() || !memberIds.val().includes(this.props.userId))) {
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
          this.fetchScripts().then(() => { this.attachWorkSheet(); });
        });
      } else {
        // メンバーがいないワークシートには遷移できない
        this.props.history.push('/');
      }
    });
    // 消えてしまった通知を取得する処理。
    this.getRecentMessage(worksheetId);
    window.onfocus = () => { this.getRecentMessage(worksheetId); };

    if (!this.state.isMobile) {
      setTimeout(() => {
        window.onkeydown = (e) => { this.fireShortcut(e); };
      });
    }

    window.onunload = () => {
      if (this.state.editingUserId === this.props.userId) {
        database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/editingUserIds/${this.state.date}`).set(null);
      }
    };

    window.onbeforeunload = (e) => {
      if (this.state.saveable) {
        const dialogText = i18n.t('common.someContentsAreNotSaved');
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
    const { userId } = this.props;
    if (nextProps.userId) {
      database.ref(`/${constants.API_VERSION}/worksheets/${encodeURI(this.props.match.params.id)}/members/`).once('value').then((userIds) => {
        if (userIds.exists() && userIds.val() !== []) {
          this.setState({ readOnly: !userIds.val().includes(userId) });
        }
      });
    }
  }

  componentWillUnmount() {
    const {
      isMobile, editingUserId, worksheetId, date,
    } = this.state;
    const { userId } = this.props;
    if (!isMobile) window.onkeydown = '';
    window.onbeforeunload = '';
    window.onunload = '';
    window.onfocus = '';
    this.detachWorkSheet();
    if (userId && editingUserId === userId) database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).set(null);
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
      throw new Error(`Failed to get notification(RecentMessage) :${err}`);
    });
  }

  /**
   * テーブルタスクを開始時刻順にソートしstateに設定します。
   * ソートしたテーブルタスクを返却します。
   * @param  {Array} tableTasks テーブルタスク
   */
  setSortedTableTasks(tableTasks) {
    const sortedTableTask = tasksUtil.getSortedTasks(tableTasks);
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
          snackbarText: `${snackbarText}${i18n.t('common.saved_target', { target: i18n.t('worksheet.tableTask') })} (${savedAt})`,
          snackbarType: constants.messageType.SUCCESS,
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
          snackbarText: i18n.t('worksheet.movedTableTasksToTaskPool'),
          snackbarType: constants.messageType.SUCCESS,
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
      if (taskPoolType === constants.taskPoolType.HIGHPRIORITY
        || taskPoolType === constants.taskPoolType.LOWPRIORITY) {
        this.state.poolTasks[taskPoolType].splice(value, 1);
      }
      // タスクプールからテーブルタスクに移動したらテーブルタスクを保存する
      this.setState({ tableTasks });
      setTimeout(() => { this.saveTableTasks(); }, constants.RENDER_DELAY);
    }
    setTimeout(() => {
      this.savePoolTasks().then(() => {
        this.setState({
          isOpenSnackbar: true,
          snackbarText: taskActionType === constants.taskActionType.MOVE_TABLE ? i18n.t('worksheet.movedTaskPoolToTableTasks') : i18n.t('common.saved_target', { target: i18n.t('worksheet.taskPool') }),
          snackbarType: constants.messageType.SUCCESS,
        });
      });
    });
  }

  /**
   * stateのpoolTasksをサーバーに保存します。
   */
  savePoolTasks() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.editingIsNotAllowedBecauseItIsNotAMember'), snackbarType: constants.messageType.ERROR });
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
    const {
      worksheetId, date, readOnly, editingUserId, members,
    } = this.state;
    const { userId } = this.props;
    if (readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.editingIsNotAllowedBecauseItIsNotAMember'), snackbarType: constants.messageType.ERROR });
      return Promise.resolve();
    }
    const user = members[members.findIndex(member => member.uid === editingUserId)];
    if (editingUserId && editingUserId !== userId && user) {
      this.setState({ isOpenSnackbar: true, snackbarText: '編集中のためロックされています。', snackbarType: constants.messageType.ERROR });
      return Promise.resolve();
    }
    return Promise.all([this.saveTableTasks(), this.saveMemo()]).then((snackbarTexts) => {
      const savedAt = moment().format(constants.TIMEFMT);
      // 編集中を解除
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).set(null);
      this.setState({
        isOpenSnackbar: true,
        snackbarText: `${snackbarTexts[0]}${i18n.t('common.saved_target', { target: i18n.t('common.worksheet') })} (${savedAt})`,
        snackbarType: constants.messageType.SUCCESS,
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
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.editingIsNotAllowedBecauseItIsNotAMember'), snackbarType: constants.messageType.ERROR });
      return Promise.resolve();
    }
    // IDを生成し無駄なプロパティを削除する。また、hotで並び変えられたデータを取得するために処理が入っている。
    const tableTasks = !this.state.isMobile ? this.getHotTaskIgnoreFilter(this.taskTable.getTasksIgnoreEmptyTaskAndProp()) : this.state.tableTasks;
    // 開始時刻順に並び替える
    const sortedTableTask = this.setSortedTableTasks(tableTasks.map(tableTask => tasksUtil.deleteUselessTaskProp(tableTask)));
    return this.fireScript(sortedTableTask, 'exportScript')
      .then(
        data => database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).set(data)
          .then(() => `${i18n.t('common.executedExportScript')}(success) - `),
        reason => database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${this.state.date}`).set(sortedTableTask)
          .then(() => (reason ? `${i18n.t('common.executedExportScript')}(error)：${reason} - ` : '')),
      );
  }

  /**
   * stateのmemoをサーバーに保存します。
   */
  saveMemo() {
    if (this.state.readOnly) {
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.editingIsNotAllowedBecauseItIsNotAMember'), snackbarType: constants.messageType.ERROR });
      return Promise.resolve();
    }
    return database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/memos/${this.state.date}`).set(this.state.memo ? this.state.memo : null);
  }

  saveEditingUserId() {
    const {
      isMobile, members, saveable, isSyncedTableTasks, isSyncedMemo, editingUserId, worksheetId, date,
    } = this.state;
    const { userId } = this.props;
    if (members.length === 1 || editingUserId === userId || !isSyncedTableTasks || !isSyncedMemo) return Promise.resolve();
    if (!editingUserId && userId && !isMobile && members.length > 1 && saveable && isSyncedTableTasks && isSyncedMemo) {
      return database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).set(userId);
    }
    return Promise.reject();
  }

  /**
   * WorkSheet全体の同期を開始します。
   */
  attachWorkSheet() {
    // テーブルを同期開始&初期化
    this.attachTableTasks();
    // タスクプールをサーバーと同期開始
    this.attachPoolTasks();
    // メモを同期開始
    this.attachMemo();
    // メンバー,招待中のメールアドレスを同期開始
    this.attachMembersAndInvitedEmails();
    // 編集中のユーザーIDを同期開始
    this.attachEditingUserId();
  }

  /**
   * WorkSheet全体の同期を終了します。
   */
  detachWorkSheet() {
    const { worksheetId, date } = this.state;
    return Promise.all([
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/poolTasks`).off(),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/tableTasks/${date}`).off(),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/memos/${date}`).off(),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).off(),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members`).off(),
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/invitedEmails`).off(),
    ]);
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
        if (this.state.isSyncedTableTasks) snackbarText = `${i18n.t('worksheet.tableHasBeenUpdated')} (${savedAt})`; // ほかのユーザーの更新
        newTableTasks = snapshot.val();
      } else if (this.state.poolTasks.regularTasks.length !== 0 && moment(this.state.date, constants.DATEFMT).isAfter(moment().subtract(1, 'days'))) {
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合(定期タスクをテーブルに設定する処理。本日以降しか動作しない)
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        newTableTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === dayAndCount.day) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        if (newTableTasks.length !== 0) snackbarText = i18n.t('worksheet.loadedRegularTask');
      }
      this.fireScript(newTableTasks, 'importScript').then(
        (data) => {
          this.setSortedTableTasks(data);
          this.setState({
            isSyncedTableTasks: true, isOpenSnackbar: true, snackbarText: `${i18n.t('common.executedImportScript')}(success)${snackbarText ? ` - ${snackbarText}` : ''}`, snackbarType: constants.messageType.SUCCESS,
          });
        },
        (reason) => {
          this.setSortedTableTasks(newTableTasks);
          if (reason) snackbarText = `${i18n.t('common.executedImportScript')}(error)：${reason}${snackbarText ? ` - ${snackbarText}` : ''}`;
          this.setState({
            isSyncedTableTasks: true, isOpenSnackbar: snackbarText !== '', snackbarText, snackbarType: reason ? constants.messageType.ERROR : constants.messageType.SUCCESS,
          });
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
    const { worksheetId, date } = this.state;
    return database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/memos/${date}`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const { isSyncedMemo } = this.state;
        const savedAt = moment().format(constants.TIMEFMT);
        const snackbarText = isSyncedMemo ? `${i18n.t('worksheet.memoHasBeenUpdated')} (${savedAt})` : ''; // ほかのユーザーの更新
        this.setState({
          isSyncedMemo: true, memo: snapshot.val(), saveable: false, isOpenSnackbar: snackbarText !== '', snackbarText, snackbarType: constants.messageType.SUCCESS,
        });
      } else {
        this.setState({ isSyncedMemo: true, memo: '' });
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
   * 編集中のユーザーIDを同期します。
   */
  attachEditingUserId() {
    const { worksheetId, date } = this.state;
    return database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).on('value', (snapshot) => {
      const { editingUserId } = this.state;
      if (editingUserId !== snapshot.val()) {
        // TODO ロックが解除されました。と初期表示ででてしまうのがうざい
        const newState = snapshot.val() ? { editingUserId: snapshot.val() } : {
          editingUserId: null, isOpenSnackbar: true, snackbarText: 'ロックが解除されました。', snackbarType: constants.messageType.SUCCESS,
        };
        this.setState(newState);
      } else {
        this.setState({ editingUserId: null });
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
      if (this.state.saveable && !window.confirm(i18n.t('common.someContentsAreNotSaved'))) return false;
      const newDate = moment(this.state.date).add(constants.shortcuts.NEXTDATE(e) ? 1 : -1, 'day').format(constants.DATEFMT);
      setTimeout(() => this.changeDate(newDate));
    } else if (constants.shortcuts.NEXTTAB(e) || constants.shortcuts.PREVTAB(e)) {
      e.preventDefault();
      if (constants.shortcuts.NEXTTAB(e) && this.state.tab !== 3) {
        this.setState({ tab: this.state.tab + 1 });
      } else if (constants.shortcuts.PREVTAB(e) && this.state.tab !== 0) {
        this.setState({ tab: this.state.tab - 1 });
      }
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
    const {
      saveable,
      worksheetId,
      date,
      editingUserId,
      isMobile,
    } = this.state;
    const { userId } = this.props;
    if (!saveable || window.confirm(i18n.t('common.someContentsAreNotSaved'))) {
      this.detachWorkSheet().then(() => {
        if (userId && editingUserId === userId) database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).set(null);
        this.setState({
          date: newDate, taskTableFilterBy: '', isSyncedTableTasks: false, isSyncedMemo: false, editingUserId: null,
        });
        if (!isMobile) this.taskTable.updateIsActive(util.isToday(newDate));
        setTimeout(() => { this.attachWorkSheet(); });
      });
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
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.membersHaveBeenUpdated'), snackbarType: constants.messageType.SUCCESS });
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
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('worksheet.setOpenRangeTo_target', { target: worksheetOpenRange === constants.worksheetOpenRange.PUBLIC ? i18n.t('common.public') : i18n.t('common.private') }), snackbarType: constants.messageType.SUCCESS });
      return Promise.resolve();
    });
  }


  render() {
    const {
      isMobile,
      isOpenDashboard,
      tab,
      readOnly,
      worksheetOpenRange,
      worksheetId,
      taskTableFilterBy,
      tableTasks,
      poolTasks,
      members,
      editingUserId,
      worksheetName,
      invitedEmails,
      date,
      savedAt,
      saveable,
      memo,
      isOpenSnackbar,
      snackbarText,
      snackbarType,
      isOpenReceiveMessage,
      receiveMessage,
      isSyncedTableTasks,
      isSyncedMemo,
    } = this.state;
    const {
      userId,
      userName,
      userPhotoURL,
      classes,
      history,
      theme,
    } = this.props;
    return (
      <Grid container spacing={0} className={classes.root} style={{ padding: isMobile ? 0 : theme.spacing.unit, paddingTop: (isMobile ? 0 : 17) + theme.mixins.toolbar.minHeight }}>
        <Grid
          item
          xs={12}
          style={{
            padding: theme.spacing.unit * 2, backgroundColor: constants.brandColor.base.YELLOW, display: userId ? 'none' : 'block',
          }}
        >
          <NotLoginSection />
        </Grid>
        <Grid item xs={12}>
          <WorkSheetPanels
            userId={userId}
            userName={userName}
            userPhotoURL={userPhotoURL}
            isOpenDashboard={isOpenDashboard}
            isMobile={isMobile}
            tab={tab}
            readOnly={readOnly}
            worksheetOpenRange={worksheetOpenRange}
            worksheetId={worksheetId}
            taskTableFilterBy={taskTableFilterBy}
            tableTasks={tableTasks}
            poolTasks={poolTasks}
            members={members}
            worksheetName={worksheetName}
            invitedEmails={invitedEmails}
            changePoolTasks={this.changePoolTasks.bind(this)}
            handleTab={this.handleTab.bind(this)}
            handleMembers={this.handleMembers.bind(this)}
            handleInvitedEmails={this.handleInvitedEmails.bind(this)}
            handleWorksheetOpenRange={this.handleWorksheetOpenRange.bind(this)}
            history={history}
          />
          <Paper elevation={1}>
            <TableCtl
              userId={userId}
              taskTableFilterBy={taskTableFilterBy}
              members={members}
              tableTasks={tableTasks}
              date={date}
              savedAt={savedAt}
              saveable={Boolean(userId && saveable && isSyncedTableTasks && isSyncedMemo)}
              changeDate={this.changeDate.bind(this)}
              saveWorkSheet={this.saveWorkSheet.bind(this)}
              handleTaskTableFilter={(value) => { this.setState({ taskTableFilterBy: value }); }}
            />
            {isMobile && (
            <TaskTableMobile
              userId={userId}
              tableTasks={tableTasks}
              changeTableTasks={this.changeTableTasksByMobile.bind(this)}
              isActive={util.isToday(date)}
              readOnly={readOnly}
            />
            )}
            {!isMobile && (
            <TaskTable
              onRef={ref => (this.taskTable = ref)} // eslint-disable-line
              userId={userId}
              taskTableFilterBy={taskTableFilterBy}
              members={members}
              tableTasks={tableTasks}
              handleTableTasks={(newTableTasks) => {
                this.setState({ tableTasks: this.getHotTaskIgnoreFilter(newTableTasks) });
                this.saveEditingUserId().catch(() => {
                  if (userId) this.setState({ isOpenSnackbar: true, snackbarText: '編集中のためロックされています。', snackbarType: constants.messageType.ERROR });
                });
              }}
              handleSaveable={(newVal) => { this.setState({ saveable: newVal }); }}
              isActive={util.isToday(date)}
              moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
            />
            )}
            <Divider />
            <TextField
              fullWidth
              style={{ padding: theme.spacing.unit }}
              InputProps={{ style: { fontSize: 13, padding: theme.spacing.unit } }}
              onChange={(e) => {
                const newMemo = e.target.value;
                this.setState({ memo: newMemo, saveable: true });
                setTimeout(() => {
                  this.saveEditingUserId().catch(() => {
                    if (userId) this.setState({ isOpenSnackbar: true, snackbarText: '編集中のためロックされています。', snackbarType: constants.messageType.ERROR });
                  });
                });
              }}
              onBlur={() => {
                if (isMobile && saveable) {
                  this.saveMemo().then(() => {
                    this.setState({
                      isOpenSnackbar: true,
                      snackbarText: i18n.t('common.saved_target', { target: i18n.t('worksheet.memo') }),
                      snackbarType: constants.messageType.SUCCESS,
                      saveable: false,
                    });
                  });
                }
              }}
              value={memo}
              label={(
                <span style={{ fontSize: 13, padding: theme.spacing.unit }}>
                  {`${i18n.t('worksheet.memo')}(${date})`}
                </span>
              )}
              multiline
              margin="normal"
            />
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          ContentProps={{ 'aria-describedby': 'info-id' }}
          message={(
            <span id="info-id" style={{ display: 'flex', alignItems: 'center' }}>
              {snackbarType === constants.messageType.SUCCESS && <CheckCircleIcon style={{ color: constants.brandColor.base.GREEN }} />}
              {snackbarType === constants.messageType.ERROR && <Error style={{ color: constants.brandColor.base.YELLOW }} />}
              <span style={{ paddingLeft: theme.spacing.unit }}>
                {snackbarText}
              </span>
            </span>
          )}
        />
        <Snackbar
          key="notification"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          ContentProps={{ 'aria-describedby': 'message-id' }}
          message={(
            <span id="message-id" style={{ display: 'flex', alignItems: 'center' }}>
              {receiveMessage.icon ? <Avatar className={classes.userPhoto} src={receiveMessage.icon} /> : <Person className={classes.userPhoto} />}
              <span style={{ paddingLeft: theme.spacing.unit }}>
                {receiveMessage.body}
              </span>
            </span>
          )}
          open={isOpenReceiveMessage}
          action={[
            <IconButton key="close" color="inherit" onClick={() => { this.setState({ isOpenReceiveMessage: false, receiveMessage: { body: '', icon: '' } }); }}>
              <Close />
            </IconButton>,
          ]}
        />
        {(() => {
          if (!editingUserId) return null;
          const user = members[members.findIndex(member => member.uid === editingUserId)];
          if (!user) return null;
          return (
            <Snackbar
              key="editing-user"
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              ContentProps={{ 'aria-describedby': 'editing-user-id' }}
              message={(
                <span id="editing-user-id" style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar className={classes.userPhoto} src={editing} />
                  <span style={{ paddingLeft: theme.spacing.unit, paddingRight: theme.spacing.unit }}>
                    {user.uid === userId ? '編集を終えたら保存してロックを解除してください。' : `${user.displayName}さんが編集中です。`}
                  </span>
                </span>
              )}
              open
              action={[
                <IconButton
                  key="close"
                  color="inherit"
                  onClick={() => {
                    if (userId && window.confirm(`${user.displayName}さんのロックを解除してもよろしいですか？`)) {
                      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/editingUserIds/${date}`).set(null);
                    }
                  }}
                >
                  <Close />
                </IconButton>,
              ]}
            />
          );
        })()}
        <Dialog open={!isSyncedTableTasks || !isSyncedMemo}>
          <div style={{ padding: theme.spacing.unit }}>
            <CircularProgress className={classes.circularProgress} />
          </div>
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
