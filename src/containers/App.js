import { firebase } from '@firebase/app';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import PropTypes from 'prop-types';
import localforage from 'localforage';
import { withStyles } from '@material-ui/core/styles';
import { Switch, Route, withRouter } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Drawer from '@material-ui/core/Drawer';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Add from '@material-ui/icons/Add';
import Close from '@material-ui/icons/Close';

import '../styles/keyframes.css';
import util from '../util';
import i18n from '../i18n';
import constants from '../constants';

import GlobalHeader from './GlobalHeader';
import Top from './Top';
import PrivacyPolicyTermsOfService from './PrivacyPolicyTermsOfService';
import Login from './Login';
import Logout from './Logout';
import Signup from './Signup';
import Scripts from './Scripts';
import Activity from './Activity';
import Settings from './Settings';
import WorkSheet from './WorkSheet';
import Hello from './Hello';

const messaging = util.getMessaging();
const auth = util.getAuth();
const database = util.getDatabase();

const styles = theme => ({
  root: {
    minHeight: '100vh',
    flexGrow: 1,
    zIndex: 1,
    position: 'relative',
    display: 'flex',
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    position: 'relative',
    minHeight: '100vh',
    width: constants.SIDEBAR_WIDTH,
    backgroundColor: 'transparent',
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
  content: {
    flexGrow: 1,
    minWidth: 0, // So the Typography noWrap works
  },
});

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
      worksheets: [], // 自分の所属しているワークシートの一覧
      newWorksheetName: '',
      isOpenSidebar: false,
      isOpenCreateWorksheetModal: false,
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
          isOpenSidebar: !util.isMobile(),
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
              throw new Error(`Fail Token Update Monitoring: ${err}`);
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
          // ワークシートの一覧を取得
          if (worksheets.exists() && worksheets.val() !== []) {
            Promise.all(worksheets.val().map(id => database.ref(`/${constants.API_VERSION}/worksheets/${id}/name/`).once('value'))).then((worksheetNames) => {
              this.setState({ worksheets: worksheetNames.map((worksheetName, index) => ({ id: worksheets.val()[index], name: worksheetName.exists() && worksheetName.val() ? worksheetName.val() : 'Unknown' })) });
            });
          }
          return (worksheets.exists() && worksheets.val() !== []) ? worksheets.val() : []; // 自分のワークシートのid
        }).then((workSheetListIds) => {
          const pathname = util.formatURLString(this.props.location.pathname.replace('/', ''));
          const fromInviteEmail = util.getQueryVariable('worksheet') !== '';
          if (!fromInviteEmail && ['login', 'signup'].includes(pathname)) { // ■ログイン時
            this.props.history.push('/');
            return Promise.resolve();
          } else if (workSheetListIds.includes(pathname)) { // ■既に参加しているワークシートの場合
            return Promise.resolve();
          } else if (pathname !== '' && fromInviteEmail) { // ■招待の可能性がある場合の処理
            const worksheetId = fromInviteEmail ? util.formatURLString(util.getQueryVariable('worksheet')) : pathname;
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
                const [worksheetIds, worksheetUserIds] = snapshots;
                // ワークシートの一覧を再取得
                if (worksheetIds.exists() && worksheetIds.val() !== []) {
                  Promise.all(worksheetIds.val().map(id => database.ref(`/${constants.API_VERSION}/worksheets/${id}/name/`).once('value'))).then((worksheetNames) => {
                    this.setState({ worksheets: worksheetNames.map((worksheetName, index) => ({ id: worksheetIds.val()[index], name: worksheetName.exists() && worksheetName.val() ? worksheetName.val() : 'Unknown' })) });
                  });
                }
                const promises = [
                  database.ref(`/${constants.API_VERSION}/users/${user.uid}/worksheets/`).set((worksheetIds.exists() ? worksheetIds.val() : []).concat([worksheetId])), // 自分の参加しているワークシートにワークシートのidを追加
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
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('validation.must_target', { target: i18n.t('common.userName') }) });
        return;
      }
      if (!util.validateEmail(email) || password.length < 6) {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('validation.must_pair1_pair2', { pair1: i18n.t('common.emailAddress'), pair2: i18n.t('common.password') }) });
        return;
      }
      tmpDisplayName = username;
      auth.createUserWithEmailAndPassword(email, password).then(() => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('app.createdAnAccount') });
      }, (e) => {
        this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('app.failedAccountCreation') });
        throw new Error(`Fail Create Account:${e}`);
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
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('validation.must_pair1_pair2', { pair1: i18n.t('common.emailAddress'), pair2: i18n.t('common.password') }) });
          return;
        }
        auth.signInWithEmailAndPassword(email, password).then(() => {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('app.loggedIn') });
        }, () => {
          this.setState({ processing: false, isOpenSnackbar: true, snackbarText: i18n.t('app.failedToLogin') });
        });
      }
    } else {
      this.setState({ isOpenSupportBrowserDialog: true });
    }
  }

  logout() {
    // userの初期化
    this.setState({
      user: {
        displayName: '', photoURL: '', uid: '', email: '', fcmToken: '',
      },
      worksheets: [],
      isOpenSidebar: false,
    });
    auth.signOut().then(() => {
      this.props.history.push('/logout');
    }).catch((error) => {
      throw new Error(error);
    });
  }

  createWorksheet() {
    if (this.state.newWorksheetName === '') {
      alert(i18n.t('validation.must_target', { target: i18n.t('common.worksheetName') }));
      return;
    }
    if (!util.validateDatabaseKey(this.state.newWorksheetName)) {
      alert(i18n.t('validation.containsForbiddenCharacter_target', { target: i18n.t('common.worksheetName') }));
      return;
    }
    // ワークシートのIDはシート名をtoLowerCaseしてencodeURIしたものにするシート名はシート名で別管理する
    const newWorksheetId = util.formatURLString(this.state.newWorksheetName);
    // ワークシートのIDが存在しない場合は作成できる。
    database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        alert(i18n.t('validation.cantCreate_target', { target: i18n.t('common.worksheetName') }));
      } else {
        Promise.all([
          database.ref(`/${constants.API_VERSION}/users/${this.state.user.uid}/worksheets/`).set(this.state.worksheets.map(worksheet => worksheet.id).concat([newWorksheetId])),
          database.ref(`/${constants.API_VERSION}/worksheets/${newWorksheetId}/`).set({ members: [this.state.user.uid], name: this.state.newWorksheetName, disclosureRange: constants.worksheetDisclosureRange.PRIVATE }),
        ]).then(() => {
          this.setState({
            worksheets: this.state.worksheets.concat([{ id: newWorksheetId, name: this.state.newWorksheetName }]),
            newWorksheetName: '',
            isOpenCreateWorksheetModal: false,
            isOpenSnackbar: true,
            snackbarText: i18n.t('common.wasCreated_target', { target: this.state.newWorksheetName }),
          });
          this.goWorkSheet(newWorksheetId);
        });
      }
    });
  }

  goWorkSheet(id) {
    this.props.history.push('/');
    setTimeout(() => { this.props.history.push(`/${id}`); });
    if (util.isMobile()) this.setState({ isOpenSidebar: false });
  }

  render() {
    const {
      classes, theme, location, history,
    } = this.props;
    return (
      <div className={classes.root}>
        <GlobalHeader
          user={this.state.user}
          openSideBar={() => { this.setState({ isOpenSidebar: true }); }}
          isOpenHelpDialog={this.state.isOpenHelpDialog}
          openHelpDialog={() => { this.setState({ isOpenHelpDialog: true }); }}
          closeHelpDialog={() => { this.setState({ isOpenHelpDialog: false }); }}
          logout={this.logout.bind(this)}
          goSettings={() => { this.props.history.push(`/${this.state.user.uid}/settings`); }}
          history={history}
        />
        <Drawer variant="persistent" open={this.state.isOpenSidebar} style={{ display: this.state.isOpenSidebar ? 'block' : 'none' }} classes={{ paper: classes.drawerPaper }} >
          <div style={{ height: theme.spacing.unit }} />
          <div className={classes.toolbar} />
          <List component="nav">
            <ListItem divider button onClick={() => { this.setState({ isOpenSidebar: false }); }}>
              <ListItemIcon>
                <Close />
              </ListItemIcon>
              <ListItemText primary={i18n.t('common.close')} />
            </ListItem>
            <ListItem divider button onClick={this.goWorkSheet.bind(this, '')} disabled={location.pathname === '/'} style={{ backgroundColor: location.pathname === '/' ? 'rgba(0, 0, 0, 0.08)' : '' }}>
              <ListItemIcon>
                <span role="img" aria-label="Hello" >😜</span>
              </ListItemIcon>
              <ListItemText primary="Hello" />
            </ListItem>
            {this.state.worksheets.map((worksheet) => {
              const isActive = util.formatURLString(location.pathname.replace('/', '')) === util.formatURLString(worksheet.name);
              return (
                <ListItem divider key={worksheet.id} button onClick={this.goWorkSheet.bind(this, worksheet.id)} disabled={isActive} style={{ backgroundColor: isActive ? 'rgba(0, 0, 0, 0.08)' : '' }}>
                  <ListItemText key={worksheet.id} primary={worksheet.name} />
                </ListItem>
              );
            })}
            <ListItem divider button onClick={() => { this.setState({ isOpenCreateWorksheetModal: true }); }}>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary={i18n.t('common.createNew')} />
            </ListItem>
          </List>
        </Drawer>
        <main className={classes.content}>
          <Switch>
            <Route exact strict path="/" render={(props) => { if (this.state.user.uid !== '') { return <Hello user={this.state.user} {...props} toggleHelpDialog={() => { this.setState({ isOpenHelpDialog: !this.state.isOpenHelpDialog }); }} />; } return (<Top {...props} />); }} />
            <Route exact strict path="/privacy-and-terms" render={props => <PrivacyPolicyTermsOfService {...props} />} />
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
        </main>
        <Dialog open={this.state.processing}>
          <div style={{ padding: this.props.theme.spacing.unit }}><CircularProgress className={classes.circularProgress} /></div>
        </Dialog>
        <Dialog open={this.state.isOpenSupportBrowserDialog}>
          <DialogTitle>{i18n.t('app.unsupportedBrowser')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {i18n.t('app.thisServiceCurrentlySupportsOperationAt_target', { target: constants.SUPPORTEDBROWSERS })}
              <br />
              {i18n.t('app.pleaseReopenItWithTargetOrDownloadByClickingTheButtonBelow_target', { target: constants.SUPPORTEDBROWSERS })}
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
              {i18n.t('common.download')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          fullWidth
          open={this.state.isOpenCreateWorksheetModal}
          onClose={() => { this.setState({ newWorksheetName: '', isOpenCreateWorksheetModal: false }); }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">{i18n.t('app.createWorksheet')}</DialogTitle>
          <DialogContent>
            <TextField
              onChange={(e) => { this.setState({ newWorksheetName: e.target.value }); }}
              value={this.state.newWorksheetName}
              autoFocus
              margin="dense"
              id="name"
              label={i18n.t('common.worksheetName')}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={() => { this.setState({ isOpenCreateWorksheetModal: false }); }} color="primary">{i18n.t('common.cancel')}</Button>
            <Button size="small" onClick={this.createWorksheet.bind(this)} color="primary">{i18n.t('common.create')}</Button>
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

