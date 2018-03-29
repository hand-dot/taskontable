import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Footer from '../components/Footer';
import constants from '../constants';
import util from '../util';

const styles = theme => ({
  content: {
    paddingTop: util.isMobile ? '7em' : '3em',
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

function Logout(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper className={classes.center} square elevation={0}>
          <div className={classes.content}>
            <Typography className={classes.stroke} variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
              Did You Build Your Workflow?
            </Typography>
            <Typography variant="headline" align="center" style={{ marginBottom: '2em' }}>
            お使いいただきありがとうございました。<br />Taskontableからログアウトしました。
            </Typography>
            <Typography align="center" style={{ marginBottom: '2em' }}>
            お友達にシェアしてみませんか？
            </Typography>
            {/* カラーコード参考 https://qiita.com/AcaiBowl/items/8ee0a5a6c994685fb1cd */}
            <a style={{ textDecoration: 'none' }} href={`https://plus.google.com/share?url=${constants.URL}`} target="_blank">
              <Button style={{ color: '#fff', backgroundColor: '#dd4b39', textDecoration: 'none' }} variant="raised" className={classes.button}>Google+</Button>
            </a>
            <a style={{ textDecoration: 'none' }} href={`http://twitter.com/share?url=${constants.URL}`} target="_blank">
              <Button style={{ color: '#fff', backgroundColor: '#55acee', textDecoration: 'none' }} variant="raised" className={classes.button}>Twitter</Button>
            </a>
            <a style={{ textDecoration: 'none' }} href={`https://www.facebook.com/sharer/sharer.php?u=${constants.URL}`} target="_blank">
              <Button style={{ color: '#fff', backgroundColor: '#3B5998', textDecoration: 'none' }} variant="raised" className={classes.button}>Facebook</Button>
            </a>
            <a style={{ textDecoration: 'none' }} href={`http://line.me/R/msg/text/?${constants.URL}`} target="_blank">
              <Button style={{ color: '#fff', backgroundColor: '#1dcd00', textDecoration: 'none' }} variant="raised" className={classes.button}>LINE</Button>
            </a>
            <div style={{ fontSize: 12, marginTop: 20 }}>
              <Link to="/">Topに戻る</Link>
            </div>
          </div>
        </Paper>
      </Grid>
      <Footer />
    </Grid>
  );
}

Logout.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Logout);

