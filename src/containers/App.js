import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider } from 'material-ui/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import { CircularProgress } from 'material-ui/Progress';
import Dialog from 'material-ui/Dialog';
import AsyncContainer from './AsyncContainer';

import firebaseConf from '../configs/firebase';
import theme from '../assets/theme';
import '../styles/keyframes.css';

const GlobalHeader = AsyncContainer(() => import('./GlobalHeader').then(module => module.default), {});
const Top = AsyncContainer(() => import('./Top').then(module => module.default), {});
const Login = AsyncContainer(() => import('./Login').then(module => module.default), {});
const Signup = AsyncContainer(() => import('./Signup').then(module => module.default), {});
const Taskontable = AsyncContainer(() => import('./Taskontable').then(module => module.default), {});

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
    this.state = {
      user: { displayName: '', photoURL: '', uid: '' },
      isOpenHelpDialog: false,
      loginProggres: true,
    };
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
      // userの初期化
      this.setState({ user: { displayName: '', photoURL: '', uid: '' } });
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
      <MuiThemeProvider theme={theme}>
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
                if (this.state.user.uid !== '') {
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
      </MuiThemeProvider>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired,
};


export default withRouter(withStyles(styles)(App));

