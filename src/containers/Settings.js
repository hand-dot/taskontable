import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import { Switch, Route, withRouter } from 'react-router-dom';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import constants from '../constants';


const styles = {
  root: {
    paddingTop: '5em',
    minHeight: '100vh',
    padding: '4em 2em 0',
    width: constants.APPWIDTH,
    margin: '0 auto',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 15,
    marginBottom: 15,
    width: '100%',
  },
};

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      importScript:
`//this is import script
function importScript(e) {
  e.data.forEach(data => {
    data.title = data.title + '!';
  });
  postMessage(e);
}`,
      exportScript:
`//this is export script
function exportScript(e) {
  e.data.forEach(data => {
    data.title = data.title + '!';
  });
  postMessage(e);
}`,
    };
  }
  backToApp() {
    this.props.history.push('/');
  }
  render() {
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Typography variant="title">
              アカウント設定
          </Typography>
          <Typography gutterBottom variant="caption">
                テーマカラーの設定・プラグインの設定を行うことができます。
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
                 インポートスクリプト
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータの取得時に実行される処理をここに追加することができます。
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <CodeMirror
            value={this.state.importScript}
            options={{
              mode: 'javascript',
              theme: 'material',
            }}
            onBeforeChange={(editor, data, importScript) => {
              this.setState({ importScript });
            }}
            onChange={(editor, importScript) => {
              console.log('controlled exportScript', { importScript });
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
                 エクスポートスクリプト
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータの保存時に実行される処理をここに追加することができます。
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          <CodeMirror
            value={this.state.exportScript}
            options={{
              mode: 'javascript',
              theme: 'material',
            }}
            onBeforeChange={(editor, data, exportScript) => {
              this.setState({ exportScript });
            }}
            onChange={(editor, exportScript) => {
              console.log('controlled exportScript', { exportScript });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={this.backToApp.bind(this)} variant="raised" color="primary">アプリに戻る</Button>
        </Grid>
      </Grid>
    );
  }
}
Settings.propTypes = {
  history: PropTypes.object.isRequired, // eslint-disable-line
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withRouter(withStyles(styles, { withTheme: true })(Settings));

