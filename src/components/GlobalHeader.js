import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';
import Hidden from 'material-ui/Hidden';
import Avatar from 'material-ui/Avatar';

import DescriptionDialog from './DescriptionDialog';
import HelpDialog from './HelpDialog';

import constants from '../constants';

import title from '../images/title_wh.png';

const styles = {
  root: {
    backgroundColor: 'transparent',
  },
  userPhoto: {
    width: 25,
    height: 25,
  },
  iconButton: {
    color: '#fff',
  },
  toolbar: {
    maxWidth: constants.APPWIDTH,
    margin: '0 auto',
  },
  title: {
    marginLeft: 10,
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
    color: 'rgba(0, 0, 0, 0.87)',
  },
};

class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      openMenuKey: '',
      isOpenDescriptionDialog: false,
    };
  }

  componentWillMount() {
    this.login();
  }

  componentDidMount() {
  }

  closeMenu() {
    this.setState({ anchorEl: null, openMenuKey: '' });
  }

  handleMenu(event) {
    const menuKey = event.currentTarget.getAttribute('data-menu-key');
    this.setState({ anchorEl: event.currentTarget, openMenuKey: menuKey });
  }

  handleMenuItem(event) {
    const menuItemKey = event.currentTarget.getAttribute('data-menu-item-key');
    if (constants.menuItemKey.DESCRIPTION === menuItemKey) {
      this.setState({ isOpenDescriptionDialog: true });
    } else if (constants.menuItemKey.CONTACT === menuItemKey) {
      window.open(constants.CONTACTURL);
    } else if (constants.menuItemKey.GIT === menuItemKey) {
      window.open(constants.REPOSITORYURL);
    }
  }

  closeDescriptionDialog() {
    this.setState({ isOpenDescriptionDialog: false });
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.props.loginCallback(firebase.auth().currentUser);
      } else {
        firebase.auth().signInWithRedirect(provider);
      }
    });
  }

  logout() {
    firebase.auth().signOut().then(() => {
      this.closeMenu();
      this.props.logoutCallback();
    }).catch((error) => {
      // FIXME エラーをどこかのサービスに送信したい
      // https://sentry.io/
      console.error(error);
      window.location.reload();
    });
  }

  render() {
    const { user, isOpenHelpDialog, openHelpDialog, closeHelpDialog, classes } = this.props;
    const { anchorEl } = this.state;

    return (
      <AppBar position="static" className={classes.root}>
        <Grid container alignItems="stretch" justify="center" spacing={0} className={classes.toolbar}>
          <Hidden xsDown>
            <Grid item xs={1} />
          </Hidden>
          <Grid item xs={12} sm={10}>
            <Toolbar>
              <img src={title} alt="taskontable" height="25" className={classes.title} />
              <div>
                <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="user">
                  {(() => {
                    if (user.photoURL) {
                      return <Avatar className={classes.userPhoto} src={user.photoURL} />;
                    }
                    return <i className="fa fa-user-circle" />;
                  })()}
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'user'}
                  onRequestClose={this.closeMenu.bind(this)}
                >
                  <MenuItem>アカウント名: {user.displayName}</MenuItem>
                  <MenuItem onClick={this.logout.bind(this)}>
                    <i className="fa fa-sign-out" aria-hidden="true" />　ログアウト
                  </MenuItem>
                </Menu>
              </div>
              <div>
                <IconButton className={classes.iconButton} onClick={openHelpDialog}>
                  <i className="fa fa-question-circle" />
                </IconButton>
              </div>
              <div>
                <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="info">
                  <i className="fa fa-info-circle" />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={this.state.openMenuKey === 'info'}
                  onRequestClose={this.closeMenu.bind(this)}
                >
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.DESCRIPTION}>
                    <i className="fa fa-info" aria-hidden="true" />
                    　サービスについて
                  </MenuItem>
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.CONTACT}>
                    <i className="fa fa-envelope-o" aria-hidden="true" />
                    　お問い合わせ
                  </MenuItem>
                  <MenuItem onClick={this.handleMenuItem.bind(this)} data-menu-item-key={constants.menuItemKey.GIT}>
                    <i className="fa fa-github" aria-hidden="true" />
                    　ソースコード
                  </MenuItem>
                </Menu>
              </div>
            </Toolbar>
          </Grid>
          <Hidden xsDown>
            <Grid item xs={1} />
          </Hidden>
        </Grid>
        <DescriptionDialog
          open={this.state.isOpenDescriptionDialog}
          onRequestClose={this.closeDescriptionDialog.bind(this)}
        />
        <HelpDialog
          open={isOpenHelpDialog}
          onRequestClose={closeHelpDialog}
        />
      </AppBar>
    );
  }
}

GlobalHeader.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  isOpenHelpDialog: PropTypes.bool.isRequired,
  openHelpDialog: PropTypes.func.isRequired,
  closeHelpDialog: PropTypes.func.isRequired,
  loginCallback: PropTypes.func.isRequired,
  logoutCallback: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GlobalHeader);
