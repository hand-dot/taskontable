import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

import titleWh from '../images/title_wh.png';
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

function Footer(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <Typography variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em', color: '#fff' }}>
              Build Your WorkFlow
            </Typography>
            <img style={{ margin: '2em auto', display: 'block' }} src={titleWh} alt="taskontable" height="40" />
            <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '4em' }}>
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.CONTACT_URL} target="_blank">お問い合わせ</a>
              </Grid>
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.ROADMAP_URL} target="_blank">ロードマップ</a>
              </Grid>
              <Grid item xs={4} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.REPOSITORY_URL} target="_blank">Github</a>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Footer);

