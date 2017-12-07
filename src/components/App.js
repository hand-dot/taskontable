import cloneDeep from 'lodash.clonedeep';
import * as firebase from 'firebase';
import React, { Component } from 'react';
import moment from 'moment';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { LinearProgress } from 'material-ui/Progress';
import Tooltip from 'material-ui/Tooltip';

import Dashboad from './Dashboad';
import GlobalHeader from './GlobalHeader';

import firebaseConf from '../confings/firebase';
import { hotConf, emptyHotData } from '../confings/hot';
import '../styles/App.css';

const initialState = {
  userId: '',
  loading: true,
  isOpenLoginDialog: false,
  notifiable: true,
  date: moment().format('YYYY-MM-DD'),
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  allTasks: [],
};

// ローディングが早すぎて一回もロードされてないように見えるため、
// デザイン目的で最低でも1秒はローディングするようにしている。実際ないほうが良い。
const loadingDuration = 1000;

const NotificationClone = (() => ('Notification' in window ? cloneDeep(Notification) : false))();
firebase.initializeApp(firebaseConf);

let hot = null;

function addTask() {
  if (hot) {
    hot.alter('insert_row');
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentWillMount() {
    // 初期値の最終保存時刻
    const currentMoment = moment();
    const timeObj = {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
    this.setState({
      lastSaveTime: timeObj,
    });
  }

  componentDidMount() {
    this.logIn();
    const self = this;
    hot = new Handsontable(document.getElementById('hot'), Object.assign(hotConf, {
      contextMenu: {
        callback(key) {
          if (key === 'set_current_time') {
            const [row, col] = this.getSelected();
            this.setDataAtCell(row, col, moment().format('HH:mm'));
          }
        },
        items: {
          set_current_time: {
            name: '現在時刻を入力する',
            disabled() {
              const [startRow, startCol, endRow, endCol] = this.getSelected();
              const prop = this.colToProp(startCol);
              return startRow !== endRow || startCol !== endCol || !(prop === 'endTime' || prop === 'startTime');
            },
          },
          hsep1: '---------',
          row_above: {
            name: '上に行を追加する',
            disabled() {
              return this.getSelected()[0] === 0;
            },
          },
          row_below: {
            name: '下に行を追加する',
          },
          hsep2: '---------',
          remove_row: {
            name: '行を削除する',
            disabled() {
              return this.getSelected()[0] === 0;
            },
          },
        },
      },
      beforeChangeRender() {
        self.setStateFromHot();
      },
      afterCreateRow() {
        self.setStateFromHot();
      },
      afterRemoveRow() {
        self.setStateFromHot();
      },
      afterUpdateSettings() {
        self.setStateFromHot();
      },
    }));
    window.hot = hot;
    this.setStateFromHot();
  }

  setAInitialState() {
    this.setState(initialState);
  }

  setStateFromHot() {
    if (hot) {
      const sourceData = cloneDeep(hot.getSourceData());
      if (JSON.stringify(this.state.allTasks) === JSON.stringify(sourceData)) return;
      this.setState({
        allTasks: sourceData,
      });
    }
  }

  changeUserId(e) {
    this.setState({ userId: e.target.value });
  }

  logIn() {
    // FIXME localstrage実装は暫時対応
    const userId = localStorage.getItem('userId') || this.state.userId;
    if (userId) {
      localStorage.setItem('userId', userId);
      this.setState({ userId });
      // テーブルの初期化
      setTimeout(() => {
        this.fetchTask(this.state.userId, this.state.date).then((snapshot) => {
          if (hot && snapshot.exists()) {
            hot.updateSettings({ data: snapshot.val() });
          }
        });
      }, 0);
      this.closeLoginDialog();
    } else {
      this.openLoginDialog();
    }
  }

  logOut() {
    // FIXME localstrage実装は暫時対応
    localStorage.removeItem('userId');
    // stateの初期化
    this.setAInitialState();
    // テーブルのクリア
    setTimeout(() => {
      if (hot) {
        hot.updateSettings({ data: emptyHotData });
      }
    }, 0);
    this.openLoginDialog();
  }

  openLoginDialog() {
    this.setState({ isOpenLoginDialog: true });
  }

  closeLoginDialog() {
    this.setState({ isOpenLoginDialog: false });
  }

  toggleNotifiable(event, checked) {
    if ('Notification' in window) {
      Notification = checked ? NotificationClone : false;　// eslint-disable-line
      this.setState(() => ({
        notifiable: checked,
      }));
    }
  }

  changeDate(event) {
    if (!hot) return;
    event.persist();
    this.setState(() => ({
      date: event.target.value,
    }));
    this.fetchTask(this.state.userId, event.target.value).then((snapshot) => {
      if (snapshot.exists()) {
        // データが存在していたら読み込む
        hot.updateSettings({ data: snapshot.val() });
      } else {
        // データが存在していないので、テーブルを空にする
        hot.updateSettings({ data: emptyHotData });
      }
    });
  }

  saveHot() {
    if (hot) {
      const sourceData = hot.getSourceData();
      let isEmptyTask = true;
      sourceData.forEach((data) => {
        Object.entries(data).forEach((entry) => {
          if (entry[1]) isEmptyTask = false;
        });
      });
      // タスク一覧に何もデータが入っていなかったら保存しない
      if (!isEmptyTask) {
        this.saveTask(sourceData);
      } else {
        alert('タスクがありません。');
      }
    }
  }

  saveTask(data) {
    const currentMoment = moment();
    const timeObj = {
      hour: currentMoment.hour(),
      minute: currentMoment.minute(),
      second: currentMoment.second(),
    };
    this.setState(() => ({
      loading: true,
      lastSaveTime: timeObj,
    }));
    firebase.database().ref(`/${this.state.userId}/${this.state.date}`).set(data).then(() => {
      setTimeout(() => {
        this.setState(() => ({
          loading: false,
        }));
      }, loadingDuration);
    });
  }

  fetchTask(userId, date) {
    this.setState(() => ({
      loading: true,
    }));
    return firebase.database().ref(`/${userId}/${date}`).once('value').then((snapshot) => {
      setTimeout(() => {
        this.setState(() => ({
          loading: false,
        }));
      }, loadingDuration);
      return snapshot;
    });
  }

  render() {
    return (
      <div>
        <GlobalHeader userId={this.state.userId} logOut={this.logOut.bind(this)} />
        <div className="App">
          <div>
            <Grid container spacing={5}>
              <Dashboad
                date={this.state.date}
                changeDate={this.changeDate.bind(this)}
                allTasks={this.state.allTasks}
              />

              <Grid item xs={12} className="tasklist">
                <Typography gutterBottom type="title">
                  {this.state.date.replace(/-/g, '/')} のタスク一覧
                </Typography>
                <Grid container spacing={5}>
                  <Grid item xs={6}>
                    <FormGroup>
                      <Typography type="caption" gutterBottom>
                         *終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
                      </Typography>
                      <Typography type="caption" gutterBottom>
                         *通知予約されたタスクの開始時刻に <i className="fa fa-clock-o fa-lg" /> が表示されます。(マウスホバーで予約時刻)
                      </Typography>
                      <Typography type="caption" gutterBottom>
                        *開始時刻を削除、もしくは終了を入力すると終了通知の予約は削除されます。
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            disabled={!('Notification' in window)}
                            checked={this.state.notifiable}
                            onChange={this.toggleNotifiable.bind(this)}
                          />
                        }
                        label={`開始したタスクの終了時刻通知${!('Notification' in window) ? '(ブラウザが未対応です。)' : ''}`}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography type="caption" gutterBottom>
                      *セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
                    </Typography>
                    <Typography type="caption" gutterBottom>
                      *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
                    </Typography>
                    <Typography type="caption" gutterBottom>
                        *列ヘッダーにマウスホバーすると各列の説明を見ることができます。
                    </Typography>
                    <div style={{ margin: '15px 0', textAlign: 'right' }}>
                      <Button raised onClick={addTask} color="default">
                        <AddIcon />
                          追加
                      </Button>
                      <Tooltip id="tooltip-top" title={`最終保存時刻 : ${(`00${this.state.lastSaveTime.hour}`).slice(-2)}:${(`00${this.state.lastSaveTime.minute}`).slice(-2)}`} placement="top">
                        <Button raised onClick={this.saveHot.bind(this)} color="default">
                          <SaveIcon />
                         保存
                        </Button>
                      </Tooltip>

                    </div>
                  </Grid>
                  <Grid item xs={12} style={{ paddingTop: 0 }}>
                    <LinearProgress style={{ display: this.state.loading ? 'block' : 'none' }} />
                    <div id="hot" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </div>
        <Dialog open={this.state.isOpenLoginDialog}>
          <DialogTitle>ユーザーIDを入力して下さい</DialogTitle>
          <DialogContent>
            <DialogContentText>
                TaskChute WEB はただいま開発中です。<br />
                しかし一部機能を試していただくことは可能です。<br />
              <br />
                タスクの入力・保存・読み込みはできますが、
                現時点ではユーザー登録を行いませんので、あなた自身でユーザーIDを入力して下さい。<br />
              <br />
                以降、同じユーザーIDを入力すると<br />
                保存したタスクを読み込むことができます。<br />
              <br />
            </DialogContentText>
            <TextField
              value={this.state.userId}
              onChange={this.changeUserId.bind(this)}
              required
              autoFocus
              margin="dense"
              id="userId"
              label="ユーザーID"
              fullWidth
            />
            <Typography type="caption" gutterBottom>
               *ログイン機能実装後に以前に保存したデータは削除されます。あらかじめご了承ください。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.logIn.bind(this)} color="primary">
                はじめる
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default App;
