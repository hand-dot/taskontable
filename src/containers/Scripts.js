import * as firebase from 'firebase';
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Snackbar from 'material-ui/Snackbar';
import Grid from 'material-ui/Grid';
import Tooltip from 'material-ui/Tooltip';
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
import ScriptsEditor from '../components/ScriptsEditor';
import exampleTaskData from '../exampleDatas/exampleTaskData';
import exampleImportScript from '../exampleDatas/exampleImportScript';
import exampleExportScript from '../exampleDatas/exampleExportScript';
import tableTaskSchema from '../schemas/tableTaskSchema';
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
    padding: '4em 2em 2em',
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
      exampleTaskData: '',
      importScript: '',
      exportScript: '',
      importScriptBk: '',
      exportScriptBk: '',
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const noConfirm = true;
    this.resetScript('importScript', noConfirm);
    this.resetScript('exportScript', noConfirm);
    const self = this;
    this.exampleHot = new Handsontable(this.exampleHotDom, Object.assign({}, hotBaseConf, {
      isToday: true,
      renderAllRows: true,
      height: 300,
      colWidths: 'auto',
      minRows: 10,
      data: util.cloneDeep(exampleTaskData),
      afterRender() { self.syncStateByRender(); },
    }));
    setTimeout(() => this.exampleHot.render());
  }

  componentWillUnmount() {
    if (!this.exampleHot) return;
    this.exampleHot.destroy();
    this.exampleHot = null;
  }

  syncStateByRender() {
    if (!this.exampleHot) return;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.exampleHot);
    if (!util.equal(hotTasks, this.state.exampleTaskData)) {
      this.setState({ exampleTaskData: JSON.stringify(hotTasks, null, '\t') });
    }
  }

  backToApp() {
    if (this.state.importScript !== this.state.importScriptBk || this.state.exportScript !== this.state.exportScriptBk) {
      if (!window.confirm('保存していない内容がありますが、アプリに戻ってもよろしいですか？')) return;
    }
    this.props.history.push('/');
  }

  resetExampleHot() {
    if (!window.confirm('テーブルをリセットしてもよろしいですか？')) return;
    this.exampleHot.loadData(util.cloneDeep(exampleTaskData));
    setTimeout(() => { if (this.exampleHot) this.exampleHot.render(); });
  }

  resetScript(scriptType = 'exportScript', noConfirm) {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    if (!noConfirm && !window.confirm(`${scriptType}を保存前に戻してもよろしいですか？`)) return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).once('value').then((snapshot) => {
      const script = snapshot.exists() && snapshot.val() ? snapshot.val() : '';
      this.setState({ [scriptType]: script, [`${scriptType}Bk`]: script });
    });
  }

  saveScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    if (!window.confirm(`${scriptType}を保存してもよろしいですか？`)) return;
    firebase.database().ref(`/users/${this.props.user.uid}/scripts/${scriptType}`).set(this.state[scriptType]).then(() => {
      this.setState({ isOpenSaveSnackbar: true, [`${scriptType}Bk`]: this.state[scriptType] });
    });
  }

  fireScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    if (!window.confirm(`${scriptType}を実行してもよろしいですか？`)) return;
    const data = getHotTasksIgnoreEmptyTask(this.exampleHot);
    const script = this.state[scriptType];
    util.runWorker(script, data).then((result) => {
      setDataForHot(this.exampleHot, result);
      setTimeout(() => { this.exampleHot.render(); });
      this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText: `${scriptType}を実行しました。` });
    }, (reason) => {
      const scriptSnackbarText = reason ? `エラー[${scriptType}]：${reason}` : `${scriptType}を実行しましたがpostMessageの引数に問題があるため処理を中断しました。`;
      this.setState({ isOpenScriptSnackbar: true, scriptSnackbarText });
    });
  }

  loadExampleScript(scriptType = 'exportScript') {
    if (scriptType !== 'exportScript' && scriptType !== 'importScript') return;
    if (!window.confirm(`${scriptType}のサンプルをロードしてもよろしいですか？`)) return;
    this.setState({ [scriptType]: scriptType === 'exportScript' ? exampleExportScript.toString() : exampleImportScript.toString() });
  }

  closeSnackbars() {
    this.setState({ isOpenSaveSnackbar: false, isOpenScriptSnackbar: false });
  }

  handleScript(scriptType, script) {
    this.setState({ [scriptType]: script });
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
              <Tooltip title={'リセット'} placement="top">
                <div style={{ display: 'inline-block' }}>
                  <Button className={classes.button} onClick={this.resetExampleHot.bind(this)} variant="raised" color="default"><i className="fa fa-refresh" /></Button>
                </div>
              </Tooltip>
            </Typography>

            <Typography gutterBottom variant="caption">
              タスクのスキーマは　{JSON.stringify(tableTaskSchema)}　このようになっております。
            </Typography>
            <Typography gutterBottom variant="caption">
                タスクテーブルのデータは左のテーブルに対して右のJSON形式(配列)で保存されます。
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
        <Grid item xs={12}>
          <ScriptsEditor
            scriptType={'importScript'}
            script={this.state.importScript}
            scriptBk={this.state.importScriptBk}
            exampleScript={exampleImportScript.toString()}
            editorOptions={editorOptions}
            resetScript={this.resetScript.bind(this, 'importScript', false)}
            saveScript={this.saveScript.bind(this, 'importScript')}
            fireScript={this.fireScript.bind(this, 'importScript')}
            loadExampleScript={this.loadExampleScript.bind(this, 'importScript')}
            handleScript={this.handleScript.bind(this)}
          />
        </Grid>
        <Grid item xs={12}>
          <ScriptsEditor
            scriptType={'exportScript'}
            script={this.state.exportScript}
            scriptBk={this.state.exportScriptBk}
            exampleScript={exampleExportScript.toString()}
            editorOptions={editorOptions}
            resetScript={this.resetScript.bind(this, 'exportScript', false)}
            saveScript={this.saveScript.bind(this, 'exportScript')}
            fireScript={this.fireScript.bind(this, 'exportScript')}
            loadExampleScript={this.loadExampleScript.bind(this, 'exportScript')}
            handleScript={this.handleScript.bind(this)}
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

