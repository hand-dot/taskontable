import * as firebase from 'firebase';
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Snackbar from 'material-ui/Snackbar';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Paper from 'material-ui/Paper';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import { withRouter } from 'react-router-dom';
import constants from '../constants';
import '../styles/handsontable-custom.css';
import { hotBaseConf, getHotTasksIgnoreEmptyTask, getEmptyHotData } from '../hot';
import exampleTaskData from '../exampleDatas/exampleTaskData';
import exampleImportScript from '../exampleDatas/exampleImportScript';
import exampleExportScript from '../exampleDatas/exampleExportScript';
import util from '../util';

const editorOptions = {
  mode: 'javascript',
  theme: 'material',
  lineNumbers: true,
};

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

class Scripts extends Component {
  constructor(props) {
    super(props);
    this.exampleHot = null;
    this.syncStateByRender = debounce(this.syncStateByRender, constants.RENDER_DELAY);
    this.state = {
      isOpenSaveSnackbar: false,
      isOpenScriptSnackbar: false,
      scriptSnackbarLabel: '',
      scriptSnackbarText: '',
      exampleTaskData: JSON.stringify(exampleTaskData, null, '\t'),
      importScript: '',
      exportScript: '',
      importScriptBk: '',
      exportScriptBk: '',
    };
  }

  componentWillMount() {
    this.setScripts();
  }

  componentDidMount() {
    const self = this;
    this.exampleHot = new Handsontable(this.exampleHotDom, Object.assign({}, hotBaseConf, {
      isToday: true,
      colWidths: 'auto',
      minRows: 10,
      data: JSON.parse(self.state.exampleTaskData),
      afterRender() { self.syncStateByRender(); },
    }));
    this.exampleHot.render();
  }

  componentWillUnmount() {
    if (!this.exampleHot) return;
    this.exampleHot.destroy();
    this.exampleHot = null;
  }

  setScripts() {
    this.resetScript('importScript');
    this.resetScript('exportScript');
  }


  syncStateByRender() {
    if (!this.exampleHot) return;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.exampleHot);
    if (!util.equal(hotTasks, this.state.exampleTaskData)) {
      this.setState({ exampleTaskData: JSON.stringify(hotTasks, null, '\t') });
    }
  }

  backToApp() {
    this.props.history.push('/');
  }

  resetScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).once('value').then((snapshot) => {
      if (snapshot.exists()) {
        const script = snapshot.val();
        this.setState({
          [scriptType]: script,
          [`${scriptType}Bk`]: script,
        });
      } else {
        this.setState({
          [scriptType]: '',
          [`${scriptType}Bk`]: '',
        });
      }
    });
  }

  saveScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).set(this.state[scriptType]).then(() => {
      this.setState({ isOpenSaveSnackbar: true });
    });
  }

  fireScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    const script = this.state[scriptType];
    const data = getHotTasksIgnoreEmptyTask(this.hot);
    const worker = new Worker(window.URL.createObjectURL(new Blob([`onmessage = ${script}`], { type: 'text/javascript' })));
    worker.postMessage(data.length === 0 ? getEmptyHotData() : data);
    worker.onerror = (e) => {
      alert(e.message);
    };
    worker.onmessage = (e) => {
      this.setState({
        isOpenScriptSnackbar: true,
        scriptSnackbarLabel: scriptType,
        scriptSnackbarText: JSON.stringify(e.data, null, '\t'),
      });
    };
  }

  loadExampleScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    this.setState({ [scriptType]: scriptType === 'exportScript' ? exampleExportScript.toString() : exampleImportScript.toString() });
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Typography variant="title">
              スクリプト設定
          </Typography>
          <Typography gutterBottom variant="caption">
          タスクテーブルのデータの取得時・保存時に実行されるスクリプトをプログラミングできます。
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
            タスクテーブルのデータの例
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータは左のテーブルに対して右のJSON形式で保存されます。
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper square elevation={0}>
            <div ref={(node) => { this.exampleHotDom = node; }} />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <CodeMirror
            value={this.state.exampleTaskData}
            options={Object.assign({}, editorOptions, { readOnly: true })}
          />
        </Grid>
        <Grid item xs={6}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
                 インポートスクリプト
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータの取得時に実行される処理をここに追加することができます。
            </Typography>
            <Button disabled={this.state.importScript === this.state.importScriptBk} onClick={this.resetScript.bind(this, 'importScript')} variant="raised" color="default">保存前に戻す</Button>
            <Button onClick={this.saveScript.bind(this, 'importScript')} variant="raised" color="primary">保存</Button>
            <Button onClick={this.fireScript.bind(this, 'importScript')} variant="raised" color="secondary">テスト実行</Button>
            <Button onClick={this.loadExampleScript.bind(this, 'importScript')} variant="raised" color="default">サンプルを読み込む</Button>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <CodeMirror
            value={this.state.importScript}
            options={editorOptions}
            onBeforeChange={(editor, data, importScript) => {
              this.setState({ importScript });
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
                 エクスポートスクリプト
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータの保存時に実行される処理をここに追加することができます。
            </Typography>
            <Button disabled={this.state.exportScript === this.state.exportScriptBk} onClick={this.resetScript.bind(this, 'exportScript')} variant="raised" color="default">保存前に戻す</Button>
            <Button onClick={this.saveScript.bind(this, 'exportScript')} variant="raised" color="primary">保存</Button>
            <Button onClick={this.fireScript.bind(this, 'exportScript')} variant="raised" color="secondary">テスト実行</Button>
            <Button onClick={this.loadExampleScript.bind(this, 'exportScript')} variant="raised" color="default">サンプルを読み込む</Button>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <CodeMirror
            value={this.state.exportScript}
            options={editorOptions}
            onBeforeChange={(editor, data, exportScript) => {
              this.setState({ exportScript });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={this.backToApp.bind(this)} variant="raised" color="default">アプリに戻る</Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSaveSnackbar}
          onClose={() => {
            this.setState({ isOpenSaveSnackbar: false });
          }}
          message={'保存しました。'}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.isOpenScriptSnackbar}
          onClose={() => {
            this.setState({ isOpenScriptSnackbar: false });
          }}
          message={this.state.scriptSnackbarText}
          action={<Button color="secondary" size="small">{this.state.scriptSnackbarLabel}</Button>}
        />
      </Grid>
    );
  }
}
Scripts.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withRouter(withStyles(styles, { withTheme: true })(Scripts));

