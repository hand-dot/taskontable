import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'material-ui/Tooltip';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';

const styles = {
  button: {
    fontSize: 11,
    minWidth: 25,
  },
  divider: {
    margin: '0 1rem',
  },
};

function ScriptsEditor(props) {
  const { scriptType, script, scriptBk, exampleScript, editorOptions, resetScript, saveScript, fireScript, loadExampleScript, handleScript, classes } = props;
  return (
    <Grid container>
      <Grid item xs={6}>
        <Paper square elevation={0}>
          <Typography gutterBottom variant="subheading">
            {(() => {
              if (scriptType === 'importScript') {
                return 'インポートスクリプト';
              }
              return 'エクスポートスクリプト';
            })()}
            <span className={classes.divider}>/</span>
            <Tooltip title={'保存前に戻す'} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.button} disabled={script === scriptBk} onClick={resetScript} variant="raised"><i className="fa fa-undo" /></Button>
              </div>
            </Tooltip>
            <span className={classes.divider}>/</span>
            <Tooltip title={'保存する'} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.button} disabled={script === scriptBk} onClick={saveScript} variant="raised"><i className="fa fa-floppy-o" /></Button>
              </div>
            </Tooltip>
            <span className={classes.divider}>/</span>
            <Tooltip title={'実行'} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.button} disabled={script === ''} onClick={fireScript} variant="raised"><i className="fa fa-bolt" /></Button>
              </div>
            </Tooltip>
            <span className={classes.divider}>/</span>
            <Tooltip title={'サンプルを読み込む'} placement="top">
              <div style={{ display: 'inline-block' }}>
                <Button className={classes.button} disabled={script === exampleScript.toString()} onClick={loadExampleScript} variant="raised"><i className="fa fa-cloud-download" /></Button>
              </div>
            </Tooltip>
          </Typography>
          <Typography gutterBottom variant="caption">
            {(() => {
              if (scriptType === 'importScript') {
                return '本日のタスクテーブルのデータの取得時に実行される処理を追加することができます。';
              }
              return '本日のタスクテーブルのデータの保存時に実行される処理を追加することができます。';
            })()}
          </Typography>
          <br />
          <Typography gutterBottom variant="caption">
            タスクテーブルのデータにアクセスするにはscriptの引数のe.dataにアクセスしてください。
          </Typography>
          <br />
          <Typography gutterBottom variant="caption">
            {(() => {
              if (scriptType === 'importScript') {
                return '外部サービスからのタスクのフェッチやタスクの文字列操作を終えたら、postMessage関数にタスクテーブルのデータを渡してください。postMessage関数に渡されたデータを使ってタスクテーブルを構成します。';
              }
              return '外部サービスへのタスクの連携やタスクの文字列操作を終えたら、postMessage関数にタスクテーブルのデータを渡してください。postMessage関数に渡されたデータを使ってタスクテーブルを構成します。';
            })()}
          </Typography>
          <br />
          <Typography gutterBottom variant="caption">
            <i className="fa fa-exclamation-circle" />サンプルのスクリプトを読み込んでみてください。<br />
            {(() => {
              if (scriptType === 'importScript') {
                return 'githubの特定のラベルが付いたissueをインポートしている例です。';
              }
              return '完了したタスクをgithubのissueでクローズしている例です。';
            })()}
            <Typography gutterBottom variant="caption">
            参考:<a href={'https://developer.github.com/v3/'} target="_blank">https://developer.github.com/v3/</a>
            </Typography>
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <CodeMirror
          value={script || '// not set scripts. please load sample scripts!'}
          options={editorOptions}
          onBeforeChange={(editor, data, newScript) => handleScript(scriptType, newScript)}
        />
      </Grid>
    </Grid>
  );
}

ScriptsEditor.propTypes = {
  scriptType: PropTypes.string.isRequired,
  script: PropTypes.string.isRequired,
  scriptBk: PropTypes.string.isRequired,
  exampleScript: PropTypes.string.isRequired,
  editorOptions: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    theme: PropTypes.string.isRequired,
    lineNumbers: PropTypes.bool.isRequired,
  }).isRequired,
  resetScript: PropTypes.func.isRequired,
  saveScript: PropTypes.func.isRequired,
  fireScript: PropTypes.func.isRequired,
  loadExampleScript: PropTypes.func.isRequired,
  handleScript: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(ScriptsEditor);

