import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import constants from '../constants';
import util from '../util';
import '../styles/helpdialog.css';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '4em 2em 0',
    maxWidth: '100%',
    margin: '0 auto',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
  link: {
    textDecoration: 'none',
  },
};


class WorkSheetList extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentWillMount() {
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={classes.content}>
              <div style={{ marginBottom: 30 }}>
                <Typography gutterBottom variant="title">{constants.TITLE}({constants.APP_VERSION})へようこそ！</Typography>
                <Typography variant="body2">
                  Tips<span role="img" aria-label="Tips">💡</span>
                </Typography>
                <Typography gutterBottom variant="body1">
                  もしまだコミュニティに参加されていなければ是非
                  　<a style={{ textDecoration: 'none' }} href={constants.COMMUNITY_URL} target="_blank">slackコミュニティ</a>　に参加してみてください！<br />
                  クローズドβ版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜<br />
                  {constants.TITLE}の話以外にもいろいろな雑談☕がゆる～く行われています。
                </Typography>
              </div>
              <Divider />
            </div>
          </div>
        </Grid>
      </Grid>
    );
  }
}

WorkSheetList.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(WorkSheetList);

