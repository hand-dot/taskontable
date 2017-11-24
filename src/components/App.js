import * as firebase from 'firebase';
import React, { Component } from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Input from 'material-ui/Input';

import GlobalHeader from './GlobalHeader';
import TodaySummary from './TodaySummary';
import DatePicker from './DatePicker';
import CategoryList from './CategoryList';

import firebaseConf from '../confings/firebase';
import hotConf from '../confings/hot';
import '../styles/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      categoryInput: '',
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
    const hot = new Handsontable(document.getElementById('hot'), Object.assign(hotConf, {
    }));
  }

  handleChange(e) {
    this.setState({ categoryInput: e.target.value });
  }

  handleSubmit(e) {
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
  }

  render() {
    return (
      <div>
        <GlobalHeader />
        <div className="App">
          <div>
            <Grid container spacing={40}>
              <Grid item xs={6}>
                <Typography gutterBottom type="subheading">
                  本日のサマリ
                </Typography>
                <DatePicker />
                <TodaySummary
                  data={{
                    estimate: { hour: 8, task: 10 },
                    done: { hour: 4, task: 6 },
                  }}
                />
              </Grid>
              <Grid item xs={3}>
                <Grid item xs={12}>
                  <Typography gutterBottom type="subheading">
                    現在時刻
                  </Typography>
                  <Typography type="display2">16:20</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom type="subheading">
                    終了予定
                  </Typography>
                  <Typography type="display2">22:20</Typography>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <div>
                  <Typography gutterBottom type="subheading">
                    カテゴリ
                  </Typography>
                  <CategoryList categories={this.state.categories} />
                  <form onSubmit={this.handleSubmit.bind(this)}>
                    <Input
                      onChange={this.handleChange.bind(this)}
                      value={this.state.categoryInput}
                    />
                  </form>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom type="headline">
                  タスク一覧
                </Typography>
                <Typography type="caption" gutterBottom>
                  *行を選択、ドラッグアンドドロップすることでタスクを入れ替えることができます。
                </Typography>
                <Typography type="caption" gutterBottom>
                  *セルの上で右クリックすることで行の追加、削除を行うことができます。
                </Typography>
                <div id="hot" />
              </Grid>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
