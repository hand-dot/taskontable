import * as firebase from 'firebase';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import { CircularProgress } from 'material-ui/Progress';
import Dialog from 'material-ui/Dialog';
import AsyncContainer from './AsyncContainer';

import firebaseConf from '../configs/firebase';
import '../styles/keyframes.css';
import constants from '../constants';

const GlobalHeader = AsyncContainer(() => import('./GlobalHeader').then(module => module.default), {});
const Top = AsyncContainer(() => import('./Top').then(module => module.default), {});
const Login = AsyncContainer(() => import('./Login').then(module => module.default), {});
const Signup = AsyncContainer(() => import('./Signup').then(module => module.default), {});
const Scripts = AsyncContainer(() => import('./Scripts').then(module => module.default), {});
const Taskontable = AsyncContainer(() => import('./Taskontable').then(module => module.default), {});

firebase.initializeApp(firebaseConf);

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    overflow: 'hidden',
    padding: 0,
  },
};


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: { displayName: '', photoURL: '', uid: '' },
      isOpenHelpDialog: false,
      loginProggres: true,
    };
  }

  componentWillMount() {
    // 認証でfirebaseのdefaultのhosturl(https://myapp.firebaseapp.com)にリダイレクトされた場合にURLを書き換える処理
    // https://stackoverflow.com/questions/34212039/redirect-to-firebase-hosting-custom-domain
    const url = process.env.NODE_ENV === 'production' ? constants.URL : constants.DEVURL;
    if (window.location.origin !== url) window.location.href = constants.URL;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const currentUser = firebase.auth().currentUser;
        this.setState({ user: { displayName: currentUser.displayName, photoURL: currentUser.photoURL, uid: currentUser.uid } });
        // dimension1はgaではuidとしている
        ReactGA.set({ dimension1: currentUser.uid });
        setTimeout(() => {
          this.props.history.push('/');
          this.setState({ loginProggres: false });
        });
      } else {
        this.setState({ loginProggres: false });
      }
    });

    this.props.history.push('/top');
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
    firebase.auth().signOut().then(() => {
      // userの初期化
      this.setState({ user: { displayName: '', photoURL: '', uid: '' } });
      this.props.history.push('/top');
    }).catch((error) => {
      setTimeout(() => window.location.reload());
      throw new Error(error);
    });
  }

  goScripts() {
    this.props.history.push('scripts');
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
          goScripts={this.goScripts.bind(this)}
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
            path="/scripts"
            render={(props) => {
              if (this.state.user.uid !== '') {
                return <Scripts user={this.state.user} {...props} />;
              }
              return null;
            }}
          />
          <Route
            path="/top"
            render={props => <Top {...props} />}
          />
          <Route
            exact
            path="/"
            render={(props) => {
              if (this.state.user.uid !== '') {
                // 認証が初期値から変更されたらアプリをスタート
                return (
                  <Taskontable
                    user={this.state.user}
                    toggleHelpDialog={this.toggleHelpDialog.bind(this)}
                    {...props}
                  />);
              }
              return (<Login login={this.login.bind(this)} />);
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
  classes: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
};


export default withRouter(withStyles(styles)(App));

