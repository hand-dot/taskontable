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
    maxWidth: 150,
    display: 'inline-block',
    padding: theme.spacing.unit,
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
      isOpenAddMemberModal: false,
      sendEmailProcessing: false,
    };
  }

  addMember() {
    if (util.validateEmail(this.state.invitationEmail)) {
      if (this.props.members.map(member => member.email).includes(this.state.invitationEmail)) {
        alert('このメールアドレスは既にメンバーに存在します。');
        this.setState({ invitationEmail: '' });
        return;
      }
      this.setState({ sendEmailProcessing: true });
      // teamのデータベースのinvitedにメールアドレスがない場合メールアドレスを追加する。
      database.ref(`/teams/${this.props.teamId}/invitedEmails/`).once('value').then((snapshot) => {
        const invitedEmails = [];
        if (snapshot.exists() && snapshot.val() !== []) {
          invitedEmails.push(...(snapshot.val().concat([this.state.invitationEmail]).filter((x, i, self) => self.indexOf(x) === i)));
        } else {
          invitedEmails.push(this.state.invitationEmail);
        }
        database.ref(`/teams/${this.props.teamId}/invitedEmails/`).set(invitedEmails);
      });
      // 招待メールの送信
      fetch(`https://us-central1-taskontable.cloudfunctions.net/sendgridEmail?sg_key=${constants.SENDGRID_API_KEY}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        mode: 'no-cors',
        body: JSON.stringify({
          to: this.state.invitationEmail,
          from: constants.EMAIL,
          subject: `${constants.TITLE}へのご招待 - ${this.props.userName} さんから、${constants.TITLE}のワークシート「${this.props.teamName}」への招待が届いています。`,
          body: `${this.props.userName} さんから、${constants.TITLE}のワークシート「${this.props.teamName}」への招待が届いています。

まだ、アカウント作成がお済でない場合は ${window.location.protocol}//${window.location.host}/signup からアカウントを作成し、"ログインを済ませた状態"で 

${window.location.protocol}//${window.location.host}/${this.props.teamId} から参加してください。`,
        }),
      }).then(() => { alert('招待メールを送信しました。'); this.setState({ invitationEmail: '', isOpenAddMemberModal: false, sendEmailProcessing: false }); }, () => { alert('招待メールの送信に失敗しました。'); this.setState({ sendEmailProcessing: false }); });
    } else {
      alert('メールアドレスとして正しくありません。');
    }
  }

  render() {
    const {
      teamName, members, classes, theme,
    } = this.props;
    return (
      <div style={{ padding: theme.spacing.unit }}>
        <Typography variant="subheading">
          {teamName}のメンバー
        </Typography>
        <div className={classes.membersContainer}>
          {members.map(member => (
            <div className={classes.member} key={member.uid} title={`${member.displayName} - ${member.email}`}>
              <Typography className={classes.memberText} align="center" variant="caption">{member.displayName}</Typography>
              {(() => {
                if (member.photoURL) {
                  return <Avatar className={classes.userPhoto} src={member.photoURL} />;
                }
                return <div className={classes.userPhoto}><i className="fa fa-user-circle" /></div>;
              })()}
              <Typography className={classes.memberText} align="center" variant="caption">{member.email}</Typography>
            </div>
        ))}
          <div className={classes.member}>
            <IconButton className={classes.actionIcon} color="default" onClick={() => { this.setState({ isOpenAddMemberModal: true }); }}>
              <i className="fa fa-plus" />
            </IconButton>
          </div>
        </div>
        <Dialog
          open={this.state.isOpenAddMemberModal}
          onClose={() => { this.setState({ invitationEmail: '', isOpenAddMemberModal: false }); }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">メンバーを追加する</DialogTitle>
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
        <Dialog open={this.state.sendEmailProcessing}>
          <CircularProgress className={classes.circularProgress} size={60} />
        </Dialog>
        {/* TODO URLをコピーできる機能もあったほうがいい */}
      </div>
    );
  }
}

Members.propTypes = {
  userName: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  })).isRequired,
  teamId: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(Members);

