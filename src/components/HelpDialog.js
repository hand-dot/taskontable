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

import '../styles/helpdialog.css';
import constants from '../constants';

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
  const { open, onClose, classes } = props;
  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
    >
      <AppBar color="default" className={classes.appBar}>
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question-circle-o" aria-hidden="true" />
            　ヘルプ
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogTitle>キーボードショートカット</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid className={classes.shotcut} item xs={6}>
            <h5>アプリ</h5>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>?</kbd> – ヘルプを表示</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>S</kbd> – 保存</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>I</kbd> – 行追加</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>J</kbd> – ダッシュボード開閉</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>K</kbd> – タスクプール開閉</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>L</kbd> – テーブルを選択</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>&gt;</kbd> – 次の日に移動</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>&lt;</kbd> – 前の日に移動</Typography>
          </Grid>
          <Grid className={classes.shotcut} item xs={6}>
            <h5>テーブル編集</h5>
            <Typography gutterBottom variant="caption"><kbd>右クリック</kbd> – コンテキストメニュー表示</Typography>
            <Typography gutterBottom variant="caption"><kbd>Enter</kbd> – 編集開始/終了</Typography>
            <Typography gutterBottom variant="caption"><kbd>Esc</kbd> – 編集をキャンセル</Typography>
            <Typography gutterBottom variant="caption"><kbd>Backspace</kbd> – セルを空にする</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>C</kbd> – コピー</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>X</kbd> – 切り取り</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>V</kbd> – 貼り付け</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>Z</kbd> – 戻る</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>Y</kbd> – 進む</Typography>
            <Typography gutterBottom variant="caption"><kbd>Ctrl</kbd> + <kbd>:</kbd> – 現在時刻を入力</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogTitle>タスクの入力について</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom variant="caption">
                *セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
            </Typography>
            <Typography gutterBottom variant="caption">
                *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
            </Typography>
            <Typography gutterBottom variant="caption">
                *列ヘッダーにマウスホバーすると各列の説明を見ることができます。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogTitle>アラームについて</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom variant="caption">
                *終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
            </Typography>
            <Typography gutterBottom variant="caption">
                *開始時刻を削除、もしくは終了を入力すると終了通知の予約は削除されます。
            </Typography>
            <Typography gutterBottom variant="caption">
                *通知が表示されない場合はこちらをご参照ください。<a href={constants.CHROME_HELP_PERMISSION_URL} target="_blank">サイトの許可を変更する Google Chrome</a>
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(HelpDialog);
