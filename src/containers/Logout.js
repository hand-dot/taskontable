import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Footer from '../components/Footer';
import constants from '../constants';
import util from '../util';
import i18n from '../i18n';

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

function Logout(props) {
  const isMobile = util.isMobile();
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <div className={classes.center}>
          <div className={classes.content}>
            <Typography variant={isMobile ? 'display2' : 'display3'} align="center">
              {i18n.t('logOut.thanksForUsing_title', { title: constants.TITLE })}
            </Typography>
            <div style={{ fontSize: 12, marginTop: 20 }}>
              <Link to="/">{i18n.t('common.backToTop')}</Link>
            </div>
          </div>
        </div>
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

