import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Title from './Title';
import SnsShare from './SnsShare';
import constants from '../constants';
import i18n from '../i18n';

const styles = {
  content: {
    paddingBottom: '3em',
    paddingLeft: 10,
    paddingRight: 10,
    maxWidth: 960,
    margin: '0 auto',
  },
};

function Footer(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Divider style={{ margin: '0 0 7em' }} />
        <Paper square elevation={0}>
          <div className={classes.content}>
            <Title />
            <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '7em' }}>
              <Grid item xs={3} style={{ marginBottom: '2em', textAlign: 'center' }} className={classes.center}>
                <a style={{ fontSize: 12, margin: '0 .4em' }} href={constants.CONTACT_URL} target="_blank">
                  {i18n.t('external.contact')}
                </a>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '2em', textAlign: 'center' }} className={classes.center}>
                <a style={{ fontSize: 12, margin: '0 .4em' }} href={constants.COMMUNITY_URL} target="_blank">
                  {i18n.t('external.community')}
                </a>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '2em', textAlign: 'center' }} className={classes.center}>
                <a style={{ fontSize: 12, margin: '0 .4em' }} href={constants.BLOG_URL} target="_blank">
                  {i18n.t('external.blog')}
                </a>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '2em', textAlign: 'center' }} className={classes.center}>
                <a style={{ fontSize: 12, margin: '0 .4em' }} href={constants.ROADMAP_URL} target="_blank">
                  {i18n.t('external.roadMap')}
                </a>
              </Grid>
              <Grid item xs={12} style={{ marginBottom: '2em', textAlign: 'center' }} className={classes.center}>
                <iframe style={{ marginBottom: '2em' }} title="Star hand-dot/taskontable on GitHub" src="https://ghbtns.com/github-btn.html?user=hand-dot&repo=taskontable&type=star&count=true&size=small" width="80" height="20" frameBorder="0" scrolling="0" />
                <SnsShare title={constants.TITLE} shareUrl={constants.URL} />
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
