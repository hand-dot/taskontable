import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import { CircularProgress } from 'material-ui/Progress';
import util from '../util';
import constants from '../constants';

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

const database = firebase.database();
class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invitationEmail: '',
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
      body: `${this.props.userName} さんから、${constants.TITLE}のワークシート「${this.props.teamName}」への招待が届いています。

まだ、アカウント作成がお済でない場合は ${window.location.protocol}//${window.location.host}/signup からアカウントを作成し、"ログインを済ませた状態"で 

${window.location.protocol}//${window.location.host}/${this.props.teamId} から参加してください。

------>> Build Your WorkFlow ----------->>>--

${constants.TITLE}

e-mail: ${constants.EMAIL}

HP: ${window.location.protocol}//${window.location.host}

------>> Build Your WorkFlow ----------->>>--`,
    });
  }

  addMember() {
    if (util.validateEmail(this.state.invitationEmail)) {
      if (this.props.members.map(member => member.email).includes(this.state.invitationEmail)) {
        alert('このメールアドレスは既にメンバーに存在します。');
        this.setState({ invitationEmail: '' });
        return;
      }
      this.setState({ processing: true });
      // teamのデータベースのinvitedにメールアドレスがない場合メールアドレスを追加する。
      database.ref(`/teams/${this.props.teamId}/invitedEmails/`).once('value').then((snapshot) => {
        const invitedEmails = [];
        if (snapshot.exists() && snapshot.val() !== [] && !snapshot.val().includes(this.state.invitationEmail)) {
          invitedEmails.push(...(snapshot.val().concat([this.state.invitationEmail])));
        } else {
          invitedEmails.push(this.state.invitationEmail);
        }
        database.ref(`/teams/${this.props.teamId}/invitedEmails/`).set(invitedEmails);
      });
      // 招待メールの送信
      this.sendInviteEmail(this.state.invitationEmail).then(
        () => {
          alert('招待メールを送信しました。');
          this.props.handleInvitedEmails(this.props.invitedEmails.concat([this.state.invitationEmail]).filter((x, i, self) => self.indexOf(x) === i));
          this.setState({ invitationEmail: '', isOpenAddMemberModal: false, processing: false });
        },
        () => {
          alert('招待メールの送信に失敗しました。');
          this.setState({ processing: false });
        },
      );
    } else {
      alert('メールアドレスとして正しくありません。');
    }
  }


  /**
   * メンバーもしくは招待中のメンバーを削除します。
   */
  removeMember() {
    if (this.state.target.type === constants.handleUserType.MEMBER) {
      this.setState({ processing: true });
      database.ref(`/users/${this.state.target.uid}/teams/`).once('value').then((snapshot) => {
        if (!snapshot.exists() && !Array.isArray(snapshot.val())) {
          // メンバーが最新でない可能性がある。
          // TODO ここダサい。
          alert('メンバーの再取得が必要なためリロードします。');
          window.location.reload();
        }
        return snapshot.val().filter(teamId => teamId !== this.props.teamId);
      }).then((newTeamIds) => {
        if (this.props.userId === this.state.target.uid && !window.confirm(`${this.props.teamName}から自分を削除しようとしています。もう一度参加するためにはメンバーに招待してもらう必要があります。よろしいですか？`)) {
          this.setState({ isOpenRemoveMemberModal: false, processing: false });
          return;
        }
        if (newTeamIds.length === 0 && !window.confirm(`${this.props.teamName}からメンバーがいなくなります。このチームに二度と遷移できなくなりますがよろしいですか？`)) {
          this.setState({ isOpenRemoveMemberModal: false, processing: false });
          return;
        }
        // TODO ここはcloudfunctionでusersのチームから値を削除し、realtimeデータベースのusers/$uid/.writeは自分しか書き込み出来ないようにしたほうがよさそう。
        database.ref(`/users/${this.state.target.uid}/teams/`).set(newTeamIds).then(() => {
          const newMembers = this.props.members.filter(member => member.email !== this.state.target.email);
          this.props.handleMembers(newMembers);
          if (this.props.userId === this.state.target.uid) setTimeout(() => { window.location.reload(); });
          this.setState({
            processing: false,
            isOpenRemoveMemberModal: false,
            target: {
              type: '',
              uid: '',
              displayName: '',
              email: '',
              photoURL: '',
              fcmToken: '',
            },
          });
        });
      });
    } else if (this.state.target.type === constants.handleUserType.INVITED) {
      const newEmails = this.props.invitedEmails.filter(invitedEmail => invitedEmail !== this.state.target.email);
      this.props.handleInvitedEmails(newEmails);
      this.setState({
        isOpenRemoveMemberModal: false,
        target: {
          type: '',
          uid: '',
          displayName: '',
          email: '',
          photoURL: '',
          fcmToken: '',
        },
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
      if (this.state.target.uid === this.props.userId) {
        alert('自分に通知を送ることはできません');
        this.setState({ isOpenSendNotificationModal: false });
        return;
      }
      if (this.state.target.fcmToken === '') {
        alert(`${this.state.target.displayName}さんは通知を拒否しているようです。`);
        this.setState({ isOpenSendNotificationModal: false });
        return;
      }
      util.sendNotification({
        title: `${this.props.userName}さんが通知を送信しました。`,
        body: `${this.props.teamName}のワークシートを開いてください。`,
        url: `${window.location.protocol}//${window.location.host}/${this.props.teamId}`,
        icon: this.props.userPhotoURL,
        to: this.state.target.fcmToken,
      }).then((res) => {
        alert(res.ok ? '通知を送信しました。' : '通知の送信に失敗しました。');
        this.setState({ isOpenSendNotificationModal: false });
      });
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
              <div className={classes.member} key={member.uid} title={`${member.displayName} - ${member.email}`}>
                <IconButton
                  className={classes.actionIcon}
                  color="default"
                  onClick={() => {
                  this.setState({
                    isOpenRemoveMemberModal: true,
                    target: Object.assign({
                      type: constants.handleUserType.MEMBER,
                      uid: '',
                      displayName: '',
                      email: '',
                      photoURL: '',
                      fcmToken: '',
                      }, {
                        uid: member.uid,
                        displayName: member.displayName,
                        email: member.email,
                        photoURL: member.photoURL,
                        fcmToken: member.fcmToken,
                      }),
                  });
                }}
                >
                  <i style={{ fontSize: 15 }} className="fa fa-times-circle" aria-hidden="true" />
                </IconButton>
                /
                <IconButton
                  className={classes.actionIcon}
                  color="default"
                  onClick={() => {
                    this.setState({
                      isOpenSendNotificationModal: true,
                      target: Object.assign({
                        type: constants.handleUserType.MEMBER,
                        uid: '',
                        displayName: '',
                        email: '',
                        photoURL: '',
                        fcmToken: '',
                        }, {
                          uid: member.uid,
                          displayName: member.displayName,
                          email: member.email,
                          photoURL: member.photoURL,
                          fcmToken: member.fcmToken,
                        }),
                    });
                  }}
                >
                  <i style={{ fontSize: 15 }} className="fa fa-bell" aria-hidden="true" />
                </IconButton>
                <Typography className={classes.memberText} align="center" variant="caption">{member.displayName}</Typography>
                {member.photoURL ? <Avatar className={classes.userPhoto} src={member.photoURL} /> : <div className={classes.userPhoto}><i style={{ fontSize: 25 }} className="fa fa-user-circle fa-2" /></div>}
                <Typography className={classes.memberText} align="center" variant="caption">{member.email}</Typography>
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
                    target: Object.assign({
                      type: constants.handleUserType.INVITED,
                      uid: '',
                      displayName: '',
                      email: '',
                      photoURL: '',
                      fcmToken: '',
                      }, {
                        email: invitedEmail,
                      }),
                  });
                }}
                >
                  <i style={{ fontSize: 15 }} className="fa fa-times-circle" aria-hidden="true" />
                </IconButton>
                /
                <IconButton
                  className={classes.actionIcon}
                  color="default"
                  onClick={() => {
                    this.setState({
                      isOpenResendEmailModal: true,
                      target: Object.assign({
                        type: constants.handleUserType.INVITED,
                        uid: '',
                        displayName: '',
                        email: '',
                        photoURL: '',
                        fcmToken: '',
                        }, {
                          email: invitedEmail,
                        }),
                    });
                  }}
                >
                  <i style={{ fontSize: 15 }} className="fa fa-envelope" aria-hidden="true" />
                </IconButton>
                <Typography className={classes.memberText} align="center" variant="caption">招待中</Typography>
                <div className={classes.userPhoto}><i style={{ fontSize: 25 }} className="fa fa-user-circle fa-2" /></div>
                <Typography className={classes.memberText} align="center" variant="caption">{invitedEmail}</Typography>
              </div>
          ))}
          </div>
        </div>
        <div style={{ marginTop: '2em' }}>
          <span style={{ padding: theme.spacing.unit * 4 }}>/</span>
          <IconButton color="default" onClick={() => { this.setState({ isOpenAddMemberModal: true }); }}>
            <i className="fa fa-plus" />
          </IconButton>
        </div>
        {/* メンバーの追加モーダル */}
        <Dialog
          open={this.state.isOpenAddMemberModal}
          onClose={() => { this.setState({ invitationEmail: '', isOpenAddMemberModal: false }); }}
          aria-labelledby="add-member-dialog-title"
        >
          <DialogTitle id="add-member-dialog-title">メンバーを追加する</DialogTitle>
          <DialogContent>
            <TextField
              onChange={(e) => { this.setState({ invitationEmail: e.target.value }); }}
              value={this.state.invitationEmail}
              autoFocus
              margin="dense"
              id="email"
              type="email"
              label="メールアドレス"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { this.setState({ isOpenAddMemberModal: false }); }} color="primary">キャンセル</Button>
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
          <CircularProgress className={classes.circularProgress} size={60} />
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

