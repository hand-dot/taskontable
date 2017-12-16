import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';

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
import TaskListCtl from './TaskListCtl';
import Taskpool from './Taskpool';

import firebaseConf from '../configs/firebase';
import { bindShortcut, hotConf, getEmptyHotData } from '../hot';

import constants from '../constants';

import util from '../util';

const initialState = {
  userId: '',
  loading: true,
  notifiable: true,
  saveable: false,
  isOpenDashboard: true,
  isOpenTaskpool: false,
  date: moment().format('YYYY-MM-DD'),
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  allTasks: Array(10).fill(getEmptyHotData()[0]),
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
const getHotTasks = () => {
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
  }

  componentWillMount() {
    // 初期値の最終保存時刻
    this.setState({
      lastSaveTime: util.getCrrentTimeObj(),
    });
    window.addEventListener('keydown', (e) => {
      // e.key === '>' はEdgeで動かないので e.keyCode === 190にしている
      // keyCode:188 は <
      if (e.ctrlKey && (e.keyCode === 190 || e.keyCode === 188)) {
        e.preventDefault();
        // 基準日を変更
        if (this.state.saveable && !window.confirm('保存していない内容があります。')) return false;
        this.setState({ date: moment(this.state.date).add(e.keyCode === 190 ? 1 : -1, 'day').format('YYYY-MM-DD') });
        setTimeout(() => {
          this.fetchTask().then((snapshot) => {
            hot.updateSettings({ data: snapshot.exists() ? snapshot.val() : getEmptyHotData() });
          });
        }, 0);
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveHot();
      } else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        if (hot) hot.alter('insert_row');
      } else if (e.ctrlKey && e.key === 'j') {
        e.preventDefault();
        this.toggleDashboard();
      } else if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        this.toggleTaskpool();
      } else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        hot.selectCell(0, 0);
      }
      return false;
    });
    window.addEventListener('beforeunload', (e) => {
      if (this.state.saveable) {
        const dialogText = '保存していない内容があります。';
        e.returnValue = dialogText;
        return dialogText;
      }
    });
  }

  componentDidMount() {
    const self = this;
    hot = new Handsontable(document.getElementById('hot'), Object.assign(hotConf, {
      // 各種callbackでテーブルの状態をstateに反映
      afterRowMove() { self.setStateFromHot(); },
      beforeChangeRender() { self.setStateFromHot(); },
      afterCreateRow() { self.setStateFromHot(); },
      afterRemoveRow() { self.setStateFromHot(); },
      afterUpdateSettings() { self.setStateFromHot(true); },
      afterInit() {
        self.setStateFromHot();
        bindShortcut(this);
      },
    }));
    window.hot = hot;
  }

  setAInitialState() {
    this.setState(initialState);
  }

  setStateFromHot(isUpdateSettings) {
    const hotTasks = getHotTasks();
    if (isUpdateSettings) {
      this.setState({
        saveable: false,
        allTasks: hotTasks,
      });
    } else if (JSON.stringify(this.state.allTasks) !== JSON.stringify(hotTasks)) {
      this.setState({
        saveable: true,
        allTasks: hotTasks,
      });
    }
  }

  toggleDashboard() {
    this.setState({ isOpenDashboard: !this.state.isOpenDashboard });
  }

  toggleTaskpool() {
    this.setState({ isOpenTaskpool: !this.state.isOpenTaskpool });
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

  fetchTask() {
    this.setState(() => ({
      loading: true,
    }));
    return firebase.database().ref(`/${this.state.userId}/${this.state.date}`).once('value').then((snapshot) => {
      this.setState(() => ({
        loading: false,
      }));
      return snapshot;
    });
  }

  changeUserId(e) {
    this.setState({ userId: e.target.value });
  }

  loginCallback(userId) {
    this.setState({ userId });
    // テーブルの初期化
    setTimeout(() => {
      this.fetchTask().then((snapshot) => {
        if (hot && snapshot.exists()) {
          hot.updateSettings({ data: snapshot.val() });
        }
      });
    }, 0);
  }

  logoutCallback() {
    // stateの初期化
    this.setAInitialState();
    // テーブルのクリア
    setTimeout(() => {
      if (hot) {
        hot.updateSettings({ data: getEmptyHotData() });
      }
    }, 0);
  }

  changeDate(event) {
    if (!hot) return;
    const nav = event.currentTarget.getAttribute('data-date-nav');
    let date;
    if (nav) {
      date = moment(this.state.date).add(nav === 'next' ? 1 : -1, 'day').format('YYYY-MM-DD');
    } else {
      event.persist();
      date = event.target.value;
    }
    if (!this.state.saveable || window.confirm('保存していない内容があります。')) {
      this.setState(() => ({
        date,
      }));
      setTimeout(() => {
        this.fetchTask().then((snapshot) => {
          hot.updateSettings({ data: snapshot.exists() ? snapshot.val() : getEmptyHotData() });
        });
      }, 0);
    }
  }

  saveHot() {
    if (hot) {
      // 並び変えられたデータを取得するために処理が入っている。
      this.saveTask(getHotTasks());
    }
  }

  saveTask(data) {
    this.setState(() => ({
      loading: true,
    }));
    firebase.database().ref(`/${this.state.userId}/${this.state.date}`).set(data).then(() => {
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
                allTasks={this.state.allTasks}
              />
              <Taskpool
                isOpenTaskpool={this.state.isOpenTaskpool}
                toggleTaskpool={this.toggleTaskpool.bind(this)}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={1}>
                <div style={{ padding: '24px 24px 0' }}>
                  <i className="fa fa-table fa-lg" />
                  <Typography style={{ display: 'inline' }}>
                    　テーブル　({this.state.date.replace(/-/g, '/')})
                  </Typography>
                  <TaskListCtl
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
