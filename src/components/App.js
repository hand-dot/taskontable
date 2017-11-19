import * as firebase from "firebase";
import React, { Component } from "react";

import Grid from "material-ui/Grid";

import TodaySummary from "./TodaySummary";

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
      stretchH: "all"
    });
  }
  render() {
    return (
      <div className="App">
        <div>
          <Grid container>
            <Grid item xs={6}>
              <TodaySummary />
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={12}>
              <div id="hot" />
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

export default App;
