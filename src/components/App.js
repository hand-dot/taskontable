import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import { CircularProgress } from 'material-ui/Progress';
import Dialog from 'material-ui/Dialog';

import GlobalHeader from './GlobalHeader';
import Top from './Top';
import Login from './Login';
import Signup from './Signup';
import Taskontable from './Taskontable';

import util from '../util';
import firebaseConf from '../configs/firebase';
import initialState from '../initialState';

firebase.initializeApp(firebaseConf);

const styles = {
  root: {
    height: '100%',
  },
  content: {
    overflow: 'hidden',
    padding: 0,
  },
};


class App extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign(initialState.getState(), { loginProggres: true });
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const currentUser = firebase.auth().currentUser;
        this.setState({ user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL, uid: currentUser.uid } });
        setTimeout(() => {
          this.props.history.push('/');
          this.setState({ loginProggres: false });
        });
      } else {
        this.setState({ loginProggres: false });
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

  login() {
    this.setState({ loginProggres: true });
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
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
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GlobalHeader
          user={this.state.user}
          isOpenHelpDialog={this.state.isOpenHelpDialog}
          openHelpDialog={this.openHelpDialog.bind(this)}
          closeHelpDialog={this.closeHelpDialog.bind(this)}
          logout={this.logout.bind(this)}
        />
        <Switch>
          <Route
            path="/signup"
            render={props => <Signup login={this.login.bind(this)} {...props} />}
          />
          <Route
            path="/login"
            render={props => <Login login={this.login.bind(this)} {...props} />}
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
        <Dialog open={this.state.loginProggres}>
          <CircularProgress className={classes.content} size={60} />
        </Dialog>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};


export default withRouter(withStyles(styles)(App));

