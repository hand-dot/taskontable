import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';

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
});

function Footer(props) {
  const { classes } = props;
  return (
    <Grid spacing={0} container alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper square className={classes.bgTransparent} elevation={0}>
          <div className={classes.content}>
            <Typography align="center" style={{ marginBottom: '2em', color: '#fff' }}>
            お友達にシェアしてみませんか？
            </Typography>
            {/* カラーコード参考 https://qiita.com/AcaiBowl/items/8ee0a5a6c994685fb1cd */}
            <div style={{ textAlign: 'center' }}>
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
            </div>
            <Typography variant="display3" align="center" style={{ marginTop: '0.5em', marginBottom: '0.5em', color: '#fff' }}>
              Build Your WorkFlow
            </Typography>
            <img style={{ margin: '2em auto', display: 'block' }} src={titleWh} alt="taskontable" height="40" />
            <Grid spacing={0} container alignItems="stretch" justify="center" style={{ paddingTop: '4em' }}>
              <Grid item xs={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.CONTACT_URL} target="_blank">お問い合わせ</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.COMMUNITY_URL} target="_blank">コミュニティー</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.BLOG_URL} target="_blank">ブログ</a>
              </Grid>
              <Grid item xs={2} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.ROADMAP_URL} target="_blank">ロードマップ</a>
              </Grid>
              <Grid item xs={3} style={{ marginBottom: '2em' }} className={classes.center}>
                <a style={{ margin: '0 .4em', color: '#fff' }} href={constants.REPOSITORY_URL} target="_blank">ソースコード</a>
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

