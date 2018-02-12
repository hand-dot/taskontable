import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import google from '../images/google.svg';

const styles = {
  root: {
    paddingTop: '3em',
    height: '100%',
  },
  content: {
    padding: '3em 2em',
    maxWidth: 600,
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};

function Login(props) {
  const { classes, login } = props;
  return (
    <Grid className={classes.root} container spacing={0} alignItems="stretch" justify="center">
      <Grid item xs={12}>
        <Paper style={{ minHeight: '100%' }} square elevation={0}>
          <div className={classes.content}>
            <Typography type="title">
              Taskontableにログイン
            </Typography>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
              OR<Link to="/signup">アカウント作成</Link>
            </div>
            <Typography type="caption" gutterBottom>
              *現在グーグルログインしかご利用いただけません。
            </Typography>
            <Typography type="caption" gutterBottom>
              *現在Beta版のためデータがクリアさせる可能性があります。
            </Typography>
            <form style={{ marginTop: '2em' }}>
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
              <Button variant="raised" disabled className={classes.button}>ログイン</Button>
            </form>
            <Typography gutterBottom>
              OR
            </Typography>
            <Button onClick={login} variant="raised" color="primary" className={classes.button}><img src={google} alt="google" height="20" />　グーグルアカウントでログインする</Button>
          </div>
        </Paper>
      </Grid>
    </Grid>
  );
}

Login.propTypes = {
  login: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Login);

