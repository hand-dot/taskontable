import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  closeBtn: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  content: {
    flex: 'initial',
  },
};

function HelpDialog(props) {
  const { open, onRequestClose, classes } = props;
  return (
    <Dialog
      fullScreen
      open={open}
      onRequestClose={onRequestClose}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question-circle-o" aria-hidden="true" />
            　ヘルプ
          </Typography>
          <IconButton className={classes.closeBtn} color="contrast" onClick={onRequestClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogTitle>タスクの入力について</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom>
                *セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
            </Typography>
            <Typography gutterBottom>
                *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
            </Typography>
            <Typography gutterBottom>
                *列ヘッダーにマウスホバーすると各列の説明を見ることができます。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogTitle>終了時刻通知について</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom>
                *終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
            </Typography>
            <Typography gutterBottom>
                *通知予約されたタスクの開始時刻に <i className="fa fa-bell-o fa-lg" /> が表示されます。(マウスホバーで予約時刻)
            </Typography>
            <Typography gutterBottom>
                *開始時刻を削除、もしくは終了を入力すると終了通知の予約は削除されます。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HelpDialog);
