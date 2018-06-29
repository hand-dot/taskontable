import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';

import '../styles/helpdialog.css';
import constants from '../constants';
import util from '../util';
import i18n from '../i18n';

const styles = {
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
  block: {
    fontSize: 22,
    margin: 5,
  },
};

function HelpDialog(props) {
  const {
    open, onClose, classes, theme,
  } = props;
  return (
    <Dialog
      fullScreen={util.isMobile()}
      open={open}
      onClose={onClose}
    >
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="title" color="inherit" className={classes.flex}>{i18n.t('help.title')}</Typography>
          <IconButton className={classes.closeBtn} onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div>
        <DialogTitle>{i18n.t('help.tableColor')}</DialogTitle>
        <DialogContent className={classes.content}>
          <Grid container>
            <Grid item xs={12}>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.yellow')} / <span className={classes.block} style={{ color: constants.cellColor.WARNING }}>■</span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.green')} / <span className={classes.block} style={{ color: constants.cellColor.RESERVATION }}>■</span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.blue')} / <span className={classes.block} style={{ color: constants.cellColor.RUNNING }}>■</span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.red')} / <span className={classes.block} style={{ color: constants.cellColor.OUT }}>■</span>
              </Typography>
              <Typography gutterBottom variant="caption">
                {i18n.t('help.tableColors.gray')} / <span className={classes.block} style={{ color: constants.cellColor.DONE }}>■</span>
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </div>
      {!util.isMobile() && (
        <div>
          <DialogTitle>{i18n.t('help.keyboardShortcut')}</DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid className={classes.shotcut} item xs={6}>
                <h5 style={{ margin: theme.spacing.unit }}>{i18n.t('help.keyboardShortcuts.application')}</h5>
                {/* ヘルプだけはmacOSでクロームのヘルプがアプリのレベルで割り当てられていてctrlにしなければいけない */}
                <Typography gutterBottom variant="caption"><kbd>ctrl</kbd> + <kbd>?</kbd> – ヘルプを表示</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>S</kbd> – 保存</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>J</kbd> – ダッシュボード開閉</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>&gt;</kbd> – 次の日に移動</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>&lt;</kbd> – 前の日に移動</Typography>
              </Grid>
              <Grid className={classes.shotcut} item xs={6}>
                <h5 style={{ margin: theme.spacing.unit }}>{i18n.t('help.keyboardShortcuts.table')}</h5>
                <Typography gutterBottom variant="caption"><kbd>右クリック</kbd> – コンテキストメニュー表示</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>C</kbd> – コピー</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>X</kbd> – 切り取り</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>V</kbd> – 貼り付け</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>Z</kbd> – 戻る</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>Y</kbd> – 進む</Typography>
                <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>:</kbd> – 現在時刻を入力</Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogTitle>タスクの入力について</DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid item xs={12}>
                <Typography gutterBottom variant="caption">
            セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
                </Typography>
                <Typography gutterBottom variant="caption">
            行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogTitle>アラームについて</DialogTitle>
          <DialogContent className={classes.content}>
            <Grid container>
              <Grid item xs={12}>
                <Typography gutterBottom variant="caption">
            終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
                </Typography>
                <Typography gutterBottom variant="caption">
            開始時刻を削除、もしくは終了時刻を入力すると終了通知の予約は削除されます。
                </Typography>
                <Typography gutterBottom variant="caption">
            通知が表示されない場合はこちらをご参照ください。<a href={constants.CHROME_HELP_PERMISSION_URL} target="_blank">サイトの許可を変更する Google Chrome</a>
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
        </div>
      )}
    </Dialog>
  );
}

HelpDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(HelpDialog);
