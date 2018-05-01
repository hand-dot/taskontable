import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Dialog, { DialogContent, DialogTitle, DialogActions } from 'material-ui/Dialog';
import util from '../util';

const styles = theme => ({
  userPhoto: {
    width: 25,
    height: 25,
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
});

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      invitationEmail: '',
      isOpenAddMemberModal: false,
    };
  }

  addMember() {
    if (util.validateEmail(this.state.invitationEmail)) {
      // TODO ここでメールを送信するサービスを呼ぶ
      // teamのデータベースのinvitedにメールアドレスがない場合メールアドレスを追加する。
      alert('招待メールを送信しました。');
      this.setState({ invitationEmail: '', isOpenAddMemberModal: false });
    } else {
      alert('メールアドレスとして正しくありません。');
    }
  }

  render() {
    const { members, classes, theme } = this.props;
    return (
      <div style={{ padding: theme.spacing.unit }}>
        <Typography variant="subheading">
          {this.props.teamName}のメンバー
        </Typography>
        <div className={classes.membersContainer}>
          {members.map(member => (
            <div className={classes.member} key={member.uid} title={`${member.displayName} - ${member.email}`}>
              <Typography className={classes.memberText} align="center" variant="caption">{member.displayName}</Typography>
              <Avatar className={classes.userPhoto} src={member.photoURL} />
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
        {/* TODO URLをコピーできる機能もあったほうがいい */}
      </div>
    );
  }
}

Members.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  })).isRequired,
  id: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};
export default withStyles(styles, { withTheme: true })(Members);

