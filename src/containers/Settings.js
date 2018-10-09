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
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import constants from '../constants';
import googleIcon from '../images/google.svg';
import emailIcon from '../images/email.svg';
import personIcon from '../images/person.svg';
import util from '../utils/util';
import i18n from '../i18n';

const database = util.getDatabase();
const auth = util.getAuth();
const storage = util.getStorage();

const styles = {
  root: {
    paddingTop: '5em',
    padding: '4em 2em 2em',
    width: '100%',
    margin: '0 auto',
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
        throw new Error('Use of unexpected provider');
      }
    } else {
      throw new Error('Use of multiple providers');
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
    const {
      newPassword,
      newPasswordConf,
      displayName,
      email,
      photoURL,
    } = this.state;
    const { user, handleUser } = this.props;
    const propsUser = user;
    const authUser = auth.currentUser;
    if (propsUser.uid !== authUser.uid) {
      throw new Error('Authenticated User uid differs from Current User uid.');
    } else {
      const promises = [];
      if (this.newPhotoBlob) {
        storage.ref().child(`profilePhotos/${propsUser.uid}.${this.newPhotoBlob.type.replace('image/', '')}`).put(this.newPhotoBlob).then((snapshot) => {
          this.newPhotoBlob = null;
          snapshot.ref.getDownloadURL().then((newPhotoURL) => {
            this.setState({ photoURL: newPhotoURL });
            promises.push(database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/photoURL/`).set(newPhotoURL), authUser.updateProfile({ photoURL: newPhotoURL }));
          });
        });
      }
      if (newPassword !== '') {
        if (newPassword.length >= 6 && newPassword === newPasswordConf) {
          promises.push(authUser.updatePassword(newPassword));
        } else {
          alert(i18n.t('validation.correct_target', { target: i18n.t('common.password') }));
          this.setState({ processing: false });
          return;
        }
      }
      if (propsUser.displayName !== displayName) {
        if (displayName !== '') {
          promises.push(
            database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/displayName/`).set(displayName),
            authUser.updateProfile({ displayName }),
          );
        } else {
          alert(i18n.t('validation.invalid_target', { target: i18n.t('common.userName') }));
          this.setState({ processing: false });
          return;
        }
      }
      if (propsUser.email !== email) {
        if (util.validateEmail(email)) {
          promises.push(
            database.ref(`/${constants.API_VERSION}/users/${propsUser.uid}/settings/email/`).set(email),
            authUser.updateEmail(email),
          );
        } else {
          alert(i18n.t('validation.invalid_target', { target: i18n.t('common.emailAddress') }));
          this.setState({ processing: false });
          return;
        }
      }
      Promise.all(promises).then(() => {
        this.setState({ isOpenSaveSnackbar: true, processing: false });
        handleUser({
          displayName,
          email,
          photoURL,
        });
      }, () => {
        alert(i18n.t('settings.failedToSave'));
        this.setState({ processing: false });
      });
    }
  }

  backToApp() {
    const {
      displayName,
      email,
      photoURL,
    } = this.state;
    const { user, history } = this.props;
    if (user.displayName !== displayName || user.email !== email || user.photoURL !== photoURL) {
      if (!window.confirm(i18n.t('common.someContentsAreNotSaved') + i18n.t('common.areYouSureBackToPreviousPage'))) return;
    }
    history.goBack();
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
    const {
      loginProviderId,
      photoURL,
      isOpenEditPhotoDialog,
      displayName,
      email,
      newPassword,
      newPasswordConf,
      isOpenSaveSnackbar,
      processing,
    } = this.state;
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Typography gutterBottom variant="h6">
            {i18n.t('common.accountSettings')}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <div className={classes.content}>
            {(() => {
              if (loginProviderId === constants.loginProviderId.PASSWORD) {
                return <img src={emailIcon} alt="email" height="20" />;
              } if (loginProviderId === constants.loginProviderId.GOOGLE) {
                return <img src={googleIcon} alt="google" height="20" />;
              }
              return null;
            })()}
            <div style={{ textAlign: 'center' }}>
              <IconButton className={classes.iconButton} data-menu-key="user" onClick={() => { this.setState({ isOpenEditPhotoDialog: true }); }}>
                <Avatar className={classes.userPhoto} src={photoURL || personIcon} />
              </IconButton>
              <Dialog
                fullScreen
                disableBackdropClick
                disableEscapeKeyDown
                open={isOpenEditPhotoDialog}
                onClose={() => { this.setState({ isOpenEditPhotoDialog: false }); }}
                aria-labelledby="edit-photo-dialog"
              >
                <DialogTitle id="edit-photo-dialog">
                  {i18n.t('settings.changeProfilePhoto')}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText />
                  <img ref={(node) => { this.editingPhoto = node; }} style={{ maxWidth: 300, maxHeight: 300 }} src={photoURL} crossOrigin="" alt={`${i18n.t('settings.profilePhoto') + (photoURL ? '' : `: ${i18n.t('settings.notSet')}`)}`} />
                  <div>
                    <input type="file" name="image" accept="image/*" onChange={this.changePhotoInput.bind(this)} />
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => { this.setState({ isOpenEditPhotoDialog: false }); }} color="primary">
                    {i18n.t('common.cancel')}
                  </Button>
                  <Button onClick={this.cropPhoto.bind(this)} color="primary">
                    {i18n.t('common.change')}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </Grid>
        <Grid item xs={8}>
          <TextField
            value={displayName}
            onChange={(e) => { this.setState({ displayName: e.target.value }); }}
            id="displayName"
            label={i18n.t('common.userName')}
            fullWidth
            margin="normal"
          />
          <TextField
            value={email}
            disabled={loginProviderId !== constants.loginProviderId.PASSWORD}
            onChange={(e) => { this.setState({ email: e.target.value }); }}
            id="email"
            label={i18n.t('common.emailAddress')}
            fullWidth
            margin="normal"
          />
          <TextField
            value={newPassword}
            disabled={loginProviderId !== constants.loginProviderId.PASSWORD}
            onChange={(e) => { this.setState({ newPassword: e.target.value }); }}
            id="newPassword"
            type="password"
            label={i18n.t('common.password')}
            placeholder={i18n.t('validation.minLength_num', { num: 6 })}
            fullWidth
            margin="normal"
          />
          <TextField
            value={newPasswordConf}
            disabled={loginProviderId !== constants.loginProviderId.PASSWORD}
            onChange={(e) => { this.setState({ newPasswordConf: e.target.value }); }}
            id="newPasswordConf"
            type="password"
            label={i18n.t('common.passwordConfirmation')}
            placeholder={i18n.t('settings.pleaseEnterSamePasswordAsAbove')}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <Button style={{ margin: theme.spacing.unit }} size="small" onClick={this.save.bind(this)} variant="contained" color="primary">
            {i18n.t('common.save')}
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Divider style={{ margin: '1.5em 0' }} />
          <Button style={{ margin: theme.spacing.unit }} size="small" onClick={this.backToApp.bind(this)} variant="contained">
            {i18n.t('common.backToPreviousPage')}
          </Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={isOpenSaveSnackbar}
          onClose={() => { this.setState({ isOpenSaveSnackbar: false }); }}
          ContentProps={{ 'aria-describedby': 'info-id' }}
          message={(
            <span id="info-id" style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon style={{ color: constants.brandColor.base.GREEN }} />
              <span style={{ paddingLeft: theme.spacing.unit }}>
                {i18n.t('common.saved_target', { target: i18n.t('common.userInformation') })}
              </span>
            </span>
)}
        />
        <Dialog open={processing}>
          <div style={{ padding: theme.spacing.unit }}>
            <CircularProgress className={classes.circularProgress} />
          </div>
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
