import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import constants from '../constants';
import google from '../images/google.svg';

const styles = {
  content: {
    maxWidth: 600,
    height: constants.APPHEIGHT - 128,
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};

function Signup(props) {
  const { classes, login } = props;
  return (
    <Grid container spacing={0} alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper style={{ padding: '50px 20px 0px' }} square elevation={0}>
          <div className={classes.content}>
            <Typography type="title">
              アカウントを新規作成
            </Typography>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              OR<Link to="/login">アカウントにサインイン</Link>
            </div>
            <Typography type="caption" gutterBottom>
              *現在グーグルログインしかご利用いただけません。
            </Typography>
            <Typography type="caption" gutterBottom>
              *現在Beta版のためデータがクリアさせる可能性があります。
            </Typography>
            <form style={{ marginTop: '2em' }}>
              <TextField
                id="username"
                label="ユーザー名"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
                placeholder="たとえば田中太郎"
                fullWidth
                margin="normal"
              />
              <TextField
                id="email"
                label="メールアドレス"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
                placeholder="たとえばuser@example.com"
                fullWidth
                margin="normal"
              />
              <TextField
                id="password"
                type="password"
                label="パスワード"
                InputLabelProps={{
                  shrink: true,
                }}
                disabled
                placeholder="8文字以上入力してください"
                fullWidth
                margin="normal"
              />
              <Button raised disabled className={classes.button}>アカウントを作成</Button>
            </form>
            <Typography gutterBottom>
              OR
            </Typography>
            <Button onClick={login} raised color="primary" className={classes.button}><img src={google} alt="google" height="20" />　グーグルアカウントでログインする</Button>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

Signup.propTypes = {
  login: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Signup);

