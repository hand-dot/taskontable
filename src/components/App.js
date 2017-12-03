import cloneDeep from 'lodash.clonedeep';
import * as firebase from 'firebase';
import React, { Component } from 'react';
import moment from 'moment';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';
import Switch from 'material-ui/Switch';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';


import GlobalHeader from './GlobalHeader';
import TodaySummary from './TodaySummary';
import DatePicker from './DatePicker';
import CategoryList from './CategoryList';
import Clock from './Clock';


import firebaseConf from '../confings/firebase';
import hotConf from '../confings/hot';
import '../styles/App.css';

const NotificationClone = (() => ('Notification' in window ? cloneDeep(Notification) : false))();

let hot;
function updateHotCategory(source) {
  const $hotConf = cloneDeep(hotConf);
  $hotConf.columns[$hotConf.columns.findIndex(col => col.data === 'category')].source = source;
  if (hot) {
    hot.updateSettings({
      columns: $hotConf.columns,
    });
  }
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
      notifiable: true,
      date: moment().format('YYYY-MM-DD'),
      estimateTasks: { minute: 0, taskNum: 0 },
      doneTasks: { minute: 0, taskNum: 0 },
      actuallyTasks: { minute: 0, taskNum: 0 },
      remainingTasks: { minute: 0, taskNum: 0 },
      endMoment: moment(), // FIXME momentオブジェクトをstateで持つのは違和感がある
      categories: [],
      categoryInput: '',
      allTasks: [],
    };
  }

  componentWillMount() {
    firebase.initializeApp(firebaseConf);
    const starCountRef = firebase.database().ref('/test/msg');
    starCountRef.on('value', (snapshot) => {
      console.log(snapshot.val());
    });
  }

  componentDidMount() {
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
    event.persist();
    this.setState({ date: event.target.value });
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

  render() {
    return (
      <div>
        <GlobalHeader />
        <div className="App">
          <div>
            <Grid container spacing={40}>
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
                      <Grid container spacing={40}>
                        <Grid item xs={6}>
                          <Clock title={'現在時刻'} moment={moment()} updateFlg />
                        </Grid>
                        <Grid item xs={6}>
                          <Clock title={'終了時刻*'} caption="*残タスクの合計時間" moment={this.state.endMoment} updateFlg={false} />
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
              <Grid item xs={6}>
                <Typography gutterBottom type="title">
                  タスク一覧
                </Typography>
                <Typography type="caption" gutterBottom>
                  *セル上で右クリックすることで行の追加・削除を行うことができます。
                </Typography>
                <Typography type="caption" gutterBottom>
                  *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
                </Typography>
                <Typography type="caption" gutterBottom>
                  *マウスカーソルを列ヘッダーに上に重ねると各列の説明を見ることができます。
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <FormGroup>
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
                  <Typography type="caption" gutterBottom>
                    *通知予約を行うには見積を入力したタスクの開始時刻を入力(変更)してください。
                  </Typography>
                  <Typography type="caption" gutterBottom>
                    *通知が予約されたら開始時刻のセルに　[ ! ]　マークがつきます。
                  </Typography>
                  <Typography type="caption" gutterBottom>
                    *開始時刻を削除、もしくは終了時刻を入力すると予約を削除することができます。
                  </Typography>
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <div id="hot" />
              </Grid>
              <Grid container justify="center">
                <Button onClick={addTask} color="default">
                  <AddIcon />
                    タスクを追加する
                </Button>
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
