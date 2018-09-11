import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Title from './Title';
import SnsShare from './SnsShare';
import Bmc from './Bmc';
import GithubStart from './GithubStart';
import constants from '../constants';
import i18n from '../i18n';
import appStore from '../images/app_store.png';
import googlePlay from '../images/google_play.png';
import chromeWebstore from '../images/chrome_webstore.png';

const styles = {
  content: {
    paddingBottom: '3em',
    paddingLeft: 10,
    paddingRight: 10,
    maxWidth: 960,
    margin: '0 auto',
  },
  item: {
    marginBottom: '2em',
    textAlign: 'center',
  },
  getterBottom: {
    marginBottom: '1em',
  },
  link: {
    fontSize: 12,
    margin: '0 .4em',
  },
};

const apps = [{
  href: `https://chrome.google.com/webstore/detail/${constants.CHROME_EXTENTION_ID}`,
  src: chromeWebstore,
  alt: 'ChromeWebstore',
},
{
  href: constants.SUBSCRIBE_URL,
  src: appStore,
  alt: 'AppStore',
}, {
  href: constants.SUBSCRIBE_URL,
  src: googlePlay,
  alt: 'GooglePlay',
}];

const externals = [
  { label: 'contact', href: constants.CONTACT_URL },
  { label: 'community', href: constants.COMMUNITY_URL },
  { label: 'blog', href: constants.BLOG_URL },
  { label: 'roadMap', href: constants.ROADMAP_URL },
  { label: 'pressKit', href: constants.PRESSKIT_URL },
];

class Footer extends Component {
  componentDidMount() {
    if (window.twttr) {
      window.twttr.widgets.load(this.twFollowButton);
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid spacing={0} container alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Divider style={{ margin: '0 0 4em' }} />
          <Paper square elevation={0}>
            <div className={classes.content}>
              <Title />
              <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '4em' }}>
                {apps.map(_ => (
                  <Grid key={_.alt} item xs={12} sm={4} className={classes.item}>
                    <a
                      className={classes.link}
                      href={_.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <img src={_.src} alt={_.alt} />
                    </a>
                  </Grid>
                ))}
                {externals.map(_ => (
                  <Grid key={_.label} item xs={12} sm={2} className={classes.item}>
                    <a
                      className={classes.link}
                      href={_.href}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {i18n.t(`external.${_.label}`)}
                    </a>
                  </Grid>
                ))}
                <Grid item xs={12} className={classes.item}>
                  <div className={classes.getterBottom}>
                    <GithubStart
                      title="Star hand-dot/taskontable on GitHub"
                      user="hand-dot"
                      repo="taskontable"
                      size="small"
                      width="80"
                      height="20"
                    />
                  </div>
                  <div className={classes.getterBottom}>
                    <a
                      ref={(twFollowButton) => { this.twFollowButton = twFollowButton; }}
                      href="https://twitter.com/taskontable?ref_src=twsrc%5Etfw"
                      className="twitter-follow-button"
                      data-show-count="false"
                    >
                    Follow @taskontable
                    </a>
                  </div>
                  <div className={classes.getterBottom}>
                    <SnsShare title={constants.TITLE} shareUrl={constants.URL} />
                  </div>
                  <div>
                    <Bmc id={constants.BMC_ID} />
                  </div>
                </Grid>
              </Grid>
            </div>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}


Footer.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Footer);
