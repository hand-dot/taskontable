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
import util from '../util';
import i18n from '../i18n';

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
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  componentWillMount() {
    // 招待されたメールからメールアドレスを設定する処理。
    if (this.props.location.search) {
      this.setState({ email: util.getQueryVariable('email') });
    }
  }

  login(type) {
    const obj = {
      email: '',
      password: '',
    };
    if (type === constants.authType.GOOGLE) {
      obj.type = type;
    } else if (type === constants.authType.EMAIL_AND_PASSWORD) {
      obj.type = type;
      obj.email = this.state.email;
      obj.password = this.state.password;
    }
    this.props.login(obj);
  }

  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={classes.content}>
              <Typography variant="headline" gutterBottom>
                {i18n.t('signUpAndLogIn.logIn_title', { title: constants.TITLE })}
              </Typography>
              <div style={{ fontSize: 12 }}>
                {i18n.t('common.or')}&nbsp;
                <Link to={this.props.location.search === '' ? '/signup' : `/signup${this.props.location.search}`}>
                  {i18n.t('signUpAndLogIn.createAnAccount')}
                </Link>
              </div>
              <form style={{ marginTop: '2em' }}>
                <TextField
                  value={this.state.email}
                  onChange={(e) => { this.setState({ email: e.target.value }); }}
                  disabled={this.props.location.search !== ''}
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
                  value={this.state.password}
                  onChange={(e) => { this.setState({ password: e.target.value }); }}
                  autoFocus={this.props.location.search !== ''}
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
                <Button onClick={this.login.bind(this, constants.authType.EMAIL_AND_PASSWORD)} variant="raised" className={classes.button}>
                  {i18n.t('common.logIn')}
                                </Button>
              </form>
              <Typography gutterBottom>
                {i18n.t('common.or')}
              </Typography>
              <Button onClick={this.login.bind(this, constants.authType.GOOGLE)} variant="raised" color="primary" className={classes.button}>
                <img src={google} alt="google" height="20" />
                {' '}
                {i18n.t('common.logInWithG')}
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
          </div>
        </Grid>
      </Grid>
    );
  }
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  location: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(Login);
