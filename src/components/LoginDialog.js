import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

function LoginDialog(props) {
  const { userId, changeUserId, login, isOpenLoginDialog } = props;
  return (
    <Dialog open={isOpenLoginDialog}>
      <DialogTitle>ユーザーIDを入力して下さい</DialogTitle>
      <DialogContent>
        <DialogContentText>
          TaskChute WEB はただいま開発中です。<br />
          しかし一部機能を試していただくことは可能です。<br />
          <br />
          タスクの入力・保存・読み込みはできますが、
          現時点ではユーザー登録を行いませんので、あなた自身でユーザーIDを入力して下さい。<br />
          <br />
          以降、同じユーザーIDを入力すると<br />
          保存したタスクを読み込むことができます。<br />
          <br />
        </DialogContentText>
        <TextField
          value={userId}
          onChange={changeUserId}
          required
          autoFocus
          margin="dense"
          id="userId"
          label="ユーザーID"
          fullWidth
        />
        <Typography type="caption" gutterBottom>
         *ログイン機能実装後に以前に保存したデータは削除されます。あらかじめご了承ください。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={login} color="primary">
          はじめる
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LoginDialog.propTypes = {
  userId: PropTypes.string.isRequired,
  isOpenLoginDialog: PropTypes.bool.isRequired,
  changeUserId: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

export default LoginDialog;
