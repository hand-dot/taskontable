import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';

import titleGr from '../images/title_gr.png';
import titleWh from '../images/title_wh.png';
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
            <Typography color="textSecondary" variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              Build Your WorkFlow
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              with
            </Typography>
            <img style={{ margin: '2em 2em 2em 1.7em' }} src={titleGr} alt="taskontable" height="40" />
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
            毎日のワークフローを簡単に構築できるタスクマネージャー。
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
            タスクをシーケンシャルにすることで生産性を向上させ一日をスムーズに進行することができます。<br />
            </Typography>
            <Link style={{ marginBottom: '1em', display: 'inline-block' }} className={classes.link} to="/signup"><Button variant="raised" className={classes.button} color="primary" >無料登録して始める</Button></Link>
            <div><Link to="/login">アカウントへのログインはこちら</Link></div>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <Typography align="center" style={{ color: '#fff', marginBottom: '2em' }}>
              TaskontableはExcelを扱うようにタスクを管理できるツールです。<br />高速に入力でき、タスクの整理に使う時間をできる限り減らし、実行する時間を増やすことができます。
            </Typography>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src={screencapture} alt="taskontable" />
            <Typography align="center" style={{ color: '#fff', marginBottom: '2em' }}>
              複雑な設定は一切必要なく、すぐに使い始められます。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
              Plugin
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
                  <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src={scripts} alt="taskontable" />
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
                プラグインをインストールしてさまざまなサービスと連携できます。<br />
              また誰でもプラグインを公開することが可能です。
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
              Collaboration
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
            ワークフローをチームで共有することが可能です。<br />
              リアルタイムに進捗状況・予定を把握することができます。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.center} elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
            Anytime, anywhere
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
                いつ、どこにいてもあらゆるデバイスで快適なタスク管理が可能です。
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography color="textSecondary" variant="headline" align="center" style={{ marginBottom: '2em' }}>
                  <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src={devices} alt="taskontable" />
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
              Open Source
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginBottom: '2em' }}>
              ソースコードを<a style={{ margin: '0 .4em' }} href={constants.REPOSITORY_URL} target="_blank">github</a>で公開・配布されています。<br />全てが無料です。
            </Typography>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <Typography color="textSecondary" variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              Build Your WorkFlow
            </Typography>
            <Typography color="textSecondary" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              with
            </Typography>
            <img style={{ margin: '2em auto', display: 'block' }} src={titleWh} alt="taskontable" height="40" />
          </div>
          <div className={classes.content}>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.CONTACT_URL} target="_blank">お問い合わせ</a>
              </Grid>
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.ROADMAP_URL} target="_blank">ロードマップ</a>
              </Grid>
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.REPOSITORY_URL} target="_blank">Github</a>
              </Grid>
              <Grid item xs={12} style={{ marginTop: '2em' }} className={classes.center}>
                hand-dot © Copyright 2018. All rights reserved.
              </Grid>
            </Grid>
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

