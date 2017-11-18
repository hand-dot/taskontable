import * as firebase from 'firebase';
import React, { Component } from 'react';
import Button from 'material-ui/Button'
import Handsontable from 'handsontable';
import firebaseConf from './conf/firebase';
import logo from './logo.svg';
import './App.css';
import 'handsontable/dist/handsontable.full.css';

class App extends Component {
  componentWillMount(){
    let app = firebase.initializeApp({});
  }
  componentDidMount() {
    let hot = new Handsontable(document.getElementById('hot'), {});
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div id="hot" />
        <Button raised color="primary">
          Hello World
        </Button>
      </div>
    );
  }
}

export default App;
