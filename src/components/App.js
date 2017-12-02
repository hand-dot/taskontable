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

import GlobalHeader from './GlobalHeader';
import TodaySummary from './TodaySummary';
import DatePicker from './DatePicker';
import CategoryList from './CategoryList';
import Clock from './Clock';


import firebaseConf from '../confings/firebase';
import hotConf from '../confings/hot';
import '../styles/App.css';

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
    const defaultCategories = [{
      text: 'ライフスタイル',
      id: Date.now() + 1,
    },
    {
      text: '業務',
      id: Date.now() + 2,
    },
    {
      text: '雑務',
      id: Date.now() + 3,
    }];
    this.setState(() => ({
      categories: defaultCategories,
      categoryInput: '',
    }));
    updateHotCategory(defaultCategories.map(cat => cat.text));
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

  render() {
    return (
      <div>
        <GlobalHeader />
        <div className="App">
          <div>
            <Grid container spacing={40}>
              <Grid item xs={5}>
                <Typography gutterBottom type="title">
                  本日のサマリ
                </Typography>
                <DatePicker />
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
                    <Clock title={'終了時刻'} caption="*終了時間は残タスクの合計時間です。" moment={this.state.endMoment} updateFlg={false} />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <div>
                  <Typography gutterBottom type="title">
                    カテゴリ
                  </Typography>
                  <Typography type="caption" gutterBottom>
                  *追加・削除したカテゴリはタスク一覧カテゴリ列の選択肢に反映されます。
                  </Typography>
                  <CategoryList categories={this.state.categories} removeCategory={this.removeCategory.bind(this)} />
                  <form onSubmit={this.addCategory.bind(this)}>
                    <Input
                      onChange={this.changeCategoryInput.bind(this)}
                      value={this.state.categoryInput}
                    />
                  </form>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom type="title">
                  タスク一覧
                </Typography>
                <Typography type="caption" gutterBottom>
                  *セルの上で右クリックすることで行の追加、削除を行うこともできます。
                </Typography>
                <Typography type="caption" gutterBottom>
                  *行を選択、ドラッグアンドドロップすることでタスクを入れ替えることができます。
                </Typography>
                <Typography type="caption" gutterBottom>
                  *マウスカーソルを列ヘッダーに上に重ねると各列の説明を見ることができます。
                </Typography>
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
