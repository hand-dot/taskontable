import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import pcMan from '../images/illust/pc_man.jpg';
import skateboard from '../images/illust/skateboard.jpg';
import teamMens from '../images/illust/team_mens.jpg';
import example from '../images/example.png';
import Footer from '../components/Footer';
import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';

const styles = theme => ({
  content: {
    paddingTop: '3em',
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
});

function Top(props) {
  const isMobile = util.isMobile();
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="center" justify="center">
      <Grid className={classes.center} item xs={12}>
        <div className={classes.content} style={{ paddingTop: '6em' }}>
          <Typography variant="headline" align="center" style={{ marginBottom: '2em' }}>
            {i18n.t('top.taskontableIsToDoListAndTimeKeeperOnSpreadsheet')}
          </Typography>
          <iframe
            style={{ display: 'block', margin: '0 0 2em' }}
            title="Getting Started Taskontable"
            width={isMobile ? window.innerWidth : '960'}
            height={isMobile ? window.innerWidth * 0.56 : '540'} // 16:9
            src={`https://www.youtube.com/embed/${constants.YOUTUBE_MOVIE_ID}?rel=0&showinfo=0&modestbranding=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <Typography variant="subheading" style={{ marginBottom: '1em' }} align="center">
            {i18n.t('top.toTheHardWorkerWhoSpendsMostOfTheDayInFrontOfComputer')}
          </Typography>
          <Typography variant="subheading" style={{ marginBottom: '1em' }} align="center">
            {i18n.t('top.whyDontYouFinishWorkEarly')}
          </Typography>
          <Link className={classes.link} to="/signup">
            <Button variant="raised" className={classes.button} color="primary">
              {i18n.t('top.signUpItsFree')}
            </Button>
          </Link>
        </div>
      </Grid>
      <Grid item xs={12}>
        <Divider />
        <div className={classes.center}>
          <div className={classes.content}>
            <Grid spacing={0} container alignItems="center" justify="center">
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={pcMan} alt="pcMan" />
              </Grid>
              <Grid item xs={12} md={7}>
                <Typography variant="subheading" align="center" style={{ marginBottom: '2em' }}>
                  {i18n.t('top.aToolForClearingTasksOneByOne')}
                  <br />
                  {i18n.t('top.singleTaskIsBoostPersonalProductivity')}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Grid spacing={0} container alignItems="center" justify="center">
              <Grid style={{ display: isMobile ? 'none' : 'block' }} item xs={12} md={7}>
                <Typography variant="subheading" align="center" style={{ marginBottom: '2em' }}>
                  {i18n.t('top.modernAndClassicalInterface')}
                  <br />
                  {i18n.t('top.SimpleFastBeautifulMoreFun')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={5}>
                <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 300 }} src={skateboard} alt="skateboard" />
              </Grid>
              <Grid style={{ display: !isMobile ? 'none' : 'block' }} item xs={12} md={7}>
                <Typography variant="subheading" align="center" style={{ marginBottom: '2em' }}>
                  {i18n.t('top.modernAndClassicalInterface')}
                  <br />
                  {i18n.t('top.SimpleFastBeautifulMoreFun')}
                </Typography>
              </Grid>
            </Grid>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <img className={classes.center} style={{ marginBottom: '2em', width: '100%', maxWidth: 600 }} src={teamMens} alt="teamMens" />
            <Typography variant="subheading" align="center" style={{ marginBottom: '2em' }}>
              {i18n.t('top.developedForIndividualsAndTeams')}
              <br />
              {i18n.t('top.canCollaborateInRealtime')}
            </Typography>
          </div>
        </div>
      </Grid>
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Typography variant="subheading" align="center" style={{ marginBottom: '2em' }}>
              <span role="img" aria-label="Help">
              👀
              </span>
              <a href={constants.INTERVIEW_URL}>{i18n.t('top.ifYouNeedProductionStoryCheckCreatorsInterview')}</a>
            </Typography>
          </div>
        </div>
      </Grid>
      <Grid className={classes.center} item xs={12}>
        <Divider />
        <div className={classes.content}>
          <Typography style={{ fontWeight: 'bold' }} variant={isMobile ? 'display1' : 'display3'} align="center">
            <span role="img" aria-label="Help">
            👉
            </span>
            <a href={constants.DEMO_URL}>
              {i18n.t('top.checkDemo')}
              {isMobile && (
                <Typography>
                  *
                  {i18n.t('top.appForPc')}
                </Typography>
              )}
              <img
                className={classes.center}
                style={{
                  marginBottom: '2rem', width: '100%', maxWidth: 757, borderLeft: 'solid 1px #eee',
                }}
                src={example}
                alt="example"
              />
            </a>
          </Typography>
          <Typography variant="subheading" style={{ marginBottom: '1em' }} align="center">
            {i18n.t('top.toTheHardWorkerWhoSpendsMostOfTheDayInFrontOfComputer')}
          </Typography>
          <Typography variant="subheading" style={{ marginBottom: '1em' }} align="center">
            {i18n.t('top.whyDontYouFinishWorkEarly')}
          </Typography>
          <Link className={classes.link} to="/signup">
            <Button variant="raised" className={classes.button} color="primary">
              {i18n.t('top.signUpItsFree')}
            </Button>
          </Link>
        </div>
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
