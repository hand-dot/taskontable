import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import google from '../images/google.svg';
import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Footer from '../components/Footer';

const styles = {
  root: {
    minHeight: '100vh',
  },
  content: {
    padding: '6em 2em',
    maxWidth: 660,
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
    };
  }

  componentWillMount() {
    // 招待されたメールからメールアドレスを設定する処理。
    const { location } = this.props;
    if (location.search) {
      this.setState({ email: util.getQueryVariable('email') });
    }
  }

  signup(type) {
    const obj = {
      username: '',
      email: '',
      password: '',
    };
    if (type === constants.authType.EMAIL_AND_PASSWORD) {
      const { username, email, password } = this.state;
      obj.type = type;
      obj.username = username;
      obj.email = email;
      obj.password = password;
    }
    const { signup } = this.props;
    signup(obj);
  }

  login(type) {
    const { login } = this.props;
    login({ type });
  }

  render() {
    const { username, email, password } = this.state;
    const { location, classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
        <ScrollToTopOnMount />
        <Grid item xs={12}>
          <div className={classes.content}>
            <Typography variant="headline" gutterBottom>
              {i18n.t('signUpAndLogIn.createAnAccount')}
            </Typography>
            <div style={{ fontSize: 12 }}>
              {i18n.t('common.or')}&nbsp;
              <Link to={location.search === '' ? '/login' : `/login${location.search}`}>
                {i18n.t('signUpAndLogIn.logIn_title', { title: constants.TITLE })}
              </Link>
            </div>
            <form style={{ marginTop: '2em' }}>
              <TextField
                value={username}
                onChange={(e) => { this.setState({ username: e.target.value }); }}
                autoFocus={location.search !== ''}
                autoComplete="username"
                id="username"
                label={i18n.t('common.userName')}
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder={`${i18n.t('common.forExample')} taro tanaka`}
                fullWidth
                margin="normal"
              />
              <TextField
                value={email}
                onChange={(e) => { this.setState({ email: e.target.value }); }}
                disabled={location.search !== ''}
                autoComplete="email"
                id="email"
                label={i18n.t('common.emailAddress')}
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder={`${i18n.t('common.forExample')} user@example.com`}
                fullWidth
                margin="normal"
              />
              <TextField
                value={password}
                onChange={(e) => { this.setState({ password: e.target.value }); }}
                autoComplete="password"
                id="password"
                type="password"
                label={i18n.t('common.password')}
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder={i18n.t('validation.minLength_num', { num: 6 })}
                fullWidth
                margin="normal"
              />
              <Button onClick={this.signup.bind(this, constants.authType.EMAIL_AND_PASSWORD)} variant="raised" className={classes.button}>
                {i18n.t('signUpAndLogIn.createAnAccount')}
              </Button>
            </form>
            <Typography gutterBottom>
              {i18n.t('common.or')}
            </Typography>
            <Button
              onClick={this.login.bind(this, constants.authType.GOOGLE)}
              variant="raised"
              color="primary"
              className={classes.button}
              disabled={location.search !== ''}
            >
              <img src={google} alt="google" height="20" />
              {' '}
              {i18n.t('common.signUpWithG')}
            </Button>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              <Link to="/privacy-and-terms">
                {i18n.t('signUpAndLogIn.privacyAndTerms')}
              </Link>
            </div>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              <Link to="/">
                {i18n.t('common.backToTop')}
              </Link>
            </div>
          </div>
        </Grid>
        <Footer />
      </Grid>
    );
  }
}

Signup.propTypes = {
  login: PropTypes.func.isRequired,
  signup: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  location: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(Signup);
