import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Person from '@material-ui/icons/Person';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import constants from '../constants';
import google from '../images/google.svg';
import email from '../images/email.svg';
import util from '../util';

const database = util.getDatabase();
const auth = util.getAuth();
const storage = util.getStorage();

const styles = {
  root: {
    paddingTop: '5em',
    minHeight: '100vh',
    padding: '4em 2em 2em',
    width: '100%',
    margin: '0 auto',
    backgroundColor: '#fff',
  },
  content: {
    maxWidth: 660,
  },
  iconButton: {
    width: 100,
    height: 100,
  },
  userPhoto: {
    width: 100,
    height: 100,
    textAlign: 'center',
    margin: '0 auto',
  },
  divider: {
    margin: '0 1rem',
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.editingPhoto = null;
    this.newPhotoBlob = null;
    this.cropper = null;
    this.exampleHot = null;
    this.state = {
      displayName: '',
      email: '',
      photoURL: '',
      newPassword: '',
      newPasswordConf: '',
      loginProviderId: '',
      isOpenSaveSnackbar: false,
      processing: false,
      isOpenEditPhotoDialog: false,
    };
  }

  componentWillMount() {
    // 入力フォームの初期化と制御
    const authUser = auth.currentUser;
    if (authUser != null && authUser.providerData.length === 1) {
      const { providerId } = authUser.providerData[0];
      if (providerId === constants.loginProviderId.PASSWORD) {
        this.setState({ loginProviderId: constants.loginProviderId.PASSWORD });
      } else if (providerId === constants.loginProviderId.GOOGLE) {
        this.setState({ loginProviderId: constants.loginProviderId.GOOGLE });
      } else {
        throw new Error('想定外のプロバイダの利用');
      }
    } else {
      throw new Error('複数のプロバイダの利用');
    }
    const { user } = this.props;
    this.setState({
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    });
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }


  save() {
    // 変更したユーザーの情報をサーバーに送信する
    // また、firebaseのauthで管理している情報にも更新を加える。
    this.setState({ processing: true });
    const { user } = this.props;
    const propsUser = user;
    const authUser = auth.currentUser;
    if (propsUser.uid !== authUser.uid) {
      throw new Error('認証ユーザーと現在のユーザーのIDが違います。');
    } else {
      const promises = [];
      if (this.newPhotoBlob) {
        storage.ref().child(`profilePhotos/${propsUser.uid}.${this.newPhotoBlob.type.replace('image/', '')}`).put(this.newPhotoBlob).then((snapshot) => {
          this.newPhotoBlob = null;
          snapshot.ref.getDownloadURL().then((photoURL) => {
            this.setState({ photoURL });
            promises.push(database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/photoURL/`).set(photoURL), authUser.updateProfile({ photoURL }));
          });
        });
      }
      if (this.state.newPassword !== '') {
        if (this.state.newPassword.length >= 6 && this.state.newPassword === this.state.newPasswordConf) {
          promises.push(authUser.updatePassword(this.state.newPassword));
        } else {
          alert('パスワードを正しく入力してください。');
          this.setState({ processing: false });
          return;
        }
      }
      if (propsUser.displayName !== this.state.displayName) {
        if (this.state.displayName !== '') {
          promises.push(
            database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/displayName/`).set(this.state.displayName),
            authUser.updateProfile({ displayName: this.state.displayName }),
          );
        } else {
          alert('ユーザー名が空文字です。');
          this.setState({ processing: false });
          return;
        }
      }
      if (propsUser.email !== this.state.email) {
        if (util.validateEmail(this.state.email)) {
          promises.push(
            database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/email/`).set(this.state.email),
            authUser.updateEmail(this.state.email),
          );
        } else {
          alert('無効なメールアドレスです。');
          this.setState({ processing: false });
          return;
        }
      }
      Promise.all(promises).then(() => {
        this.setState({ isOpenSaveSnackbar: true, processing: false });
        this.props.handleUser({
          displayName: this.state.displayName,
          email: this.state.email,
          photoURL: this.state.photoURL,
        });
      }, () => {
        alert('保存に失敗しました。ログイン情報が古い可能性があります。\nお手数ですが、ログインしなおしてもう一度お試しください。');
        this.setState({ processing: false });
      });
    }
  }

  backToApp() {
    const { user } = this.props;
    if (user.displayName !== this.state.displayName || user.email !== this.state.email || user.photoURL !== this.state.photoURL) {
      if (!window.confirm('保存していない内容がありますが、アプリに戻ってもよろしいですか？')) return;
    }
    this.props.history.goBack();
  }

  changePhotoInput(e) {
    if (this.cropper) this.cropper.destroy();
    const { files } = e.target;
    if (files && files.length > 0) {
      this.editingPhoto.src = URL.createObjectURL(files[0]);
      this.cropper = new Cropper(this.editingPhoto, { aspectRatio: 1 });
    }
  }

  cropPhoto() {
    if (this.cropper) {
      const canvas = this.cropper.getCroppedCanvas({ width: 300, height: 300 });
      canvas.toBlob((blob) => {
        this.newPhotoBlob = blob;
        this.setState({ photoURL: URL.createObjectURL(blob), isOpenEditPhotoDialog: false });
      });
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Typography gutterBottom variant="title" style={{ paddingBottom: '2em' }}>
            アカウント設定
          </Typography>
          <div className={classes.content}>
            {(() => {
              if (this.state.loginProviderId === constants.loginProviderId.PASSWORD) {
                return <img src={email} alt="email" height="20" />;
              } else if (this.state.loginProviderId === constants.loginProviderId.GOOGLE) {
                return <img src={google} alt="google" height="20" />;
              }
              return null;
            })()}
            <div>
              <IconButton className={classes.iconButton} data-menu-key="user" onClick={() => { this.setState({ isOpenEditPhotoDialog: true }); }}>
                {this.state.photoURL ? <Avatar className={classes.userPhoto} src={this.state.photoURL} /> : <Person style={{ fontSize: 100 }} />}
              </IconButton>
              <Dialog
                fullScreen
                disableBackdropClick
                disableEscapeKeyDown
                open={this.state.isOpenEditPhotoDialog}
                onClose={() => { this.setState({ isOpenEditPhotoDialog: false }); }}
                aria-labelledby="edit-photo-dialog"
              >
                <DialogTitle id="edit-photo-dialog">プロフィール写真を変更</DialogTitle>
                <DialogContent>
                  <DialogContentText />
                  <img ref={(node) => { this.editingPhoto = node; }} style={{ maxWidth: 300, maxHeight: 300 }} src={this.state.photoURL} crossOrigin="" alt={`${this.state.displayName}のアイコン${this.state.photoURL ? '' : '(未設定) / '}`} />
                  <div><input type="file" name="image" accept="image/*" onChange={this.changePhotoInput.bind(this)} /></div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => { this.setState({ isOpenEditPhotoDialog: false }); }} color="primary">
                    キャンセル
                  </Button>
                  <Button onClick={this.cropPhoto.bind(this)} color="primary">
                    変更
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
            <TextField
              value={this.state.displayName}
              onChange={(e) => { this.setState({ displayName: e.target.value }); }}
              id="displayName"
              label="ユーザー名"
              fullWidth
              margin="normal"
            />
            <TextField
              value={this.state.email}
              disabled={this.state.loginProviderId !== constants.loginProviderId.PASSWORD}
              onChange={(e) => { this.setState({ email: e.target.value }); }}
              id="email"
              label="メールアドレス"
              fullWidth
              margin="normal"
            />
            <TextField
              value={this.state.newPassword}
              disabled={this.state.loginProviderId !== constants.loginProviderId.PASSWORD}
              onChange={(e) => { this.setState({ newPassword: e.target.value }); }}
              id="newPassword"
              type="password"
              label="パスワード"
              placeholder="6文字以上入力してください"
              fullWidth
              margin="normal"
            />
            <TextField
              value={this.state.newPasswordConf}
              disabled={this.state.loginProviderId !== constants.loginProviderId.PASSWORD}
              onChange={(e) => { this.setState({ newPasswordConf: e.target.value }); }}
              id="newPasswordConf"
              type="password"
              label="パスワード(確認)"
              placeholder="上のパスワードと同じものを入力してください。"
              fullWidth
              margin="normal"
            />
            <Button style={{ margin: this.props.theme.spacing.unit }} size="small" onClick={this.save.bind(this)} variant="raised">保存する</Button>
            <Button style={{ margin: this.props.theme.spacing.unit }} size="small" onClick={this.backToApp.bind(this)} variant="raised">アプリに戻る</Button>
          </div>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSaveSnackbar}
          onClose={() => { this.setState({ isOpenSaveSnackbar: false }); }}
          message="保存しました。"
        />
        <Dialog open={this.state.processing}>
          <div style={{ padding: this.props.theme.spacing.unit }}><CircularProgress className={classes.circularProgress} size={40} /></div>
        </Dialog>
      </Grid>
    );
  }
}
Settings.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  handleUser: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Settings);

