import * as firebase from "firebase";
import React, { Component } from "react";

import Typography from "material-ui/Typography";
import Grid from "material-ui/Grid";

import GlobalHeader from "./GlobalHeader";
import TodaySummary from "./TodaySummary";
import DatePicker from "./DatePicker";

import Handsontable from "handsontable";
import firebaseConf from "../confings/firebase";
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
    let hot = new Handsontable(document.getElementById("hot"), {
      stretchH: "all",
      rowHeaders: true,
      manualRowMove: true,
      colWidths: Math.round(window.innerWidth / 9),
      columns: [
        {
          title: "済",
          data: "done",
          type: "checkbox",
          colWidths: 30,
          readOnly: true,
          className: "htCenter htMiddle"
        },
        {
          title: "カテゴリ",
          data: "category",
          type: "text"
        },
        {
          title: "タイトル",
          data: "title",
          type: "text"
        },
        {
          title: "見積(分)",
          data: "estimate",
          type: "numeric"
        },
        {
          title: "実績(分)",
          data: "actually",
          type: "numeric",
          readOnly: true
        },
        {
          title: "開始時刻",
          type: "time",
          timeFormat: "hh:mm a",
          correctFormat: true
        },
        {
          title: "終了時刻",
          type: "time",
          timeFormat: "hh:mm a",
          correctFormat: true
        },
        {
          title: "備考",
          type: "text"
        },
        {
          title: "感想",
          type: "text"
        }
      ]
    });
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
                <Typography gutterBottom type="title">
                  終了予定
                </Typography>
                <Typography align="justify" type="display3" gutterBottom>
                  22:20
                </Typography>
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
