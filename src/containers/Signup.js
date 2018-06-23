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
    if (this.props.location.search) {
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
      obj.type = type;
      obj.username = this.state.username;
      obj.email = this.state.email;
      obj.password = this.state.password;
    }
    this.props.signup(obj);
  }
  login(type) {
    this.props.login({ type });
  }
  render() {
    const { classes } = this.props;
    return (
      <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <div style={{ minHeight: '100vh' }}>
            <div className={classes.content}>
              <Typography variant="headline" gutterBottom>
              アカウントを新規作成
              </Typography>
              <div style={{ fontSize: 12, marginBottom: 20 }}>
              OR<Link to={this.props.location.search === '' ? '/login' : `/login${this.props.location.search}`}>アカウントにサインイン</Link>
              </div>
              <Typography variant="caption" gutterBottom>
            *現在β版のため一部の機能を除いてアプリをお試しできます。(データがクリアさせる可能性があります。)
              </Typography>
              <Typography variant="caption" gutterBottom>
              *現在ログインしていただくと2018年7~8月の正式リリース時にお知らせメールを送信させていただきます。
              </Typography>
              <form style={{ marginTop: '2em' }}>
                <TextField
                  value={this.state.username}
                  onChange={(e) => { this.setState({ username: e.target.value }); }}
                  autoFocus={this.props.location.search !== ''}
                  autoComplete="username"
                  id="username"
                  label="ユーザー名"
                  InputLabelProps={{
                  shrink: true,
                }}
                  placeholder="たとえば田中太郎"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  value={this.state.email}
                  onChange={(e) => { this.setState({ email: e.target.value }); }}
                  disabled={this.props.location.search !== ''}
                  autoComplete="email"
                  id="email"
                  label="メールアドレス"
                  InputLabelProps={{
                  shrink: true,
                }}
                  placeholder="たとえばuser@example.com"
                  fullWidth
                  margin="normal"
                />
                <TextField
                  value={this.state.password}
                  onChange={(e) => { this.setState({ password: e.target.value }); }}
                  autoComplete="password"
                  id="password"
                  type="password"
                  label="パスワード"
                  InputLabelProps={{
                  shrink: true,
                }}
                  placeholder="6文字以上入力してください"
                  fullWidth
                  margin="normal"
                />
                <Button onClick={this.signup.bind(this, constants.authType.EMAIL_AND_PASSWORD)} variant="raised" className={classes.button}>アカウントを作成</Button>
              </form>
              <Typography gutterBottom>
              OR
              </Typography>
              <Button
                onClick={this.login.bind(this, constants.authType.GOOGLE)}
                variant="raised"
                color="primary"
                className={classes.button}
                disabled={this.props.location.search !== ''}
              >
                <img src={google} alt="google" height="20" />　グーグルアカウントでログインする
              </Button>
              <div style={{ fontSize: 12, marginBottom: 10 }}>
                <Link to="/">Topに戻る</Link>
              </div>
            </div>
          </div>
        </Grid>
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

