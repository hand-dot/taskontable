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
import util from '../util';
import constants from '../constants';
import notifiIcon from '../images/notifiIcon.png';

const database = util.getDatabase();

const styles = theme => ({
  actionIcon: {
    width: 25,
    height: 25,
  },
  userPhoto: {
    width: 25,
    height: 25,
    textAlign: 'center',
    margin: '0 auto',
  },
  membersContainer: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  member: {
    maxWidth: 200,
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
      isOpenAddMemberModal: false,
      isOpenRemoveMemberModal: false,
      isOpenResendEmailModal: false,
      isOpenSendNotificationModal: false,
      processing: false,
    };
  }

  sendInviteEmail(to) {
    return util.sendEmail({
      to,
      from: constants.EMAIL,
      subject: `${constants.TITLE}へのご招待 - ${this.props.userName} さんから、${constants.TITLE}のワークシート「${this.props.teamName}」への招待が届いています。`,
      body: `
${this.props.userName} さんから、${constants.TITLE}のワークシート「${this.props.teamName}」への招待が届いています。

■アカウントを既にお持ちの場合

${window.location.protocol}//${window.location.host}/${this.props.teamId}?email=${encodeURIComponent(to)}&team=${this.props.teamId}  をクリックして参加してください。

(＊Googleログインにて既にこのメールアドレスのアカウントでログインしている場合は上記のURLからGoogleログインしてください。)
　

■アカウントをまだお持ちでない場合は

${window.location.protocol}//${window.location.host}/signup?email=${encodeURIComponent(to)}&team=${this.props.teamId} 

からアカウントを作成してください。

------>> Build Your WorkFlow ----------->>>--

${constants.TITLE}サポート

e-mail: ${constants.EMAIL}

HP: ${window.location.protocol}//${window.location.host}

------>> Build Your WorkFlow ----------->>>--`,
    });
  }

  addMember() {
    if (this.state.invitationEmails.length === 0) {
      alert('メールアドレスを入力してください。');
      return;
    }
    this.setState({ processing: true });
    Promise.all(this.state.invitationEmails.map(invitationEmail => this.sendInviteEmail(invitationEmail)))
      .then(
        () => {
          alert('招待メールを送信しました。');
          this.props.handleInvitedEmails(this.props.invitedEmails.concat(this.state.invitationEmails).filter((x, i, self) => self.indexOf(x) === i));
          this.setState({ invitationEmails: [], isOpenAddMemberModal: false, processing: false });
        },
        () => {
          alert('招待メールの送信に失敗しました。');
          this.setState({ processing: false });
        },
      );
  }


  /**
   * メンバーもしくは招待中のメンバーを削除します。
   */
  removeMember() {
    if (this.state.target.type === constants.handleUserType.MEMBER) {
      this.setState({ processing: true });
      database.ref(`/users/${this.state.target.uid}/teams/`).once('value').then((myTeamIds) => {
        if (!myTeamIds.exists() && !Array.isArray(myTeamIds.val())) {
          // メンバーが最新でない可能性がある。
          // TODO ここダサい。
          alert('メンバーの再取得が必要なためリロードします。');
          window.location.reload();
        }
        return myTeamIds.val().filter(teamId => teamId !== this.props.teamId);
      }).then((newTeamIds) => {
        if (this.props.userId === this.state.target.uid && !window.confirm(`${this.props.teamName}から自分を削除しようとしています。もう一度参加するためにはメンバーに招待してもらう必要があります。よろしいですか？`)) {
          this.setState({ isOpenRemoveMemberModal: false, processing: false });
          return;
        }
        const newMembers = this.props.members.filter(member => member.email !== this.state.target.email);
        if (newMembers.length === 0 && !window.confirm(`${this.props.teamName}からメンバーがいなくなります。このチームに二度と遷移できなくなりますがよろしいですか？`)) {
          this.setState({ isOpenRemoveMemberModal: false, processing: false });
          return;
        }
        // TODO ここはcloudfunctionでusersのチームから値を削除し、realtimeデータベースのusers/$uid/.writeは自分しか書き込み出来ないようにしたほうがよさそう。
        database.ref(`/users/${this.state.target.uid}/teams/`).set(newTeamIds).then(() => {
          this.props.handleMembers(newMembers);
          if (this.props.userId === this.state.target.uid) setTimeout(() => { window.location.reload(); });
          this.setState({
            processing: false,
            isOpenRemoveMemberModal: false,
            target: getBlankTarget(),
          });
        });
      });
    } else if (this.state.target.type === constants.handleUserType.INVITED) {
      const newEmails = this.props.invitedEmails.filter(invitedEmail => invitedEmail !== this.state.target.email);
      this.props.handleInvitedEmails(newEmails);
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
          alert('招待メールを再送信しました。');
          this.setState({ processing: false, isOpenResendEmailModal: false });
        },
        () => {
          alert('招待メールの再送信に失敗しました。');
          this.setState({ processing: false });
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
      const title = `🔔 ${this.props.userName}さんが通知を送信しました。`;
      const message = `${this.props.userName}：${this.state.notificationMessage ? `${this.state.notificationMessage}` : '予定を入れたのでチェックしてください。'}`;
      const url = `${window.location.protocol}//${window.location.host}/${this.props.teamId}`;
      const icon = this.props.userPhotoURL || notifiIcon;
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
        let text;
        if (res.every(r => r)) {
          text = '通知を送信しました。';
        } else if (res.every(r => !r)) {
          text = '通知の送信に失敗しました。';
        } else {
          text = '通知の送信に一部失敗しました。';
        }
        alert(text);
        this.setState({ isOpenSendNotificationModal: false, notificationMessage: '' });
      });
    }
  }

  addEmail(email) {
    if (email === '') {
      return;
    }
    if (util.validateEmail(email)) {
      if (this.props.members.map(member => member.email).includes(email)) {
        alert('このメールアドレスは既にメンバーに存在します。');
      } else {
        this.state.invitationEmails.push(email);
      }
    } else {
      alert('メールアドレスとして不正です。');
    }
  }

  render() {
    const {
      teamName, members, invitedEmails, classes, theme,
    } = this.props;
    return (
      <div style={{
        padding: theme.spacing.unit, display: 'inline-flex', flexDirection: 'row', alignItems: 'center',
        }}
      >
        <div>
          <Typography variant="subheading">
            {teamName}のメンバー
          </Typography>
          <div className={classes.membersContainer}>
            {members.length === 0 ? <Typography align="center" variant="caption">メンバーがいません</Typography> : members.map(member => (
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
                <span title={(!member.fcmToken ? `${member.displayName}さんは通知を拒否しているようです。` : '') || (member.uid === this.props.userId ? '自分に通知を送ることはできません' : '')}>
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
                <Typography title={member.displayName} className={classes.memberText} align="center" variant="caption">{member.displayName}</Typography>
                {member.photoURL ? <Avatar className={classes.userPhoto} src={member.photoURL} /> : <div className={classes.userPhoto}><Person /></div>}
                <Typography title={member.email} className={classes.memberText} align="center" variant="caption">{member.email}</Typography>
              </div>
          ))}
          </div>
        </div>
        <div>
          <Typography variant="subheading">
            招待中メンバー
          </Typography>
          <div className={classes.membersContainer}>
            <span style={{ padding: theme.spacing.unit * 4 }}>/</span>
            {invitedEmails.length === 0 ? <Typography align="center" variant="caption" style={{ minWidth: 150 }}>誰も招待されていません。</Typography> : invitedEmails.map(invitedEmail => (
              <div className={classes.member} key={invitedEmail} title={`招待中 - ${invitedEmail}`}>
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
                <Typography className={classes.memberText} align="center" variant="caption">招待中</Typography>
                <div className={classes.userPhoto}><Person /></div>
                <Typography className={classes.memberText} align="center" variant="caption">{invitedEmail}</Typography>
              </div>
          ))}
          </div>
        </div>
        <div style={{ marginTop: '2em' }}>
          <span style={{ padding: theme.spacing.unit * 4 }}>/</span>
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
          <DialogTitle id="add-member-dialog-title">メンバーを追加する</DialogTitle>
          <DialogContent>
            <ChipInput
              autoFocus
              value={this.state.invitationEmails}
              onAdd={(email) => { this.addEmail(email); }}
              onBlur={(e) => { this.addEmail(e.target.value); }}
              onDelete={(email) => { this.setState({ invitationEmails: this.state.invitationEmails.filter(invitationEmail => invitationEmail !== email) }); }}
              label="メールアドレス"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ invitationEmails: [], isOpenAddMemberModal: false }); }} color="primary">キャンセル</Button>
            <Button onClick={this.addMember.bind(this)} color="primary">招待メールを送信</Button>
          </DialogActions>
        </Dialog>
        {/* メンバーの削除モーダル */}
        <Dialog
          open={this.state.isOpenRemoveMemberModal}
          onClose={() => { this.setState({ isOpenRemoveMemberModal: false }); }}
          aria-labelledby="remove-member-dialog-title"
        >
          <DialogTitle id="remove-member-dialog-title">{this.state.target.type === constants.handleUserType.MEMBER ? 'メンバー' : '招待中のメンバー'}を削除する</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>本当に{this.state.target.type === constants.handleUserType.MEMBER ? `メンバーの${this.state.target.displayName}` : `招待中のメンバーの${this.state.target.email}`}を削除してもよろしいですか？</Typography>
            <Typography variant="caption">*削除後は再度招待しないとこのワークシートにアクセスできなくなります。</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => { this.setState({ isOpenRemoveMemberModal: false }); }}
              color="primary"
            >キャンセル
            </Button>
            <Button onClick={this.removeMember.bind(this)} color="primary">削除</Button>
          </DialogActions>
        </Dialog>
        {/* 招待中のメンバーメール再送信モーダル */}
        <Dialog
          open={this.state.isOpenResendEmailModal}
          onClose={() => { this.setState({ isOpenResendEmailModal: false }); }}
          aria-labelledby="resend-email-dialog-title"
        >
          <DialogTitle id="resend-email-dialog-title">招待中のメンバーにメールを再送信する</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>{`招待中のメンバーの${this.state.target.email}宛に招待メールを再送信してもよろしいですか？`}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => { this.setState({ isOpenResendEmailModal: false }); }}
              color="primary"
            >キャンセル
            </Button>
            <Button onClick={this.resendEmail.bind(this)} color="primary">再送信</Button>
          </DialogActions>
        </Dialog>
        {/* メンバー通知モーダル */}
        <Dialog
          open={this.state.isOpenSendNotificationModal}
          onClose={() => { this.setState({ isOpenSendNotificationModal: false }); }}
          aria-labelledby="send-notification-dialog-title"
        >
          <DialogTitle id="send-notification-dialog-title">メンバーに通知を送信する</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>{`メンバーの${this.state.target.displayName}さん宛にこのページを開いてもらう通知を送信してもよろしいですか？`}</Typography>
            <TextField
              maxLength={100}
              onChange={(e) => { this.setState({ notificationMessage: e.target.value }); }}
              value={this.state.notificationMessage}
              autoFocus
              margin="dense"
              id="message"
              type="message"
              label="一言メッセージ"
              placeholder="例えば 予定を入れたのでチェックしてください。 とか"
              fullWidth
            />
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={this.state.isNotificateAllMember}
                    onChange={() => { this.setState({ isNotificateAllMember: !this.state.isNotificateAllMember }); }}
                    value="isNotificateAllMember"
                  />
                }
                label="ほかのメンバーにも通知する"
              />
              <Typography variant="caption" gutterBottom>(*自分と通知を拒否しているメンバーには通知されません。)</Typography>
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => { this.setState({ isOpenSendNotificationModal: false }); }}
              color="primary"
            >キャンセル
            </Button>
            <Button onClick={this.sendNotification.bind(this)} color="primary">送信</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.processing}>
          <div style={{ padding: this.props.theme.spacing.unit }}><CircularProgress className={classes.circularProgress} size={40} /></div>
        </Dialog>
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
  teamId: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  handleMembers: PropTypes.func.isRequired,
  handleInvitedEmails: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(Members);

