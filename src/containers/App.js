import { firebase } from '@firebase/app';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import localforage from 'localforage';
import { withStyles } from '@material-ui/core/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import '../styles/keyframes.css';
import util from '../util';
import constants from '../constants';

import GlobalHeader from './GlobalHeader';
import Top from './Top';
import Login from './Login';
import Logout from './Logout';
import Signup from './Signup';
import Scripts from './Scripts';
import Activity from './Activity';
import Settings from './Settings';
import WorkSheet from './WorkSheet';
import WorkSheetList from './WorkSheetList';

const messaging = util.getMessaging();
const auth = util.getAuth();
const database = util.getDatabase();

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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        displayName: '', photoURL: '', uid: '', email: '', fcmToken: '',
      },
      isOpenSupportBrowserDialog: false,
      isOpenHelpDialog: false,
      processing: true,
    };
  }

  componentWillMount() {
    // 認証でfirebaseのdefaultのhosturl(https://myapp.firebaseapp.com)にリダイレクトされた場合にURLを書き換える処理
    // https:// stackoverflow.com/questions/34212039/redirect-to-firebase-hosting-custom-domain
    if ((process.env.NODE_ENV === 'production' ? [constants.URL] : [constants.DEVURL1, constants.DEVURL2]).indexOf(window.location.origin) === -1) {
      window.location.href = constants.URL;
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          user: {
            displayName: '', photoURL: '', uid: user.uid, email: '', fcmToken: '',
          },
        });
        // dimension1はgaではuidとしている
        if (process.env.NODE_ENV !== 'development') {
          ReactGA.set({ dimension1: user.uid });
        }

        // トークン更新のモニタリング
        if (messaging) { // iOSはPush Notificationsが未実装なので、firebase.messaging();で落ちるためこのifが必要。
          messaging.onTokenRefresh(() => {
            messaging.getToken().then((refreshedToken) => {
              database.ref(`/${constants.API_VERSION}/users/${user.uid}/settings/fcmToken`).set(refreshedToken);
            }).catch((err) => {
              throw new Error(`トークン更新のモニタリングに失敗: ${err}`);
            });
          });
          // フォアグラウンド時に通知をハンドリングする処理
          messaging.onMessage((payload) => {
            const { data } = payload;
            const url = new URL(payload.data.url);
            localforage.setItem(`recentMessage.${url.pathname.replace('/', '')}`, { icon: payload.data.icon, body: payload.data.body, createdAt: new Date() });
            const notifi = new Notification(data.title, { icon: data.icon, body: data.body });
            notifi.onclick = () => {
              notifi.close();
              // url.pathnameに直に飛ばしたいがルーターがうまく動かないので一度ルートに飛ばす
              this.props.history.push('/');
              setTimeout(() => { this.props.history.push(`${url.pathname}`); });
            };
          });
        }

        // ログイン後にどこのページからスタートするかをハンドリングする。
        // また、招待されている場合、この処理でワークシートに参加する。
        let mySettings;
        Promise.all([
          database.ref(`/${constants.API_VERSION}/users/${user.uid}/settings/`).once('value'),
          database.ref(`/${constants.API_VERSION}/users/${user.uid}/worksheets/`).once('value'),
          messaging ? messaging.requestPermission().then(() => messaging.getToken()).catch(() => '') : '',
        ]).then((snapshots) => {
          const [settings, worksheets, fcmToken] = snapshots;
          if (settings.exists()) {
            mySettings = settings.val();
            // fcmTokenは更新されている可能性を考えて空じゃない場合ログイン後、必ず更新する。
            if (fcmToken) database.ref(`/${constants.API_VERSION}/users/${user.uid}/settings/fcmToken`).set(fcmToken);
          } else {
            // アカウント作成後の処理
            mySettings = {
              displayName: user.displayName || tmpDisplayName, photoURL: user.photoURL || '', uid: user.uid, email: user.email, fcmToken,
            };
            // EMAIL_AND_PASSWORDでユーザーを作成した場合、displayNameがnullなので、firebaseのauthで管理しているユーザーのプロフィールを更新する
            if (!user.displayName) user.updateProfile({ displayName: tmpDisplayName });
            database.ref(`/${constants.API_VERSION}/users/${user.uid}/settings/`).set(mySettings);
          }
          return (worksheets.exists() && worksheets.val() !== []) ? worksheets.val().concat([user.uid]) : [user.uid]; // 自分のidと自分のワークシートのid or 自分のid
        }).then((myWorkSheetListIds) => {
          const pathname = encodeURI(this.props.location.pathname.replace('/', ''));
          const fromInviteEmail = util.getQueryVariable('worksheet') !== '';
          if (!fromInviteEmail && ['login', 'signup', 'index.html'].includes(pathname)) { // ■ログイン時
            this.props.history.push('/');
            return Promise.resolve();
          } else if (myWorkSheetListIds.includes(pathname)) { // ■既に参加しているワークシートの場合
            return Promise.resolve();
          } else if (pathname !== '' && fromInviteEmail) { // ■招待の可能性がある場合の処理
            const worksheetId = fromInviteEmail ? encodeURI(util.getQueryVariable('worksheet')) : pathname;
            return database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/invitedEmails/`).once('value').then((invitedEmails) => {
              // 自分のメールアドレスがワークシートの招待中メールアドレスリストに存在するかチェックする。
              if (!invitedEmails.exists() || !Array.isArray(invitedEmails.val()) || !(invitedEmails.val().includes(user.email))) {
                this.props.history.push('/'); // 違った場合はワークシートの選択に飛ばす
                return Promise.resolve();
              }
              // 自分が招待されていた場合は自分のワークシートに加え、ワークシートのメンバーに自分を加える
              return Promise.all([
                database.ref(`/${constants.API_VERSION}/users/${user.uid}/worksheets/`).once('value'),
                database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members/`).once('value'),
              ]).then((snapshots) => {
                const [myWorksheetIds, worksheetUserIds] = snapshots;
                const promises = [
                  database.ref(`/${constants.API_VERSION}/users/${user.uid}/worksheets/`).set((myWorksheetIds.exists() ? myWorksheetIds.val() : []).concat([worksheetId])), // 自分の参加しているワークシートにワークシートのidを追加
                  database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members/`).set((worksheetUserIds.exists() ? worksheetUserIds.val() : []).concat([user.uid])), // 参加しているワークシートのユーザーに自分のidを追加
                  database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/invitedEmails/`).set(invitedEmails.val().filter(email => email !== user.email)), // 参加しているワークシート招待中メールアドレスリストから削除
                ];
                return Promise.all(promises);
              }).then(() => {
                this.props.history.push(`/${worksheetId}`);
                return Promise.resolve();
              });
            });
          }
          return Promise.resolve();
        }).then(() => { this.setState({ processing: false, user: mySettings }); });
      } else {
        this.setState({ processing: false });
      }
    });
  }

  componentDidMount() {
  }

  handleUser({ displayName, email, photoURL }) {
    this.setState({ user: Object.assign(this.state.user, { displayName, email, photoURL }) });
  }

  signup({
    type, username, email, password,
  }) {
    this.setState({ processing: true });
    if (type === constants.authType.EMAIL_AND_PASSWORD) {
      if (username === '') {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'ユーザー名を入力してください。' });
        return;
      }
      if (!util.validateEmail(email) || password.length < 6) {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'メールアドレスとパスワードを正しく入力してください。' });
        return;
      }
      tmpDisplayName = username;
      auth.createUserWithEmailAndPassword(email, password).then(() => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'アカウントを作成しました。' });
      }, (e) => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'アカウント作成に失敗しました。' });
        throw new Error(`アカウント作成に失敗:${e}`);
      });
    }
  }

  login({ type, email, password }) {
    if (util.isSupportBrowser()) {
      this.setState({ processing: true });
      if (type === constants.authType.GOOGLE) {
        auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
      } else if (type === constants.authType.EMAIL_AND_PASSWORD) {
        if (!util.validateEmail(email) || password.length < 6) {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: 'メールアドレスとパスワードを正しく入力してください。' });
          return;
        }
        auth.signInWithEmailAndPassword(email, password).then(() => {
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
    auth.signOut().then(() => {
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

  goWorkSheetList() {
    this.props.history.push('/');
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <GlobalHeader
          user={this.state.user}
          isOpenHelpDialog={this.state.isOpenHelpDialog}
          openHelpDialog={() => { this.setState({ isOpenHelpDialog: true }); }}
          closeHelpDialog={() => { this.setState({ isOpenHelpDialog: false }); }}
          logout={this.logout.bind(this)}
          goSettings={this.goSettings.bind(this)}
          goWorkSheetList={this.goWorkSheetList.bind(this)}
        />
        <Switch>
          <Route exact strict path="/" render={(props) => { if (this.state.user.uid !== '') { return <WorkSheetList user={this.state.user} {...props} />; } return (<Top {...props} />); }} />
          <Route exact strict path="/signup" render={props => <Signup signup={this.signup.bind(this)} login={this.login.bind(this)} {...props} />} />
          <Route exact strict path="/login" render={props => <Login login={this.login.bind(this)} {...props} />} />
          <Route exact strict path="/logout" render={props => <Logout {...props} />} />
          <Route
            exact
            strict
            path="/:id"
            render={props => (<WorkSheet
              userId={this.state.user.uid}
              userName={this.state.user.displayName}
              userPhotoURL={this.state.user.photoURL}
              toggleHelpDialog={() => { this.setState({ isOpenHelpDialog: !this.state.isOpenHelpDialog }); }}
              {...props}
            />)}
          />
          <Route exact strict path="/:id/scripts" render={(props) => { if (this.state.user.uid !== '') { return <Scripts userId={this.state.user.uid} {...props} />; } return null; }} />
          <Route exact strict path="/:id/activity" render={(props) => { if (this.state.user.uid !== '') { return <Activity userId={this.state.user.uid} {...props} />; } return null; }} />
          <Route exact strict path="/:id/settings" render={(props) => { if (this.state.user.uid !== '') { return <Settings user={this.state.user} handleUser={this.handleUser.bind(this)} {...props} />; } return null; }} />
        </Switch>
        <Dialog open={this.state.processing}>
          <div style={{ padding: this.props.theme.spacing.unit }}><CircularProgress className={classes.circularProgress} size={40} /></div>
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
  location: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};


export default withRouter(withStyles(styles, { withTheme: true })(App));

