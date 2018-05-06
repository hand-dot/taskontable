import * as firebase from 'firebase';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import { CircularProgress } from 'material-ui/Progress';
import Snackbar from 'material-ui/Snackbar';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import AsyncContainer from './AsyncContainer';

import firebaseConf from '../configs/firebase';
import '../styles/keyframes.css';
import util from '../util';
import constants from '../constants';

const GlobalHeader = AsyncContainer(() => import('./GlobalHeader').then(module => module.default), {});
const Top = AsyncContainer(() => import('./Top').then(module => module.default), {});
const Login = AsyncContainer(() => import('./Login').then(module => module.default), {});
const Logout = AsyncContainer(() => import('./Logout').then(module => module.default), {});
const Signup = AsyncContainer(() => import('./Signup').then(module => module.default), {});
const Scripts = AsyncContainer(() => import('./Scripts').then(module => module.default), {});
const Settings = AsyncContainer(() => import('./Settings').then(module => module.default), {});
const Taskontable = AsyncContainer(() => import('./Taskontable').then(module => module.default), {});
const WorkSheets = AsyncContainer(() => import('./WorkSheets').then(module => module.default), {});

firebase.initializeApp(firebaseConf);

const styles = {
  root: {
    minHeight: '100vh',
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
};

// constants.authType.EMAIL_AND_PASSWORDの方法でユーザーを登録すると
// displayNameが設定されないため一次的にこの変数に格納する。
let tmpDisplayName = '';

const database = firebase.database();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        displayName: '', photoURL: '', uid: '', email: '',
      },
      isOpenSupportBrowserDialog: false,
      isOpenHelpDialog: false,
      processing: true,
    };
  }

  componentWillMount() {
    // 認証でfirebaseのdefaultのhosturl(https://myapp.firebaseapp.com)にリダイレクトされた場合にURLを書き換える処理
    // https:// stackoverflow.com/questions/34212039/redirect-to-firebase-hosting-custom-domain
    const url = process.env.NODE_ENV === 'production' ? [constants.URL] : [constants.DEVURL1, constants.DEVURL2];
    if (url.indexOf(window.location.origin) === -1) window.location.href = constants.URL;

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // dimension1はgaではuidとしている
        ReactGA.set({ dimension1: user.uid });

        // ログイン後にどこのページからスタートするかをハンドリングする。
        // また、招待されている場合、この処理でチームに参加する。
        const promises = [database.ref(`/users/${user.uid}/settings/`).once('value'), database.ref(`/users/${user.uid}/teams/`).once('value')];
        Promise.all(promises).then((snapshots) => {
          const [settings, teams] = snapshots;
          if (settings.exists()) {
            const mySettings = settings.val();
            this.setState({
              user: {
                displayName: mySettings.displayName, photoURL: mySettings.photoURL, uid: mySettings.uid, email: mySettings.email,
              },
            });
          } else {
            // アカウント作成後の処理
            const mySettings = {
              displayName: user.displayName || tmpDisplayName, photoURL: user.photoURL || '', uid: user.uid, email: user.email,
            };
            this.setState({ user: mySettings });
            // EMAIL_AND_PASSWORDでユーザーを作成した場合、displayNameがnullなので、firebaseのauthで管理しているユーザーのプロフィールを更新する
            if (!user.displayName) user.updateProfile({ displayName: tmpDisplayName });
            database.ref(`/users/${user.uid}/settings/`).set(mySettings);
          }
          if (teams.exists() && teams.val() !== []) return teams.val().concat([user.uid]);// 自分のidと自分のチームのid
          return [user.uid];
        }).then((myWorkSheetsIds) => {
          const pathname = this.props.location.pathname.replace('/', '');
          if (pathname === 'login' || pathname === 'signup') { // ログイン時はワークシートの選択(urlルート)に飛ばす
            this.props.history.push('/');
          } else if (pathname !== '' && !myWorkSheetsIds.includes(pathname)) { // 招待の可能性がある場合の処理
            const teamId = pathname;
            database.ref(`/teams/${teamId}/invitedEmails/`).once('value').then((snapshot) => {
              // 自分のメールアドレスがチームの招待中に存在するかチェックする。
              if (!snapshot.exists() || snapshot.val() === [] || !snapshot.val().includes(user.email)) { // 違った場合はワークシートの選択に飛ばす
                this.props.history.push('/');
                return;
              }
              // 自分が招待されていた場合は自分のチームに加え、チームのメンバーに自分を加える
              Promise.all([database.ref(`/users/${user.uid}/teams/`).once('value'), database.ref(`/teams/${teamId}/users/`).once('value')]).then((snapshots) => {
                const [myTeams, teamUsers] = snapshots;
                return [database.ref(`/users/${user.uid}/teams/`).set((myTeams.exists() ? myTeams.val() : []).concat([teamId])), database.ref(`/teams/${teamId}/users/`).set((teamUsers.exists() ? teamUsers.val() : []).concat([user.uid]))];
              }).then(() => {
                window.location.reload();
              });
            });
          }
        });
      }
      this.setState({ processing: false });
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

  handleUser({ displayName, email, photoURL }) {
    this.setState({ user: Object.assign(this.state.user, { displayName, email, photoURL }) });
  }

  signup({
    type, username, email, password,
  }) {
    tmpDisplayName = username;
    this.setState({ processing: true });
    if (type === constants.authType.EMAIL_AND_PASSWORD) {
      if (!util.validateEmail(email) || password.length < 6) {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'メールアドレスとパスワードを正しく入力してください。' });
        return;
      }
      firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'アカウントを作成しました。' });
      }, () => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'アカウント作成に失敗しました。' });
      });
    }
  }

  login({ type, email, password }) {
    if (util.isSupportBrowser()) {
      this.setState({ processing: true });
      if (type === constants.authType.GOOGLE) {
        firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      } else if (type === constants.authType.EMAIL_AND_PASSWORD) {
        if (!util.validateEmail(email) || password.length < 6) {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'メールアドレスとパスワードを正しく入力してください。' });
          return;
        }
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'ログインしました。' });
        }, () => {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'ログインに失敗しました。' });
        });
      }
    } else {
      this.setState({ isOpenSupportBrowserDialog: true });
    }
  }

  logout() {
    firebase.auth().signOut().then(() => {
      // userの初期化
      this.setState({
        user: {
          displayName: '', photoURL: '', uid: '', email: '',
        },
      });
      this.props.history.push('/logout');
    }).catch((error) => {
      throw new Error(error);
    });
  }

  goSettings() {
    this.props.history.push(`/${this.state.user.uid}/settings`);
  }

  goScripts() {
    this.props.history.push(`/${this.state.user.uid}/scripts`);
  }

  goWorkSheets() {
    this.props.history.push('/');
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
          goSettings={this.goSettings.bind(this)}
          goScripts={this.goScripts.bind(this)}
          goWorkSheets={this.goWorkSheets.bind(this)}
        />
        <Switch>
          <Route exact strict path="/" render={(props) => { if (this.state.user.uid !== '') { return <WorkSheets user={this.state.user} {...props} />; } return (<Top {...props} />); }} />
          <Route exact strict path="/signup" render={props => <Signup signup={this.signup.bind(this)} login={this.login.bind(this)} {...props} />} />
          <Route exact strict path="/login" render={props => <Login login={this.login.bind(this)} {...props} />} />
          <Route exact strict path="/logout" render={props => <Logout {...props} />} />
          <Route exact strict path="/:id" render={(props) => { if (this.state.user.uid !== '') { return <Taskontable userId={this.state.user.uid} userName={this.state.user.displayName} toggleHelpDialog={this.toggleHelpDialog.bind(this)} {...props} />; } return null; }} />
          <Route exact strict path="/:id/scripts" render={(props) => { if (this.state.user.uid !== '') { return <Scripts userId={this.state.user.uid} {...props} />; } return null; }} />
          <Route exact strict path="/:id/settings" render={(props) => { if (this.state.user.uid !== '') { return <Settings user={this.state.user} handleUser={this.handleUser.bind(this)} {...props} />; } return null; }} />
        </Switch>
        <Dialog open={this.state.processing}>
          <CircularProgress className={classes.circularProgress} size={60} />
        </Dialog>
        <Dialog open={this.state.isOpenSupportBrowserDialog}>
          <DialogTitle>サポート対象外ブラウザです</DialogTitle>
          <DialogContent>
            <DialogContentText>
            本サービスは現在{constants.SUPPORTEDBROWSERS}での動作をサポートしております。<br />
            お手数ですが、{constants.SUPPORTEDBROWSERS}で開きなおすか、下記のボタンを押してダウンロードして下さい。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                window.open(constants.CHROME_DL_URL);
                this.setState({ isOpenSupportBrowserDialog: false });
              }}
              color="primary"
              autoFocus
            >
              ダウンロードする
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          message={this.state.snackbarText}
        />
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  history: PropTypes.object.isRequired, // eslint-disable-line
};


export default withRouter(withStyles(styles)(App));

