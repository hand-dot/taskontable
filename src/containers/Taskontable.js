import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';

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
import TableStatus from '../components/TableStatus';
import TaskPool from '../components/TaskPool';
import TaskTable from '../components/TaskTable';
import TaskTableMobile from '../components/TaskTableMobile';
import { getEmptyHotData } from '../hot';

import constants from '../constants';
import util from '../util';

const styles = theme => ({
  root: {
    width: constants.APPWIDTH,
    margin: '0 auto',
  },
  panel: {
    maxHeight: 470,
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
});

class Taskontable extends Component {
  constructor(props) {
    super(props);
    this.oldTimeDiffMinute = '';
    this.bindOpenTaskIntervalID = '';
    this.state = {
      isOpenSnackbar: false,
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
      setTimeout(() => { this.savePoolTasks(poolTasks); });
    }
    this.handleTableTasks(tableTasks);
    this.handleSaveable(this.state.saveable ? true : !util.equal(tableTasks, this.state.tableTasks));
    setTimeout(() => { this.saveTableTask(); });
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
      setTimeout(() => { this.saveTableTask(); });
    }
    setTimeout(() => this.savePoolTasks(poolTasks));
  }

  moveTableTaskToPoolTask(taskPoolType, task) {
    const poolTasks = util.cloneDeep(this.state.poolTasks);
    poolTasks[taskPoolType].push(task);
    // テーブルタスクからタスクプールに移動したら保存する
    this.saveTableTask();
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
    firebase.database().ref(`/users/${this.props.user.uid}/poolTasks`).set(tasks);
  }


  fireScript(data, scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    firebase.database().ref(`/users/${this.props.user.uid}/settings/${scriptType}`).once('value').then((snapshot) => {
      if (snapshot.exists() && snapshot.val() !== '') {
        const script = snapshot.val();
        const worker = new Worker(window.URL.createObjectURL(new Blob([`onmessage = ${script}`], { type: 'text/javascript' })));
        worker.postMessage(data.length === 0 ? getEmptyHotData() : data);
        // 終了したときに呼ばれる
        worker.onmessage = (e) => {
          console.log(`------${scriptType}------`);
          console.log(e.data);
          console.log(`------${scriptType}------`);
        };
      }
    });
  }

  saveTableTask() {
    // 並び変えられたデータを取得するために処理が入っている。
    const tableTasks = this.state.isHotMode ? this.taskTable.getTasksIgnoreEmptyTaskAndProp() : this.state.tableTasks;
    this.bindOpenTasksProcessing(tableTasks);
    this.setState({
      tableTasks,
      isOpenSnackbar: true,
      loading: true,
    });
    this.fireScript(tableTasks, 'exportScript');
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).set(tableTasks.length === 0 ? getEmptyHotData() : tableTasks).then(() => {
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

  handleTabChange(event, tab) {
    this.setState({ tab, isOpenDashboard: true });
    setTimeout(() => this.forceUpdate());
  }

  handleSaveable(saveable) {
    this.setState({ saveable });
  }

  handleTableTasks(tableTasks) {
    this.bindOpenTasksProcessing(tableTasks);
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
      this.saveTableTask();
    } else if (constants.shortcuts.TOGGLE_HELP(e)) {
      this.props.toggleHelpDialog();
    } else if (constants.shortcuts.TOGGLE_DASHBOAD(e)) {
      e.preventDefault();
      this.toggleDashboard();
    }
    return false;
  }

  isTodayTasks() {
    return moment(this.state.date, constants.DATEFMT).isSame(new Date(), 'day');
  }

  // 開始しているタスクを見つけ、経過時間をタイトルに反映する
  bindOpenTasksProcessing(tasks) {
    const openTask = tasks.find(hotTask => hotTask.length !== 0 && hotTask.startTime && hotTask.endTime === '');
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    if (this.isTodayTasks() && openTask) {
      this.setState({ hasOpenTask: true });
      this.bindOpenTaskIntervalID = setInterval(() => {
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, moment().format('HH:mm'));
        // 1分に一度タイトルが書き変わったタイミングでhotを再描画する。
        if (newTimeDiffMinute !== this.oldTimeDiffMinute && this.state.isHotMode) this.taskTable.renderHot();
        if (newTimeDiffMinute === -1) {
          // 開始まで秒単位でカウントダウンする場合
          document.title = `${moment().format('ss') - 60}秒 - ${openTask.title || '無名タスク'}`;
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

  attachTableTasks() {
    firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).on('value', (snapshot) => {
      this.setState({
        loading: true,
      });
      if (snapshot.exists() && snapshot.val() && !util.equal(this.state.tableTasks, snapshot.val())) {
        // サーバーにタスクが存在した場合 かつ、サーバーから配信されたデータが自分のデータと違う場合、サーバーのデータでテーブルを初期化する
        if (this.state.isHotMode) {
          this.taskTable.clear();
          this.taskTable.setData(snapshot.val());
        }
        this.handleTableTasks(snapshot.val());
      }
      this.setState({
        saveable: false,
        loading: false,
      });
    });
  }

  fetchTableTask() {
    this.setState({ loading: true });
    return firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).once('value').then((snapshot) => {
      this.setState({
        saveable: false,
        loading: false,
      });
      return snapshot;
    });
  }

  initTableTask() {
    if (this.state.isHotMode) this.taskTable.clear();
    this.attachTableTasks();
    this.fetchTableTask().then((snapshot) => {
      if (snapshot.exists() && !util.equal(snapshot.val(), getEmptyHotData())) {
        // サーバーに初期値以外のタスクが存在した場合サーバーのデータでテーブルを初期化する
        if (this.state.isHotMode) this.taskTable.setData(snapshot.val());
        this.handleTableTasks(snapshot.val());
        this.fireScript(snapshot.val(), 'importScript');
      } else if (this.state.poolTasks.regularTasks.length !== 0) {
        // 定期タスクをテーブルに設定する処理。
        const dayAndCount = util.getDayAndCount(new Date(this.state.date));
        // 定期のタスクが設定されており、サーバーにデータが存在しない場合
        // MultipleSelectコンポーネントで扱えるように,['日','月'...]に変換されているため、
        // util.getDayOfWeekStr(dayAndCount.day)) で[0, 1]へ再変換の処理を行っている
        // https://github.com/hand-dot/taskontable/issues/118
        const regularTasks = this.state.poolTasks.regularTasks.filter(regularTask => regularTask.dayOfWeek.findIndex(d => d === util.getDayOfWeekStr(dayAndCount.day)) !== -1 && regularTask.week.findIndex(w => w === dayAndCount.count) !== -1);
        if (this.state.isHotMode) this.taskTable.setData(regularTasks);
        this.handleTableTasks(regularTasks);
        this.fireScript(regularTasks, 'importScript');
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
      firebase.database().ref(`/users/${this.props.user.uid}/tableTasks/${this.state.date}`).off();
      this.setState({ date });
      setTimeout(() => { this.initTableTask(); });
    }
  }

  toggleDashboard() {
    this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid container spacing={0} className={classes.root} style={{ paddingTop: theme.mixins.toolbar.minHeight }}>
        <Grid item xs={12}>
          <ExpansionPanel expanded={this.state.isOpenDashboard} style={{ margin: 0 }} elevation={1}>
            <ExpansionPanelSummary expandIcon={<div style={{ width: '100%' }} onClick={this.toggleDashboard.bind(this)}><i className="fa fa-angle-down fa-lg" /></div>}>
              <Tabs value={this.state.tab} onChange={this.handleTabChange.bind(this)} scrollable={false} scrollButtons="off" indicatorColor={constants.brandColor.light.BLUE} >
                <Tab label={<span><i className="fa fa-tachometer fa-lg" />ダッシュボード</span>} />
                <Tab label={<span><i className="fa fa-tasks fa-lg" />タスクプール</span>} />
              </Tabs>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ display: 'block', padding: 0 }} >
              {this.state.tab === 0 && <div className={classes.panel} ><Dashboard tableTasks={this.state.tableTasks} /></div>}
              {this.state.tab === 1 && <div className={classes.panel} ><TaskPool poolTasks={this.state.poolTasks} changePoolTasks={this.changePoolTasks.bind(this)} /></div>}
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Paper elevation={1}>
            <TableCtl
              tableTasks={this.state.tableTasks}
              hasOpenTask={this.state.hasOpenTask}
              date={this.state.date}
              lastSaveTime={this.state.lastSaveTime}
              saveable={this.state.saveable}
              changeDate={this.changeDate.bind(this)}
              saveTableTask={this.saveTableTask.bind(this)}
            />
            <TableStatus tableTasks={this.state.tableTasks} isLoading={this.state.loading} />
            {(() => {
              if (this.state.isHotMode) {
                return (<TaskTable
                    onRef={ref => (this.taskTable = ref)} // eslint-disable-line
                  tableTasks={this.state.tableTasks}
                  addTask={this.addTask.bind(this)}
                  handleTableTasks={this.handleTableTasks.bind(this)}
                  handleSaveable={this.handleSaveable.bind(this)}
                  isToday={this.isTodayTasks()}
                  moveTableTaskToPoolTask={this.moveTableTaskToPoolTask.bind(this)}
                />);
              } return (<TaskTableMobile
                tableTasks={this.state.tableTasks}
                changeTableTasks={this.changeTableTasks.bind(this)}
                isToday={this.isTodayTasks()}
              />);
            })()}
          </Paper>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => {
            this.setState({ isOpenSnackbar: false });
          }}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">保存しました。</span>}
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
