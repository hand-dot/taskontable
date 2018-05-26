import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import titleGr from '../images/title_gr.png';
import Footer from '../components/Footer';
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
    color: theme.palette.primary.light,
    WebkitTextStroke: `1px ${theme.palette.primary.main}`,
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
              {constants.TITLE}はExcelライクなタスク管理ツールです。
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
              {constants.TITLE}はExcelを扱うようにタスクを管理できるツールです。<br />高速に入力でき、タスクの整理に使う時間をできる限り減らし、実行する時間を増やすことができます。
            </Typography>
            {/* TODO ここは動画にする予定 */}
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%' }} src="https://user-images.githubusercontent.com/24843808/40023209-44d12cd0-5805-11e8-8b77-77a1f2f5ba37.gif" alt="taskontable" />
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
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2Fplugins.png?alt=media&token=8228e64e-36f0-43ef-bc4b-8e4e027e4bae" alt="taskontable" />
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
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2Fcollaboration.png?alt=media&token=e58901e6-f3c1-42f4-a5bd-85a079d5741b" alt="taskontable" />
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
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2Fdevices.png?alt=media&token=2cf665e4-87ac-4c3e-8bd9-5c555f9b653e" alt="taskontable" />
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
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 480 }} src="https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/assets%2FGPL.png?alt=media&token=6e0c8418-c002-47e9-a445-6d1559c8a436" alt="taskontable" />
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

