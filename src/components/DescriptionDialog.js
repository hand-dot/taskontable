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
  const { open, onClose, classes } = props;
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
    >
      <AppBar color="default" className={classes.appBar}>
        <Toolbar>
          <Typography type="title" color="inherit" className={classes.flex}>
            <i className="fa fa-question" aria-hidden="true" />
            　サービスについて
          </Typography>
          <IconButton className={classes.closeBtn} onClick={onClose}>
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
              Taskontableは毎日のワークフローを簡単に作成できるタスクマネージャーです。<br />
              タスクを直列化し、一つ一つこなしていくことで生産性を向上させることができます。<br />
              終了時刻を常に表示し、各タスクの終了予定時刻に通知をするので高い集中力を保つことができます。<br />
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              今日の一日を計画する
            </Typography>
            <Typography type="body1" gutterBottom>
              定期的に行うタスクを登録することで自動的にワークフローを作成することができます。<br />
              今日の計画を白紙から始める必要はありません。
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
              焦点を絞る
            </Typography>
            <Typography type="body1" gutterBottom>
              テーブルにタスクを追加して並び替え直列化する。<br />
              これだけで今日やるべきことは驚くようにシンプルになります。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              把握する
            </Typography>
            <Typography type="body1" gutterBottom>
                テーブルに入力したデータでリアルタイムに本日の終了時刻を表示します。
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography type="subheading" gutterBottom>
              予定を確実にこなす
            </Typography>
            <Typography type="body1" gutterBottom>
                タスクの終了予定時刻に通知をします。<br />
                期限を常に把握し作業することができます。
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
              １日の活力を高めましょう
            </Typography>
            <Typography type="body1" gutterBottom>
              あなたがもしタスクの整理に使う時間をできる限り減らし、<br />
              実行する時間を増やしたいと考えているのであればTaskontableは毎日手放すことのできないタスクマネージャーです。
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

DescriptionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DescriptionDialog);
