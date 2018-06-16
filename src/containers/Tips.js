import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import constants from '../constants';
import util from '../util';
import '../styles/helpdialog.css';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '4em 2em 0',
    maxWidth: '100%',
    margin: '0 auto',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
  link: {
    textDecoration: 'none',
  },
};


class WorkSheetList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={classes.content}>
              <div style={{ marginBottom: 30 }}>
                <Typography style={{ color: '#fff' }} gutterBottom variant="title">{constants.TITLE}({constants.APP_VERSION})へようこそ！</Typography>
                <Typography style={{ color: '#fff' }} variant="body2">
                  Tips<span role="img" aria-label="Tips">💡</span>
                </Typography>
                <Typography style={{ color: '#fff' }} gutterBottom variant="body1">
                  もしまだコミュニティに参加されていなければ是非
                  　<a style={{ textDecoration: 'none' }} href={constants.COMMUNITY_URL} target="_blank">slackコミュニティ</a>　に参加してみてください！<br />
                  クローズドβ版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜<br />
                  {constants.TITLE}の話以外にもいろいろな雑談☕がゆる～く行われています。
                </Typography>
              </div>
              <Divider />
              <div style={{ marginTop: 30 }}>
                <div>
                  <h5>テーブルの色</h5>
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <Typography gutterBottom variant="caption">
                        見積を入力していないタスクは<span className={classes.block} style={{ color: constants.cellColor.WARNING }}>■</span>(黄色)になります。
                      </Typography>
                      <Typography gutterBottom variant="caption">
                        開始時刻を予約したタスクは<span className={classes.block} style={{ color: constants.cellColor.RESERVATION }}>■</span>(緑色)になります。
                      </Typography>
                      <Typography gutterBottom variant="caption">
                        実行中のタスクは<span className={classes.block} style={{ color: constants.cellColor.RUNNING }}>■</span>(青色)になります。
                      </Typography>
                      <Typography gutterBottom variant="caption">
                        見積を過ぎたのタスクは<span className={classes.block} style={{ color: constants.cellColor.OUT }}>■</span>(赤色)になります。
                      </Typography>
                      <Typography gutterBottom variant="caption">
                        完了したタスクは<span className={classes.block} style={{ color: constants.cellColor.DONE }}>■</span>(灰色)になります。
                      </Typography>
                    </Grid>
                  </Grid>
                </div>
                {!util.isMobile() && (
                <div>
                  <h5>キーボードショートカット</h5>
                  <Grid container spacing={0}>
                    <Grid className={classes.shotcut} item xs={6}>
                      <h5>アプリ</h5>
                      {/* ヘルプだけはmacOSでクロームのヘルプがアプリのレベルで割り当てられていてctrlにしなければいけない */}
                      <Typography gutterBottom variant="caption"><kbd>ctrl</kbd> + <kbd>?</kbd> – ヘルプを表示</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>S</kbd> – 保存</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>J</kbd> – ダッシュボード開閉</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>&gt;</kbd> – 次の日に移動</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>&lt;</kbd> – 前の日に移動</Typography>
                    </Grid>
                    <Grid className={classes.shotcut} item xs={6}>
                      <h5>テーブル編集</h5>
                      <Typography gutterBottom variant="caption"><kbd>右クリック</kbd> – コンテキストメニュー表示</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>C</kbd> – コピー</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>X</kbd> – 切り取り</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>V</kbd> – 貼り付け</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>Z</kbd> – 戻る</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>Y</kbd> – 進む</Typography>
                      <Typography gutterBottom variant="caption"><kbd>{constants.METAKEY}</kbd> + <kbd>:</kbd> – 現在時刻を入力</Typography>
                    </Grid>
                  </Grid>
                  <h5>タスクの入力について</h5>
                  <Grid container spacing={0}>
                    <Grid item xs={12}>
                      <Typography gutterBottom variant="caption">
                        セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
                      </Typography>
                      <Typography gutterBottom variant="caption">
                        行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
                      </Typography>
                    </Grid>
                  </Grid>
                  <h5>アラームについて</h5>
                  <Grid container spacing={0}>
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
                </div>
              )}
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}

WorkSheetList.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(WorkSheetList);

