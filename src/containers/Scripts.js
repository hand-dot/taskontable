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
import { hotBaseConf, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';
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
    fontSize: 11,
    minWidth: 25,
  },
  divider: {
    margin: '0 1rem',
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

  resetExampleHot() {
    this.exampleHot.loadData(util.cloneDeep(exampleTaskData));
  }

  resetScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).once('value').then((snapshot) => {
      const script = snapshot.exists() ? snapshot.val() : '';
      this.setState({ [scriptType]: script, [`${scriptType}Bk`]: script });
    });
  }

  saveScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).set(this.state[scriptType]).then(() => {
      this.setState({ isOpenSaveSnackbar: true, [`${scriptType}Bk`]: this.state[scriptType] });
    });
  }

  fireScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    const data = getHotTasksIgnoreEmptyTask(this.exampleHot);
    const script = this.state[scriptType];
    util.runWorker(script, data,
      (result) => {
        this.exampleHot.clear();
        setDataForHot(this.exampleHot, result);
        setTimeout(() => { this.exampleHot.render(); });
        this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText: `${scriptType}を実行しました。` });
      },
      (reason) => {
        const scriptSnackbarText = reason ? `エラー[${scriptType}]：${reason}` : `${scriptType}を実行しましたがpostMessageの引数に問題があるため処理を中断しました。`;
        this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText });
      },
    );
  }

  loadExampleScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    this.setState({ [scriptType]: scriptType === 'exportScript' ? exampleExportScript.toString() : exampleImportScript.toString() });
  }

  closeSnackbars() {
    this.setState({ isOpenSaveSnackbar: false, isOpenScriptSnackbar: false });
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
            本日のタスクテーブルのデータの取得時・保存時に実行されるWeb Workersをプログラミングできる開発者向けの機能となっております。
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Paper square elevation={0}>
            <Typography gutterBottom variant="subheading">
            タスクテーブルのデータの例
              <span className={classes.divider}>/</span>
              <Button className={classes.button} onClick={this.resetExampleHot.bind(this)} variant="raised" color="default"><i className="fa fa-refresh" /></Button>
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
                本日のタスクテーブルのデータの取得時に実行される処理を追加することができます。
            </Typography>
            <br />
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータにアクセスするにはimportScriptの引数のe.dataにアクセスしてください。
            </Typography>
            <br />
            <Typography gutterBottom variant="caption">
                外部サービスからのタスクのフェッチやタスクの文字列操作を終えたら、postMessage関数にタスクテーブルのデータを渡してください。
                postMessage関数に渡されたデータを使ってタスクテーブルを構成します。
            </Typography>
            <br />
            <Button size="small" disabled={this.state.importScript === this.state.importScriptBk} onClick={this.resetScript.bind(this, 'importScript')} variant="raised" color="default">保存前に戻す</Button>
            <Button size="small" onClick={this.saveScript.bind(this, 'importScript')} variant="raised" color="primary">保存</Button>
            <Button size="small" disabled={this.state.importScript === ''} onClick={this.fireScript.bind(this, 'importScript')} variant="raised" color="secondary">テスト実行</Button>
            <Button size="small" onClick={this.loadExampleScript.bind(this, 'importScript')} variant="raised" color="default">サンプルを読み込む</Button>
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
                本日のタスクテーブルのデータの保存時に実行される処理を追加することができます。
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータにアクセスするにはexportScriptの引数のe.dataにアクセスしてください。
            </Typography>
            <br />
            <Typography gutterBottom variant="caption">
                外部サービスへのタスクの連携やタスクの文字列操作を終えたら、postMessage関数にタスクテーブルのデータを渡してください。
                postMessage関数に渡されたデータを使ってタスクテーブルを構成します。
            </Typography>
            <br />
            <Button size="small" disabled={this.state.exportScript === this.state.exportScriptBk} onClick={this.resetScript.bind(this, 'exportScript')} variant="raised" color="default">保存前に戻す</Button>
            <Button size="small" onClick={this.saveScript.bind(this, 'exportScript')} variant="raised" color="primary">保存</Button>
            <Button size="small" disabled={this.state.exportScript === ''} onClick={this.fireScript.bind(this, 'exportScript')} variant="raised" color="secondary">テスト実行</Button>
            <Button size="small" onClick={this.loadExampleScript.bind(this, 'exportScript')} variant="raised" color="default">サンプルを読み込む</Button>
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
          <Button size="small" onClick={this.backToApp.bind(this)} variant="raised" color="default">アプリに戻る</Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSaveSnackbar}
          onClose={this.closeSnackbars.bind(this)}
          message={'保存しました。'}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          open={this.state.isOpenScriptSnackbar}
          onClose={this.closeSnackbars.bind(this)}
          message={this.state.scriptSnackbarText}
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

