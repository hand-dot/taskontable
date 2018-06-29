import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import SnsShare from '../components/SnsShare';
import constants from '../constants';
import util from '../util';
import '../styles/helpdialog.css';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '4.5em 2em 0',
  },
};


class Hello extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentWillMount() {
    setTimeout(() => {
      if (!util.isMobile()) {
        window.onkeydown = (e) => {
          if (constants.shortcuts.TOGGLE_HELP(e)) {
            e.preventDefault();
            this.props.toggleHelpDialog();
          }
        };
      }
    });
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
                  クローズドβ版ならではの限られた数人のコミュニティにユニークな開発者、ユーザーがいます😜
              </Typography>
            </div>
            <Divider />
            <div style={{ marginTop: 30, marginBottom: 30 }}>
              <Typography gutterBottom variant="body2">
                Help<span role="img" aria-label="Help">😵</span>
              </Typography>
              <Typography gutterBottom variant="body1">
                使い方が分からなければヘッダーの<b>(?)</b>をクリックしてみてください！ショートカットなど使い方が大体書いてあります。<br />
                もしそれでも分からないときはヘッダーの<b>(i)</b>をクリックしてお問い合わせしてください。<br />
                フィードバックは大歓迎！いつでもあなたのご意見をお待ちしております😍
              </Typography>
            </div>
            <Divider />
            <div style={{ marginTop: 30, marginBottom: 30 }}>
              <Typography gutterBottom variant="body2">
              Please<span role="img" aria-label="Help">🙏</span>
              </Typography>
              <Typography gutterBottom variant="body1">
                使ってみて、もし気に入ったらお友達や同僚にシェアしてほしいです！
              </Typography>
              <SnsShare title={constants.TITLE} shareUrl={constants.URL} />
              <br />
              <Typography gutterBottom variant="body1">
                それともしgithubのアカウントを持っていたらスターをもらえると嬉しいです！
              </Typography>
              <iframe title="Star hand-dot/taskontable on GitHub" src="https://ghbtns.com/github-btn.html?user=hand-dot&repo=taskontable&type=star&count=true&size=large" frameBorder="0" scrolling="0" width="160px" height="30px" />
            </div>
            <Divider />
          </div>
        </Grid>
      </Grid>
    );
  }
}

Hello.propTypes = {
  toggleHelpDialog: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Hello);

