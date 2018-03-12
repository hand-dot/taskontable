import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';

import title from '../images/title_gr.png';
import screencapture from '../images/screencapture.png';
import scripts from '../images/scripts.png';
import devices from '../images/devices.png';
import constants from '../constants';

const styles = theme => ({
  content: {
    paddingTop: theme.breakpoints.values.sm < constants.APPWIDTH ? '7em' : '3em',
    paddingBottom: '3em',
    paddingLeft: 10,
    paddingRight: 10,
    maxWidth: 960,
    margin: '0 auto',
  },
  textBox: {
    maxWidth: 600,
    margin: '0 auto',
  },
  bgTransparent: {
    backgroundColor: 'transparent',
    color: '#fff',
  },
  link: {
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
    display: 'block',
  },
  button: {
    margin: theme.spacing.unit,
  },
  center: {
    display: 'block',
    margin: '0 auto',
    textAlign: 'center',
  },
});

function Top(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <img style={{ margin: '3em' }} src={title} alt="taskontable" height="40" />
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
              毎日のワークフローを簡単に作成できるタスクマネージャー
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
              毎日のワークフローを自動的に作成し、タスクを直列化することで生産性を向上させることができます。<br />
              終了時刻を常に意識させ、各タスクの開始・終了時刻に通知をするので一日をスムーズに進行することができます。<br />
            </Typography>
            <Link style={{ marginBottom: '1em', display: 'inline-block' }} className={classes.link} to="/signup"><Button variant="raised" className={classes.button} color="primary" >無料登録して始める</Button></Link>
            <div><Link to="/login">アカウントへのログインはこちら</Link></div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <div style={{ marginBottom: '2em' }} className={classes.textBox}>
              TaskontableはExcelを扱うようにタスクを管理できるツールです。高速に入力でき、タスクの整理に使う時間をできる限り減らし、実行する時間を増やすことができます。
            </div>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src={screencapture} alt="taskontable" />
            <div style={{ marginBottom: '2em' }} className={classes.textBox}>
              どのデバイスでも最新状況をいつでも把握できるよう、保存したテーブルの内容はリアルタイムでアップデートします。複雑な設定は一切必要なく、すぐに使い始められます。
            </div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
              　オープンソース
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
              ソースコードを<a style={{ margin: '0 .4em' }} href={constants.REPOSITORY_URL} target="_blank">github</a>で公開・配布されています。<br />全てが無料です。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.center} elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
              　あらゆるデバイスに対応
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={6}>
                <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
                  あらゆるデバイスで快適なタスク管理が可能に。いつ、どこにいても最新情報をチェックして素早く対応できます。
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
                  <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src={devices} alt="taskontable" />
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
            　プラグイン
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={6}>
                <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
                  <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src={scripts} alt="taskontable" />
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
                プラグインをインストールしてさまざまなサービスと連携することが可能です。<br />
              また誰でも作成したスクリプトを公開することが可能です。
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
              　コラボレーション
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
            　ワークフローをチームで共有することが可能です。<br />
              リアルタイムに進捗状況・予定を簡単に把握することができます。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent}elevation={0}>
          <div className={classes.content}>
            <div style={{ marginBottom: '1em' }} className={classes.center}>
              <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.CONTACT_URL} target="_blank">お問い合わせ</a>
            </div>
            <div className={classes.center}>
              hand-dot © Copyright 2018. All rights reserved.
            </div>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

Top.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Top);

