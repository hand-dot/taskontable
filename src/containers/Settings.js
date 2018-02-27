import * as firebase from 'firebase';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Snackbar from 'material-ui/Snackbar';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/neat.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import { withRouter } from 'react-router-dom';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import constants from '../constants';

const editorOptions = {
  mode: 'javascript',
  theme: 'material',
};

const exampleImportScript =
`//this is import script
function importScript(e) {
  e.data.forEach(data => {
    data.title = data.title + '!';
  });
  postMessage(e.data);
}`;

const exampleExportScript =
`//this is export script
function exportScript(e) {
  e.data.forEach(data => {
    data.title = data.title + '!';
  });
  postMessage(e.data);
}`;

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
      isOpenSnackbar: false,
      importScript: '',
      exportScript: '',
    };
  }

  componentWillMount() {
    this.setScripts();
  }

  setScripts() {
    firebase.database().ref(`/${this.props.user.uid}/settings/importScript`).once('value').then((snapshot) => {
      if (snapshot.exists() && snapshot.val() !== '') {
        const importScript = snapshot.val();
        this.setState({ importScript });
      } else {
        this.setState({ importScript: exampleImportScript });
      }
    });
    firebase.database().ref(`/${this.props.user.uid}/settings/exportScript`).once('value').then((snapshot) => {
      if (snapshot.exists() && snapshot.val() !== '') {
        const exportScript = snapshot.val();
        this.setState({ exportScript });
      } else {
        this.setState({ exportScript: exampleExportScript });
      }
    });
  }

  backToApp() {
    this.props.history.push('/');
  }

  save() {
    Promise.all([
      firebase.database().ref(`/${this.props.user.uid}/settings/importScript`).set(this.state.importScript),
      firebase.database().ref(`/${this.props.user.uid}/settings/exportScript`).set(this.state.exportScript),
    ]).then(() => {
      this.setState({ isOpenSnackbar: true });
    });
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
            options={editorOptions}
            onBeforeChange={(editor, data, importScript) => {
              this.setState({ importScript });
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
            options={editorOptions}
            onBeforeChange={(editor, data, exportScript) => {
              this.setState({ exportScript });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={this.save.bind(this)} variant="raised" color="primary">保存</Button>
          <Button onClick={this.backToApp.bind(this)} variant="raised" color="default">アプリに戻る</Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => {
            this.setState({ isOpenSnackbar: false });
          }}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">保存しました。</span>}
        />
      </Grid>
    );
  }
}
Settings.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withRouter(withStyles(styles, { withTheme: true })(Settings));

