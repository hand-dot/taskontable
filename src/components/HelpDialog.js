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
      maxWidth="md"
      open={open}
      onRequestClose={onRequestClose}
    >
      <AppBar color="default" className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question-circle-o" aria-hidden="true" />
            　ヘルプ
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onRequestClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogTitle>キーボードショートカット</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid className={classes.shotcut} item xs={6}>
            <h5>アプリ(テーブルの選択を外す)</h5>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>S</kbd> – タスク一覧を保存</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>K</kbd> – タスク一覧を次の日に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>J</kbd> – タスク一覧を前の日に移動</Typography>
            <h5>ナビゲーション</h5>
            <Typography gutterBottom type="caption"><kbd>↑</kbd>    – セルを上に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>↓</kbd>  – セルを下に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>→</kbd> – セルを右に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>←</kbd>  – セルを左に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Tab</kbd>         – セルを右に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Tab</kbd> + <kbd>Shift</kbd> – セルを左に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Home</kbd> – 行のはじめにセルを移動</Typography>
            <Typography gutterBottom type="caption"><kbd>End</kbd> – 行のおわりにセルを移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Home</kbd> – 列のはじめにセルを移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>End</kbd> – 列のおわりを移動</Typography>
            <h5>コンテキストメニュー</h5>
            <Typography gutterBottom type="caption"><kbd>↓</kbd> – 選択を下に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>↑</kbd> – 選択を上に移動</Typography>
            <Typography gutterBottom type="caption"><kbd>Enter</kbd> – 選択を決定</Typography>
          </Grid>
          <Grid className={classes.shotcut} item xs={6}>
            <h5>選択</h5>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>A</kbd> – すべて選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>↑</kbd> – 上へ選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>↓</kbd> – 下へ選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>→</kbd> – 右へ選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>←</kbd> – 左へ選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>Home</kbd> – 行のはじめまで選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Shift</kbd> + <kbd>End</kbd> – 行のおわりまで選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Home</kbd> – 列のはじめまで選択</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>End</kbd> – 列のおわりまで選択</Typography>
            <h5>編集</h5>
            <Typography gutterBottom type="caption"><kbd>Enter</kbd> – 編集開始/終了</Typography>
            <Typography gutterBottom type="caption"><kbd>F2</kbd> – 編集開始</Typography>
            <Typography gutterBottom type="caption"><kbd>Esc</kbd> – 編集をキャンセル</Typography>
            <Typography gutterBottom type="caption"><kbd>Backspace</kbd> – セルを空にする</Typography>
            <Typography gutterBottom type="caption"><kbd>Delete</kbd> – セルを空にする</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>C</kbd> – コピー</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>X</kbd> – 切り取り</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>V</kbd> – 貼り付け</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - 選択範囲を編集中セルの値で埋める</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Z</kbd> – 戻る</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>Y</kbd> – 進む</Typography>
            <Typography gutterBottom type="caption"><kbd>Ctrl</kbd> + <kbd>:</kbd> – 現在時刻を入力</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogTitle>タスクの入力について</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom type="caption">
                *セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
            </Typography>
            <Typography gutterBottom type="caption">
                *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
            </Typography>
            <Typography gutterBottom type="caption">
                *列ヘッダーにマウスホバーすると各列の説明を見ることができます。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogTitle>終了時刻通知について</DialogTitle>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography gutterBottom type="caption">
                *終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
            </Typography>
            <Typography gutterBottom type="caption">
                *通知予約されたタスクの開始時刻に <i className="fa fa-bell-o fa-lg" /> が表示されます。(マウスホバーで予約時刻)
            </Typography>
            <Typography gutterBottom type="caption">
                *開始時刻を削除、もしくは終了を入力すると終了通知の予約は削除されます。
            </Typography>
            <Typography gutterBottom type="caption">
                *別の日付のタスク一覧に遷移すると終了通知予約は削除されます。
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
