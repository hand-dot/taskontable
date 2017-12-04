import cloneDeep from 'lodash.clonedeep';
import * as firebase from 'firebase';
import React, { Component } from 'react';
import moment from 'moment';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import Button from 'material-ui/Button';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import { LinearProgress } from 'material-ui/Progress';

import GlobalHeader from './GlobalHeader';
import TodaySummary from './TodaySummary';
import DatePicker from './DatePicker';
import CategoryList from './CategoryList';
import Clock from './Clock';

import firebaseConf from '../confings/firebase';
import hotConf from '../confings/hot';
import '../styles/App.css';

const NotificationClone = (() => ('Notification' in window ? cloneDeep(Notification) : false))();
firebase.initializeApp(firebaseConf);

let hot;

function updateHotCategory(source) {
  const $hotConf = cloneDeep(hotConf);
  $hotConf.columns[$hotConf.columns.findIndex(col => col.data === 'category')].source = source;
  if (hot) hot.updateSettings({ columns: $hotConf.columns });
}

function addTask() {
  if (hot) {
    hot.alter('insert_row');
  }
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      notifiable: true,
      date: moment().format('YYYY-MM-DD'),
      estimateTasks: { minute: 0, taskNum: 0 },
      doneTasks: { minute: 0, taskNum: 0 },
      actuallyTasks: { minute: 0, taskNum: 0 },
      remainingTasks: { minute: 0, taskNum: 0 },
      endMoment: moment(), // FIXME!! issues #22
      categories: [],
      categoryInput: '',
      allTasks: [],
      openingUserIdDialog: false,
      userId: '',
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.openUserIdDialog();
    const self = this;
    hot = new Handsontable(document.getElementById('hot'), Object.assign(hotConf, {
      beforeChangeRender() {
        self.setStateFromHot();
      },
      afterCreateRow() {
        self.setStateFromHot();
      },
      afterRemoveRow() {
        self.setStateFromHot();
      },
    }));
    this.setStateFromHot();
    this.setDefaultCategories();
  }

  setStateFromHot() {
    const sourceData = hot.getSourceData();
    const estimateData = sourceData;
    const estimateMinute = sourceData.map(data => (typeof data.estimate === 'number' ? data.estimate : 0)).reduce((p, c) => p + c, 0);
    const doneData = sourceData.filter(data => data.done);
    const doneMinute = doneData.map(data => (typeof data.estimate === 'number' ? data.estimate : 0)).reduce((p, c) => p + c, 0);
    const actuallyData = doneData;
    const actuallyMinute = actuallyData.map(data => (typeof data.actually === 'number' ? data.actually : 0)).reduce((p, c) => p + c, 0);
    const remainingData = sourceData.filter(data => !data.done);
    const remainingMinute = remainingData.map(data => (typeof data.estimate === 'number' ? data.estimate : 0)).reduce((p, c) => p + c, 0);

    this.setState(() => ({
      allTasks: sourceData,
      estimateTasks: { minute: estimateMinute, taskNum: estimateData.length },
      doneTasks: { minute: doneMinute, taskNum: doneData.length },
      actuallyTasks: { minute: actuallyMinute, taskNum: actuallyData.length },
      remainingTasks: { minute: remainingMinute, taskNum: remainingData.length },
      endMoment: moment().add(remainingMinute, 'minutes'),
    }));
  }

  setDefaultCategories() {
    const labels = ['生活', '業務', '雑務', '休憩'];
    const timestamp = Date.now();
    const defaultCategories = labels.map((label, index) => ({ id: timestamp + index, text: label }));
    this.setState(() => ({
      categories: defaultCategories,
      categoryInput: '',
    }));
    updateHotCategory(defaultCategories.map(cat => cat.text));
  }

  changeDate(event) {
    if (!hot) return;
    event.persist();
    this.setState(() => ({
      date: event.target.value,
      loading: true,
    }));
    firebase.database().ref(`/${this.state.userId}/${event.target.value}`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        // データが存在していたら読み込む
        hot.updateSettings({ data: snapshot.val() });
      } else {
        // データが存在していないので、データを空にする
        hot.updateSettings({ data: {} });
      }
      this.setState(() => ({
        loading: false,
      }));
      this.setStateFromHot();      
    });
  }

  changeCategoryInput(e) {
    this.setState({ categoryInput: e.target.value });
  }

  addCategory(e) {
    e.preventDefault();
    if (!this.state.categoryInput.length) {
      return;
    }
    const newItem = {
      text: this.state.categoryInput,
      id: Date.now(),
    };
    this.setState(prevState => ({
      categories: prevState.categories.concat(newItem),
      categoryInput: '',
    }));
    updateHotCategory(this.state.categories.concat(newItem).map(cat => cat.text));
  }

  removeCategory(index) {
    const categories = cloneDeep(this.state.categories);
    categories.splice(index, 1);
    this.setState(() => ({
      categories,
    }));
    updateHotCategory(categories.map(cat => cat.text));
  }

  toggleNotifiable(event, checked) {
    if ('Notification' in window) {
      Notification = checked ? NotificationClone : false;
      this.setState(() => ({
        notifiable: checked,
      }));
    }
  }

  saveTask() {
    if (hot) {
      const sourceData = hot.getSourceData();
      let isEmpty = true;
      sourceData.forEach((data) => {
        Object.entries(data).forEach((entry) => {
          if (entry[1]) isEmpty = false;
        });
      });
      // タスク一覧に何もデータが入っていなかったら保存しない
      if (!isEmpty) {
        this.setState(() => ({
          loading: true,
        }));
        firebase.database().ref(`/${this.state.userId}/${this.state.date}`).set(sourceData).then(() => {
          alert(`${this.state.date} のタスク一覧を保存しました。`);
          this.setState(() => ({
            loading: false,
          }));
        });
      } else {
        alert('タスクがありません。');
      }
    }
  }

  openUserIdDialog() {
    this.setState({ openingUserIdDialog: true });
  }

  closeUserIdDialog() {
    if (this.state.userId !== '') {
      // データの初回読み込み
      firebase.database().ref(`/${this.state.userId}/${this.state.date}`).once('value').then((snapshot) => {
        if (snapshot.exists()) {
          hot.updateSettings({ data: snapshot.val() });
        }
        this.setState(() => ({
          loading: false,
          openingUserIdDialog: false,
        }));
      });
    }
  }

  changeUserId(e) {
    this.setState({ userId: e.target.value });
  }

  render() {
    return (
      <div>
        <GlobalHeader userId={this.state.userId} />
        <div className="App">
          <div>
            <Grid container spacing={5}>
              <Grid item xs={12} className="dashboad">
                <ExpansionPanel defaultExpanded>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>ダッシュボード</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid item xs={4}>
                      <Typography gutterBottom type="title">
                        本日のサマリ
                      </Typography>
                      <DatePicker value={this.state.date} changeDate={this.changeDate.bind(this)} />
                      <TodaySummary
                        data={{
                          estimateTasks: this.state.estimateTasks,
                          doneTasks: this.state.doneTasks,
                          actuallyTasks: this.state.actuallyTasks,
                          remainingTasks: this.state.remainingTasks,
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography gutterBottom type="title">
                       時刻
                      </Typography>
                      <Grid container spacing={5}>
                        <Grid item xs={6}>
                          <Clock title={'現在時刻'} moment={moment()} updateFlg />
                        </Grid>
                        <Grid item xs={6}>
                          <Clock title={'終了時刻*'} caption="*残タスクの合計時間" moment={this.state.endMoment} />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography title="*追加・削除したカテゴリはタスク一覧カテゴリ列の選択肢に反映されます。" gutterBottom type="title">
                        カテゴリ*
                      </Typography>
                      <CategoryList categories={this.state.categories} removeCategory={this.removeCategory.bind(this)} />
                      <form onSubmit={this.addCategory.bind(this)}>
                        <Input
                          placeholder="カテゴリを追加"
                          onChange={this.changeCategoryInput.bind(this)}
                          value={this.state.categoryInput}
                        />
                      </form>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </Grid>
              <Grid item xs={12} className="tasklist">
                <Typography gutterBottom type="title">
                  {this.state.date.replace(/-/g, '/')} のタスク一覧
                </Typography>
                <Grid container spacing={5}>
                  <Grid item xs={6}>
                    <FormGroup>
                      <Typography type="caption" gutterBottom>
                         *通知予約を行うには見積を入力したタスクの開始時刻を入力(変更)してください。
                      </Typography>
                      <Typography type="caption" gutterBottom>
                         *通知が予約されたら開始時刻のセルに　[ ! ]　マークがつきます。
                      </Typography>
                      <Typography type="caption" gutterBottom>
                        *開始時刻を削除、もしくは終了時刻を入力すると予約を削除することができます。
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
                      *セル上で右クリックすることで行の追加・削除を行うことができます。
                    </Typography>
                    <Typography type="caption" gutterBottom>
                      *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
                    </Typography>
                    <Typography type="caption" gutterBottom>
                        *マウスカーソルを列ヘッダーに上に重ねると各列の説明を見ることができます。
                    </Typography>
                    <div style={{ margin: '15px 0', textAlign: 'right' }}>
                      <Button raised onClick={addTask} color="default">
                        <AddIcon />
                          追加
                      </Button>
                      <Button raised onClick={this.saveTask.bind(this)} color="default">
                        <SaveIcon />
                         保存
                      </Button>
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


        <Dialog open={this.state.openingUserIdDialog} onRequestClose={this.closeUserIdDialog.bind(this)}>
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
            <Button onClick={this.closeUserIdDialog.bind(this)} color="primary">
                はじめる
            </Button>
          </DialogActions>
        </Dialog>


      </div>
    );
  }
}

export default App;
