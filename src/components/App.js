import * as firebase from "firebase";
import React, { Component } from "react";

import Typography from "material-ui/Typography";
import Grid from "material-ui/Grid";

import GlobalHeader from "./GlobalHeader";
import TodaySummary from "./TodaySummary";
import DatePicker from "./DatePicker";

import Handsontable from "handsontable";
import firebaseConf from "../confings/firebase";
import hotConf from "../confings/hot";
import "../styles/App.css";
import "handsontable/dist/handsontable.full.css";

class App extends Component {
  componentWillMount() {
    firebase.initializeApp(firebaseConf);
    let starCountRef = firebase.database().ref("/test/msg");
    starCountRef.on("value", snapshot => {
      console.log(snapshot.val());
    });
  }
  componentDidMount() {
    let hot = new Handsontable(document.getElementById("hot"), hotConf);
  }
  render() {
    return (
      <div>
        <GlobalHeader />
        <div className="App">
          <div>
            <Grid container spacing={40}>
              <Grid item xs={6}>
                <Typography gutterBottom type="title">
                  今日のサマリ
                </Typography>
                <DatePicker />
                <TodaySummary
                  datas={[
                    { title: "見積もり", hour: 159, task: 6.0 },
                    { title: "消化", hour: 237, task: 9.0 },
                    { title: "残", hour: 262, task: 16.0 }
                  ]}
                />
              </Grid>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  <Typography gutterBottom type="title">
                    終了予定
                  </Typography>
                  <Typography align="justify" type="display2" gutterBottom>
                    22:20
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography gutterBottom type="title">
                    終了予定
                  </Typography>
                  <Typography align="justify" type="display2" gutterBottom>
                    22:20
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
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
