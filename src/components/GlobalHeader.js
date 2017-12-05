import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Menu, { MenuItem } from 'material-ui/Menu';

const styles = () => ({
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

class GlobalHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleRequestClose() {
    this.setState({ anchorEl: null });
  }

  logOut() {
    this.handleRequestClose();
    this.props.logOut();
  }

  render() {
    const { classes, userId } = this.props;
    const { anchorEl } = this.state;
    const open = Boolean(anchorEl);

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Toolbar style={{ minWidth: 960, margin: '0 auto' }}>
            <Typography type="title" color="inherit" className={classes.flex}>
              TaskChute WEB
            </Typography>
            <div>
              <IconButton
                aria-owns={open ? 'menu-appbar' : null}
                aria-haspopup="true"
                onClick={this.handleMenu}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onRequestClose={this.handleRequestClose}
              >
                <MenuItem>ユーザーID: {userId}</MenuItem>
                <MenuItem onClick={this.logOut}>ログアウト</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

GlobalHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
  logOut: PropTypes.func.isRequired,
};

export default withStyles(styles)(GlobalHeader);
