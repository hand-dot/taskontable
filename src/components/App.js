import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route, withRouter } from 'react-router-dom';

import GlobalHeader from './GlobalHeader';
import Top from './Top';
import Login from './Login';
import Signup from './Signup';
import Taskontable from './Taskontable';

import util from '../util';
import firebaseConf from '../configs/firebase';
import initialState from '../initialState';

firebase.initializeApp(firebaseConf);

function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState.getState();
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const currentUser = firebase.auth().currentUser;
        this.setState({ user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL, uid: currentUser.uid } });
        setTimeout(() => {
          this.props.history.push('/');
        });
      }
    });
  }

  componentDidMount() {

  }

  openHelpDialog() {
    this.setState({ isOpenHelpDialog: true });
  }

  closeHelpDialog() {
    this.setState({ isOpenHelpDialog: false });
  }

  toggleHelpDialog() {
    this.setState({ isOpenHelpDialog: !this.state.isOpenHelpDialog });
  }

  logout() {
    this.props.history.push('/');
    firebase.auth().signOut().then(() => {
      // stateの初期化
      this.setState(initialState.getState());
    }).catch((error) => {
      // FIXME エラーをどこかのサービスに送信したい
      // https://sentry.io/
      console.error(error);
      window.location.reload();
    });
  }

  render() {
    return (
      <div>
        <GlobalHeader
          user={this.state.user}
          isOpenHelpDialog={this.state.isOpenHelpDialog}
          openHelpDialog={this.openHelpDialog.bind(this)}
          closeHelpDialog={this.closeHelpDialog.bind(this)}
          logout={this.logout.bind(this)}
        />
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route
            path="/login"
            render={props => <Login login={login} {...props} />}
          />
          <Route
            exact
            path="/"
            render={(props) => {
              if (!util.isSameObj(this.state.user, initialState.getState().user)) {
                // 認証が初期値から変更されたらアプリをスタート
                return (
                  <Taskontable
                    user={this.state.user}
                    toggleHelpDialog={this.toggleHelpDialog.bind(this)}
                    {...props}
                  />);
              }
              return (<Top />);
            }}
          />
        </Switch>
      </div>
    );
  }
}

App.propTypes = {
  history: PropTypes.object.isRequired,
};


export default withRouter(App);

