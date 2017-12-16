import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogContent,
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
    marginTop: 30,
    flex: 'initial',
  },
};

function DescriptionDialog(props) {
  const { open, onRequestClose, classes } = props;
  return (
    <Dialog
      fullScreen
      open={open}
      onRequestClose={onRequestClose}
    >
      <AppBar color="default" className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question" aria-hidden="true" />
            　サービスについて
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onRequestClose}>
            <i className="fa fa-times" aria-hidden="true" />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DialogContent className={classes.content}>
        <Grid container spacing={40}>
          <Grid item xs={12}>
            <Typography type="title" gutterBottom>
              Taskontableとは？
            </Typography>
            <Typography type="body2" gutterBottom>
              Taskontableは毎日のワークフローを簡単に作成できるタスク管理アプリです。<br />
              タスクを直列化し、一つ一つこなしていくことで生産性を向上させることができます。<br />
              仕事や家事をやり遂げるのはそれほど簡単ではありません。<br />
              時間を有効に活用し、やるべきことタスクを終わらせ、すてきな人生をお楽しみください。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              どこでも使える
            </Typography>
            <Typography type="body1" gutterBottom>
                面倒なデータの同期は不要。<br />
                ログインすればどこでもタスクを一元管理できます。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              焦点を絞る
            </Typography>
            <Typography type="body1" gutterBottom>
              テーブルにタスクを追加して並び替える。<br />
              これだけで今日やるべきことは驚くようにシンプルになります。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              把握する
            </Typography>
            <Typography type="body1" gutterBottom>
                テーブルに入力したデータでリアルタイムに終了時刻を表示します。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              高速に入力する
            </Typography>
            <Typography type="body1" gutterBottom>
                テーブルはExcelを扱うように操作が可能。<br />
                コピペはもちろん、現在時刻入力などのショートカットにも対応しています。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              アラームを追加する
            </Typography>
            <Typography type="body1" gutterBottom>
                タスクを開始した時刻 + 見積もり時間 になると通知します。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

DescriptionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DescriptionDialog);
