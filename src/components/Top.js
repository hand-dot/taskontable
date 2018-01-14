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
import constants from '../constants';

const styles = theme => ({
  content: {
    paddingTop: '3em',
    paddingBottom: '3em',
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
            <img style={{ marginBottom: '2em' }} src={title} alt="taskontable" height="40" />
            <Typography color="secondary" type="headline" align="center" style={{ marginBottom: '2em' }}>
              毎日のワークフローを簡単に作成できるタスクマネージャー
            </Typography>
            <Typography color="secondary" type="subheading" align="center" style={{ marginBottom: '2em' }}>
              毎日のワークフローを自動的に作成し、タスクを直列化することで生産性を向上させることができます。<br />
              終了時刻を常に表示し、各タスクの終了予定時刻に通知をするので高い集中力を保つことができます。<br />
            </Typography>
            <Link style={{ marginBottom: '1em', display: 'inline-block' }} className={classes.link} to="/signup"><Button raised className={classes.button} color="primary" >無料登録して始める</Button></Link>
            <div><Link to="/login">アカウントへのログインはこちら</Link></div>
            <Typography type="caption" gutterBottom>
              *現在Beta版のためデータがクリアさせる可能性があります。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <div style={{ marginBottom: '2em' }} className={classes.textBox}>
              TaskontableはExcelを扱うようにタスクを管理できるツールです。高速に入力でき、タスクの整理に使う時間をできる限り減らし、実行する時間を増やすことができます。
            </div>
            <img className={classes.center} style={{ marginBottom: '2em' }} src={screencapture} alt="taskontable" height="700" />
            <div style={{ marginBottom: '2em' }} className={classes.textBox}>
              どのデバイスでも最新状況をいつでも把握できるよう、保存したテーブルの内容はリアルタイムでアップデートします。複雑な設定は一切必要なく、すぐに使い始められます。
            </div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square elevation={0}>
          <div className={classes.content}>
            <div className={classes.center}>
              <a style={{ margin: '0 .4em' }} href={constants.CONTACTURL} target="_blank">お問い合わせ</a>
              <a style={{ margin: '0 .4em' }} href={constants.REPOSITORYURL} target="_blank">ソースコード</a>
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
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Top);
