import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';

import titleGr from '../images/title_gr.png';
import Footer from '../components/Footer';
import screencapture from '../images/screencapture.gif';
import plugins from '../images/plugins.png';
import devices from '../images/devices.png';
import collaboration from '../images/collaboration.png';
import GPL from '../images/GPL.png';
import constants from '../constants';
import util from '../util';

const styles = theme => ({
  content: {
    paddingTop: util.isMobile ? '6em' : '3em',
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
  stroke: {
    color: constants.brandColor.light.BLUE,
    WebkitTextStroke: `1px ${constants.brandColor.base.BLUE}`,
  },
});

function Top(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              Build Your WorkFlow
            </Typography>
            <img style={{ margin: '2em 2em 2em 1.7em' }} src={titleGr} alt="taskontable" height="40" />
            <Typography align="center" style={{ marginBottom: '2em' }}>
            TaskontableはExcelライクなタスク管理ツールです。
            </Typography>
            <Typography align="center" style={{ marginBottom: '2em' }}>
            タスクをシーケンシャルにすることで生産性を向上させ一日をスムーズに進行することができます。<br />
            </Typography>
            <Link style={{ marginBottom: '1em', display: 'inline-block' }} className={classes.link} to="/signup">
              <Button variant="raised" className={classes.button} color="primary" >無料登録して始める</Button>
            </Link>
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
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginBottom: '2em' }}>
              Plugin
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={plugins} alt="taskontable" />
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography align="center" style={{ marginBottom: '2em' }}>
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
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginBottom: '2em' }}>
              Collaboration
            </Typography>
            <Grid spacing={0} container alignItems="stretch" justify="center">
              <Grid item xs={12} md={7}>
                <Typography align="center" style={{ marginBottom: '2em' }}>
            ワークフローをチームで共有することが可能です。<br />
              リアルタイムに進捗状況・予定を把握することができます。
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={collaboration} alt="taskontable" />
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper square className={classes.center} elevation={0}>
          <div className={classes.content}>
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginBottom: '2em' }}>
            Anytime, anywhere
            </Typography>
            <Typography align="center" style={{ marginBottom: '2em' }}>
                いつ、どこにいてもあらゆるデバイスのChromeで快適なタスク管理が可能です。
            </Typography>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src={devices} alt="taskontable" />
          </div>
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginBottom: '2em' }}>
              General Public License
            </Typography>
            <Typography align="center" style={{ marginBottom: '2em' }}>
              ソースコードをGNU General Public License (GPL) の下、<a style={{ margin: '0 .4em' }} href={constants.REPOSITORY_URL} target="_blank">github</a>で公開・配布しています。
            </Typography>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src={GPL} alt="taskontable" />
          </div>
        </Paper>
      </Grid>
      <Footer />
    </Grid>
  );
}

Top.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Top);

