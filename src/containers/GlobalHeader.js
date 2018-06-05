import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Person from '@material-ui/icons/Person';
import Info from '@material-ui/icons/Info';
import Help from '@material-ui/icons/Help';
import Notifications from '@material-ui/icons/Notifications';

import HelpDialog from '../components/HelpDialog';

import constants from '../constants';
import util from '../util';

import title from '../images/title_gr.png';

const styles = theme => ({
  root: {
    minHeight: theme.mixins.toolbar.minHeight,
  },
  button: {
    minWidth: 70,
    padding: 3,
    fontSize: 9,
    margin: theme.spacing.unit,
  },
  userPhoto: {
    width: 25,
    height: 25,
  },
  iconButton: {
  },
  toolbar: {
    maxWidth: constants.APPWIDTH,
    margin: '0 auto',
  },
  title: {
    marginRight: 'auto',
  },
  link: {
    textDecoration: 'none',
  },
});

function handleMenuItem(event) {
  const menuItemKey = event.currentTarget.getAttribute('data-menu-item-key');
  if (constants.menuItemKey.CONTACT === menuItemKey) {
    window.open(constants.CONTACT_URL);
  } else if (constants.menuItemKey.GIT === menuItemKey) {
    window.open(constants.REPOSITORY_URL);
  } else if (constants.menuItemKey.ROADMAP === menuItemKey) {
    window.open(constants.ROADMAP_URL);
  } else if (constants.menuItemKey.COMMUNITY === menuItemKey) {
    window.open(constants.COMMUNITY_URL);
  } else if (constants.menuItemKey.BLOG === menuItemKey) {
    window.open(constants.BLOG_URL);
  }
}
class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
      anchorEl: null,
      openMenuKey: '',
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (window.Headway) window.Headway.init({ selector: '#changelog', account: constants.HEADWAY_ACCOUNT });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.uid !== '') {
      this.setState({ login: true });
    } else {
      this.setState({ login: false });
    }
    setTimeout(() => this.forceUpdate());
  }

  closeMenu() {
    this.setState({ anchorEl: null, openMenuKey: '' });
  }

  handleMenu(event) {
    const menuKey = event.currentTarget.getAttribute('data-menu-key');
    this.setState({ anchorEl: event.currentTarget, openMenuKey: menuKey });
  }

  logout() {
    this.closeMenu();
    setTimeout(() => this.props.logout());
  }

  goSettings() {
    this.closeMenu();
    setTimeout(() => this.props.goSettings());
  }

  goWorkSheetList() {
    this.closeMenu();
    setTimeout(() => this.props.goWorkSheetList());
  }

  render() {
    const {
      user, isOpenHelpDialog, openHelpDialog, closeHelpDialog, classes,
    } = this.props;
    const { anchorEl } = this.state;

    return (
      <AppBar color="default" position="fixed">
        <Grid container alignItems="stretch" justify="center" spacing={0} className={classes.toolbar}>
          <Grid item xs={12}>
            <Toolbar className={classes.root}>
              <Link className={classes.title} to="/"><img src={title} style={{ marginTop: 5 }} alt="taskontable" height="18" /></Link>
              {(() => {
                if (!this.state.login) {
                  return (
                    <div style={{ display: 'inline-flex' }}>
                      <Link className={classes.link} to="/login"><Button variant="raised" className={classes.button}>ログイン</Button></Link>
                      <Link className={classes.link} to="/signup"><Button variant="raised" className={classes.button} color="primary" >アカウント作成</Button></Link>
                    </div>);
                }
                return (
                  <div style={{ display: 'inline-flex' }}>
                    <div>
                      <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="user">
                        {user.photoURL ? <Avatar className={classes.userPhoto} src={user.photoURL} /> : <Person className={classes.userPhoto} />}
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={this.state.openMenuKey === 'user'}
                        onClose={this.closeMenu.bind(this)}
                      >
                        <MenuItem title={user.email}>アカウント名: {user.displayName}</MenuItem>
                        <MenuItem onClick={this.goWorkSheetList.bind(this)}>ワークシート選択</MenuItem>
                        <MenuItem onClick={this.goSettings.bind(this)}>アカウント設定</MenuItem>
                        <MenuItem onClick={this.logout.bind(this)}>ログアウト</MenuItem>
                      </Menu>
                    </div>
                    <div>
                      <IconButton className={classes.iconButton} onClick={openHelpDialog}>
                        <Help />
                      </IconButton>
                    </div>
                    <div>
                      <IconButton className={classes.iconButton} onClick={this.handleMenu.bind(this)} data-menu-key="info">
                        <Info />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={this.state.openMenuKey === 'info'}
                        onClose={this.closeMenu.bind(this)}
                      >
                        <MenuItem onClick={handleMenuItem} data-menu-item-key={constants.menuItemKey.CONTACT}>お問い合わせ</MenuItem>
                        <MenuItem onClick={handleMenuItem} data-menu-item-key={constants.menuItemKey.ROADMAP}>ロードマップ</MenuItem>
                        <MenuItem onClick={handleMenuItem} data-menu-item-key={constants.menuItemKey.BLOG}>ブログ</MenuItem>
                        <MenuItem onClick={handleMenuItem} data-menu-item-key={constants.menuItemKey.COMMUNITY}>コミュニティー</MenuItem>
                        <MenuItem onClick={handleMenuItem} data-menu-item-key={constants.menuItemKey.GIT}>ソースコード</MenuItem>
                      </Menu>
                    </div>
                  </div>);
              })()}
              <div style={{ display: 'inline-flex' }}>
                <IconButton className={classes.iconButton}>
                  <Notifications />
                  <span style={{ position: 'absolute', left: 15, top: 15 }} id="changelog" />
                </IconButton>
              </div>
            </Toolbar>
          </Grid>
        </Grid>
        <HelpDialog
          open={isOpenHelpDialog}
          onClose={closeHelpDialog}
        />
        <script async src="//cdn.headwayapp.co/widget.js" />
      </AppBar>
    );
  }
}

GlobalHeader.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  isOpenHelpDialog: PropTypes.bool.isRequired,
  openHelpDialog: PropTypes.func.isRequired,
  closeHelpDialog: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  goSettings: PropTypes.func.isRequired,
  goWorkSheetList: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(GlobalHeader);
