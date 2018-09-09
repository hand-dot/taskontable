import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import ChipInput from 'material-ui-chip-input';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Delete from '@material-ui/icons/Delete';
import Sms from '@material-ui/icons/Sms';
import Person from '@material-ui/icons/Person';
import Email from '@material-ui/icons/Email';
import PersonAdd from '@material-ui/icons/PersonAdd';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import util from '../utils/util';
import i18n from '../i18n';
import constants from '../constants';
import notifiIcon from '../images/notifiIcon.png';

const URL = `${window.location.protocol}//${window.location.host}`;

const styles = theme => ({
  root: {
    display: 'flex',
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
  actionIcon: {
    width: 35,
    height: 35,
  },
  userPhoto: {
    width: 35,
    height: 35,
    textAlign: 'center',
    margin: '0 auto',
  },
  membersContainer: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  member: {
    textAlign: 'center',
    maxWidth: 200,
    minWidth: 110,
    display: 'inline-block',
    padding: theme.spacing.unit,
    borderRadius: theme.spacing.unit,
    '&:hover': {
      background: theme.palette.grey[50],
    },
  },
  memberText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  circularProgress: {
    overflow: 'hidden',
    padding: 0,
  },
});

const getBlankTarget = () => util.cloneDeep({
  type: '',
  uid: '',
  displayName: '',
  email: '',
  photoURL: '',
  fcmToken: '',
});

class Members extends Component {
  constructor(props) {
    super(props);
    this.addMember = debounce(this.addMember, constants.RENDER_DELAY);
    this.state = {
      invitationEmails: [],
      notificationMessage: '',
      isNotificateAllMember: false,
      target: {
        type: '',
        uid: '',
        displayName: '',
        email: '',
        photoURL: '',
        fcmToken: '',
      },
      snackbarText: '',
      isOpenSnackbar: false,
      isOpenAddMemberModal: false,
      isOpenRemoveMemberModal: false,
      isOpenResendEmailModal: false,
      isOpenSendNotificationModal: false,
      processing: false,
    };
  }

  sendInviteEmail(to) {
    const supportEmail = constants.EMAIL;
    const { userName, worksheetName, worksheetId } = this.props;
    const urlParam = `?email=${encodeURIComponent(to)}&worksheet=${worksheetId}`;
    const loginUrl = `${URL}/login${urlParam}`;
    const signupUrl = `${URL}/signup${urlParam}`;
    return util.sendEmail({
      to,
      from: supportEmail,
      subject: i18n.t('mail.invite.subject_userName_worksheetName', { userName, worksheetName }),
      body: i18n.t('mail.invite.body_userName_worksheetName_loginUrl_signupUrl', {
        userName, worksheetName, loginUrl, signupUrl,
      }) + i18n.t('mail.footer'),
    });
  }

  addMember() {
    if (this.state.invitationEmails.length === 0) {
      alert(i18n.t('validation.must_target', { target: i18n.t('common.emailAddress') }));
      return;
    }
    this.setState({ processing: true });
    Promise.all(this.state.invitationEmails.map(invitationEmail => this.sendInviteEmail(invitationEmail)))
      .then(
        () => {
          this.props.handleInvitedEmails(this.props.invitedEmails.concat(this.state.invitationEmails).filter((x, i, self) => self.indexOf(x) === i)).then(() => {
            this.setState({
              isOpenSnackbar: true, snackbarText: i18n.t('members.sentAnInvitationEmail'), invitationEmails: [], isOpenAddMemberModal: false, processing: false,
            });
          });
        },
        () => {
          this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('members.failedToSendInvitationMail'), processing: false });
        },
      );
  }


  /**
   * メンバーもしくは招待中のメンバーを削除します。
   */
  removeMember() {
    const { target } = this.state;
    const {
      type,
      uid,
      email,
    } = target;
    const {
      userId,
      worksheetId,
      worksheetName,
      members,
      handleMembers,
      invitedEmails,
      handleInvitedEmails,
    } = this.props;
    if (type === constants.handleUserType.MEMBER) {
      const newMembers = members.filter(member => member.email !== email);
      if ((userId === uid && !window.confirm(i18n.t('members.deletingMyselfFrom_worksheetName', { worksheetName }))) || (newMembers.length === 0 && !window.confirm(i18n.t('members.noMembersFrom_worksheetName', { worksheetName })))) {
        this.setState({ isOpenRemoveMemberModal: false });
        return;
      }
      this.setState({ processing: true });
      fetch('https://us-central1-taskontable.cloudfunctions.net/removeUserWorksheetsById',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json; charset=utf-8' },
          mode: 'no-cors',
          body: JSON.stringify({ userId: uid, apiVersion: constants.API_VERSION, worksheetId }),
        }).then(() => {
        handleMembers(newMembers);
        if (userId === uid) setTimeout(() => { window.location.reload(); });
        this.setState({
          processing: false,
          isOpenRemoveMemberModal: false,
          target: getBlankTarget(),
        });
      });
    } else if (type === constants.handleUserType.INVITED) {
      const newEmails = invitedEmails.filter(invitedEmail => invitedEmail !== email);
      handleInvitedEmails(newEmails);
      this.setState({
        isOpenRemoveMemberModal: false,
        target: getBlankTarget(),
      });
    }
  }

  /**
   * 招待中のメンバーにメールを再送信します。
   */
  resendEmail() {
    if (this.state.target.type === constants.handleUserType.INVITED) {
      this.setState({ processing: true });
      // 招待メールの再送信
      this.sendInviteEmail(this.state.target.email).then(
        () => {
          this.setState({
            isOpenSnackbar: true, snackbarText: i18n.t('members.resentAnInvitationEmail'), processing: false, isOpenResendEmailModal: false,
          });
        },
        () => {
          this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('members.failedToResendInvitationMail'), processing: false });
        },
      );
    }
  }

  /**
   * メンバーに通知を送信します。
   */
  sendNotification() {
    if (this.state.target.type === constants.handleUserType.MEMBER) {
      const promises = [];
      const title = `🔔 ${i18n.t('members.notificationFrom_userName', { userName: this.props.userName })}`;
      const message = `${this.props.userName}: ${this.state.notificationMessage ? `${this.state.notificationMessage}` : i18n.t('members.pleaseCheckTheSchedule')}`;
      const url = `${URL}/${this.props.worksheetId}`;
      const icon = this.props.userPhotoURL || notifiIcon; // TODO notifiIconじゃなくてデフォルトのユーザーアイコンを決めるべき
      promises.push(util.sendNotification({
        title, body: message, url, icon, to: this.state.target.fcmToken,
      }).then(res => res.ok));
      if (this.state.isNotificateAllMember) {
        const otherFcmTokens = this.props.members.filter(member => member.uid !== this.props.userId && member.fcmToken !== this.state.target.fcmToken && member.fcmToken).map(member => member.fcmToken);
        promises.push(...otherFcmTokens.map(otherFcmToken => util.sendNotification({
          title, body: message, url, icon, to: otherFcmToken,
        }).then(res => res.ok)));
      }
      Promise.all(promises).then((res) => {
        let snackbarText;
        if (res.every(r => r)) {
          snackbarText = i18n.t('members.sentNotification');
        } else if (res.every(r => !r)) {
          snackbarText = i18n.t('members.failedToSendNotification');
        } else {
          snackbarText = i18n.t('members.failedToSendSomeNotifications');
        }
        this.setState({
          isOpenSnackbar: true, snackbarText, isOpenSendNotificationModal: false, notificationMessage: '',
        });
      });
    }
  }

  addEmail(email) {
    if (email === '') {
      return;
    }
    if (util.validateEmail(email)) {
      if (this.props.members.map(member => member.email).includes(email)) {
        this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('members.emailAlreadyExistsInTheMember') });
      } else {
        this.state.invitationEmails.push(email);
      }
    } else {
      this.setState({ isOpenSnackbar: true, snackbarText: i18n.t('validation.invalid_target', { target: i18n.t('common.emailAddress') }) });
    }
  }

  render() {
    const {
      members, invitedEmails, classes, theme,
    } = this.props;
    return (
      <div>
        <div style={{
          padding: theme.spacing.unit, display: 'inline-flex', flexDirection: 'row', alignItems: 'center',
        }}
        >
          <div>
            <Typography variant="subheading" style={{ paddingLeft: theme.spacing.unit }}>
              {i18n.t('worksheet.members')}
            </Typography>
            <div className={classes.membersContainer}>
              {members.length === 0 ? (
                <div style={{ minHeight: 100, display: 'flex', alignItems: 'center' }}>
                  <Typography align="center" variant="caption">
                    {i18n.t('members.noMembers')}
                  </Typography>
                </div>
              ) : members.map(member => (
                <div className={classes.member} key={member.uid}>
                  <IconButton
                    className={classes.actionIcon}
                    color="default"
                    onClick={() => {
                      this.setState({
                        isOpenRemoveMemberModal: true,
                        target: {
                          type: constants.handleUserType.MEMBER,
                          uid: member.uid,
                          displayName: member.displayName,
                          email: member.email,
                          photoURL: member.photoURL,
                          fcmToken: member.fcmToken,
                        },
                      });
                    }}
                  >
                    <Delete style={{ fontSize: 16 }} />
                  </IconButton>
                  /
                  <span>
                    <IconButton
                      disabled={!member.fcmToken || member.uid === this.props.userId}
                      className={classes.actionIcon}
                      color="default"
                      onClick={() => {
                        this.setState({
                          isOpenSendNotificationModal: true,
                          target: {
                            type: constants.handleUserType.MEMBER,
                            uid: member.uid,
                            displayName: member.displayName,
                            email: member.email,
                            photoURL: member.photoURL,
                            fcmToken: member.fcmToken,
                          },
                        });
                      }}
                    >
                      <Sms style={{ fontSize: 16 }} />
                    </IconButton>
                  </span>
                  <Typography title={member.displayName} className={classes.memberText} align="center" variant="caption">
                    {member.displayName}
                  </Typography>
                  {member.photoURL ? <Avatar className={classes.userPhoto} src={member.photoURL} /> : (
                    <div className={classes.userPhoto}>
                      <Person />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <Typography variant="subheading" style={{ paddingLeft: theme.spacing.unit * 6 }}>
              {i18n.t('members.inviting')}
            </Typography>
            <div className={classes.membersContainer}>
              <span style={{ padding: theme.spacing.unit * 4 }}>
/
              </span>
              {invitedEmails.length === 0 ? (
                <div style={{ minHeight: 100, display: 'flex', alignItems: 'center' }}>
                  <Typography align="center" variant="caption" style={{ minWidth: 150 }}>
                    {i18n.t('members.noOneIsInvited')}
                  </Typography>
                </div>
              ) : invitedEmails.map(invitedEmail => (
                <div className={classes.member} key={invitedEmail}>
                  <IconButton
                    className={classes.actionIcon}
                    color="default"
                    onClick={() => {
                      this.setState({
                        isOpenRemoveMemberModal: true,
                        target: Object.assign(getBlankTarget(), {
                          type: constants.handleUserType.INVITED,
                          email: invitedEmail,
                        }),
                      });
                    }}
                  >
                    <Delete style={{ fontSize: 16 }} />
                  </IconButton>
                   /
                  <IconButton
                    className={classes.actionIcon}
                    color="default"
                    onClick={() => {
                      this.setState({
                        isOpenResendEmailModal: true,
                        target: Object.assign(getBlankTarget(), {
                          type: constants.handleUserType.INVITED,
                          email: invitedEmail,
                        }),
                      });
                    }}
                  >
                    <Email style={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography className={classes.memberText} align="center" variant="caption">
                    {invitedEmail}
                  </Typography>
                  <div className={classes.userPhoto}>
                    <Person />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '2em' }}>
            <span style={{ padding: theme.spacing.unit * 4 }}>
/
            </span>
            <IconButton color="default" onClick={() => { this.setState({ isOpenAddMemberModal: true }); }}>
              <PersonAdd />
            </IconButton>
          </div>
          {/* メンバーの追加モーダル */}
          <Dialog
            open={this.state.isOpenAddMemberModal}
            onClose={() => { this.setState({ isOpenAddMemberModal: false }); }}
            aria-labelledby="add-member-dialog-title"
            fullWidth
          >
            <DialogTitle id="add-member-dialog-title">
              {i18n.t('members.addMembers')}
            </DialogTitle>
            <DialogContent>
              <ChipInput
                autoFocus
                value={this.state.invitationEmails}
                onAdd={(email) => { this.addEmail(email); }}
                onBlur={(e) => { this.addEmail(e.target.value); }}
                onDelete={(email) => { this.setState({ invitationEmails: this.state.invitationEmails.filter(invitationEmail => invitationEmail !== email) }); }}
                label={i18n.t('common.emailAddress')}
                fullWidthInput
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.setState({ invitationEmails: [], isOpenAddMemberModal: false }); }} color="primary">
                {i18n.t('common.cancel')}
              </Button>
              <Button onClick={this.addMember.bind(this)} color="primary">
                {i18n.t('members.sendAnInvitationEmail')}
              </Button>
            </DialogActions>
          </Dialog>
          {/* メンバーの削除モーダル */}
          <Dialog
            open={this.state.isOpenRemoveMemberModal}
            onClose={() => { this.setState({ isOpenRemoveMemberModal: false }); }}
            aria-labelledby="remove-member-dialog-title"
          >
            <DialogTitle id="remove-member-dialog-title">
              {i18n.t('common.remove_target', { target: i18n.t('worksheet.members') })}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {i18n.t('common.areYouSureRemove_target', { target: this.state.target.type === constants.handleUserType.MEMBER ? this.state.target.displayName : this.state.target.email })}
              </Typography>
              <Typography variant="caption">
*
                {i18n.t('members.afterRemoveCantAccess')}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.setState({ isOpenRemoveMemberModal: false }); }} color="primary">
                {i18n.t('common.cancel')}
              </Button>
              <Button onClick={this.removeMember.bind(this)} color="primary">
                {i18n.t('common.remove')}
              </Button>
            </DialogActions>
          </Dialog>
          {/* 招待中のメンバーメール再送信モーダル */}
          <Dialog
            open={this.state.isOpenResendEmailModal}
            onClose={() => { this.setState({ isOpenResendEmailModal: false }); }}
            aria-labelledby="resend-email-dialog-title"
          >
            <DialogTitle id="resend-email-dialog-title">
              {i18n.t('members.resendAnInvitationEmail')}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {i18n.t('members.areYouSureResendInvitationEmailTo_target', { target: this.state.target.email })}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.setState({ isOpenResendEmailModal: false }); }} color="primary">
                {i18n.t('common.cancel')}
              </Button>
              <Button onClick={this.resendEmail.bind(this)} color="primary">
                {i18n.t('common.resend')}
              </Button>
            </DialogActions>
          </Dialog>
          {/* メンバー通知モーダル */}
          <Dialog
            open={this.state.isOpenSendNotificationModal}
            onClose={() => { this.setState({ isOpenSendNotificationModal: false }); }}
            aria-labelledby="send-notification-dialog-title"
          >
            <DialogTitle id="send-notification-dialog-title">
              {i18n.t('members.sendNotification')}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {i18n.t('members.areYouSureSendNotificationTo_target', { target: this.state.target.displayName })}
              </Typography>
              <TextField
                maxLength={100}
                onChange={(e) => { this.setState({ notificationMessage: e.target.value }); }}
                value={this.state.notificationMessage}
                autoFocus
                margin="dense"
                id="message"
                type="message"
                label={i18n.t('members.message')}
                placeholder={i18n.t('common.forExample') + i18n.t('members.pleaseCheckTheSchedule')}
                fullWidth
              />
              <FormGroup row>
                <FormControlLabel
                  control={(
                    <Checkbox
                      color="primary"
                      checked={this.state.isNotificateAllMember}
                      onChange={() => { this.setState({ isNotificateAllMember: !this.state.isNotificateAllMember }); }}
                      value="isNotificateAllMember"
                    />
)}
                  label={i18n.t('members.notifyOtherMembers')}
                />
                <Typography variant="caption" gutterBottom>
(*
                  {i18n.t('members.doNotNoifyMeAndNotificationBlockingMembers')}
)
                </Typography>
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => { this.setState({ isOpenSendNotificationModal: false }); }} color="primary">
                {i18n.t('common.cancel')}
              </Button>
              <Button onClick={this.sendNotification.bind(this)} color="primary">
                {i18n.t('common.send')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={this.state.processing}>
            <div style={{ padding: this.props.theme.spacing.unit }}>
              <CircularProgress className={classes.circularProgress} />
            </div>
          </Dialog>
        </div>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false, snackbarText: '' }); }}
          ContentProps={{ 'aria-describedby': 'info-id' }}
          message={(
            <span id="info-id" style={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon style={{ color: constants.brandColor.base.GREEN }} />
              <span style={{ paddingLeft: theme.spacing.unit }}>
                {this.state.snackbarText}
              </span>
            </span>
)}
        />
      </div>
    );
  }
}

Members.propTypes = {
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userPhotoURL: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    fcmToken: PropTypes.string.isRequired,
  })).isRequired,
  invitedEmails: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  worksheetId: PropTypes.string.isRequired,
  worksheetName: PropTypes.string.isRequired,
  handleMembers: PropTypes.func.isRequired,
  handleInvitedEmails: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(Members);
