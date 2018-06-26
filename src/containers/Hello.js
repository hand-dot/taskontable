import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Help from '@material-ui/icons/Help';

import constants from '../constants';
import '../styles/helpdialog.css';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '4em 2em 0',
    // maxWidth: 960,
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
          <div className={classes.content}>
            <Typography gutterBottom variant="title">{constants.TITLE}({constants.APP_VERSION})へようこそ！</Typography>
            <div style={{ marginTop: 30, marginBottom: 30 }}>
              <Typography gutterBottom variant="body2">
              Community<span role="img" aria-label="Community">😉</span>
              </Typography>
              <Typography gutterBottom variant="body1">
                  もしまだコミュニティに参加されていなければ是非
                <a style={{ textDecoration: 'none' }} href={constants.COMMUNITY_URL} target="_blank">slackコミュニティ</a>に参加してみてください！<br />
                  クローズドβ版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜<br />
                {constants.TITLE}の話以外にもいろいろな雑談☕がゆる～く行われています。
              </Typography>
            </div>
            <Divider />
            <div style={{ marginTop: 30, marginBottom: 30 }}>
              <Typography gutterBottom variant="body2">
                Help<span role="img" aria-label="Help">😵</span>
              </Typography>
              <Typography gutterBottom variant="body1">
                もし使い方が分からなければヘッダーの❓をクリックしてみてください！ショートカットなど使い方が大体書いてあります。<br />
                もしそれでもわからないときはヘッダーのℹをクリックしてお問い合わせしてください🙏<br />
                フィードバックは大歓迎！あなたのご意見をお待ちしております。
              </Typography>
            </div>
            <Divider />
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

