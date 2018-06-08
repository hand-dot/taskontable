import React, { Component } from 'react';
import moment from 'moment';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import constants from '../constants';
import '../styles/handsontable-custom.css';
import { getHotConf, getHotTasksIgnoreEmptyTask } from '../hot';
import util from '../util';
import DatePicker from '../components/DatePicker';


// TODO ！期間をスタート、エンドで絞り込めるようにする
// ①画面の遷移時、デフォルトで直近の1週間のデータを取得する。
// ②期間はあとから変更可能
// ③その期間は同じ年で同じ月でないといけない(大量のデータを処理させ、システムに無駄に不可をかけないように)

const database = util.getDatabase();

const hotConf = getHotConf();

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

class Activity extends Component {
  constructor(props) {
    super(props);
    this.hot = null;
    this.syncStateByRender = debounce(this.syncStateByRender, constants.RENDER_DELAY);
    this.state = {
      worksheetId: '',
      isOpenSnackbar: false,
      snackbarText: '',
      startDate: moment().day(0).format(`${constants.DATEFMT}`),
      endDate: moment().day(6).format(`${constants.DATEFMT}`),
      taskData: '',
    };
  }

  componentWillMount() {
    // 認証していないユーザーとメンバー以外をルートに返す
    const worksheetId = encodeURI(this.props.match.params.id);
    if (this.props.userId && worksheetId) {
      database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members/`).once('value').then((memberIds) => {
        if (memberIds.exists() && Array.isArray(memberIds.val()) && memberIds.val().includes(this.props.userId)) {
          this.setState({ worksheetId });
          // メンバーを取得する処理
          Promise.all(memberIds.val().map(uid => database.ref(`/${constants.API_VERSION}/users/${uid}/settings/`).once('value'))).then((members) => {
            const memberDatas = members.filter(member => member.exists()).map(member => member.val());
            setTimeout(() => {
              if (this.hot) {
                hotConf.columns[hotConf.columns.findIndex(column => column.data === 'assign')].selectOptions = memberDatas.reduce((obj, member) => Object.assign(obj, { [member.uid]: member.displayName }), {});
                const startTime = hotConf.columns[hotConf.columns.findIndex(column => column.data === 'startTime')];
                startTime.timeFormat = `${constants.DATEFMT}-${constants.TIMEFMT}`;
                startTime.title = `開始時刻(${constants.DATEFMT}-${constants.TIMEFMT})`;
                const endTime = hotConf.columns[hotConf.columns.findIndex(column => column.data === 'endTime')];
                endTime.timeFormat = `${constants.DATEFMT}-${constants.TIMEFMT}`;
                endTime.title = `終了時刻(${constants.DATEFMT}-${constants.TIMEFMT})`;
                // ①ここでデータを取得して設定する

                this.hot.updateSettings(Object.assign(this.hot.getSettings, {
                  userId: this.props.userId,
                  members: memberDatas,
                }));
              } else {
                this.props.history.push('/');
              }
            });
          });
        } else {
          this.props.history.push('/');
        }
      });
    } else {
      this.props.history.push('/');
    }
  }

  componentDidMount() {
    if (!this.props.userId) return;
    const self = this;
    this.hot = new Handsontable(this.hotDom, Object.assign({}, hotConf, {
      userId: this.props.userId,
      isActiveNotifi: false,
      renderAllRows: true,
      height: 300,
      colWidths: 'auto',
      minRows: 10,
      afterRender() { self.syncStateByRender(); },
    }));
    setTimeout(() => { if (this.hot) this.hot.render(); });
  }

  componentWillUnmount() {
    if (!this.hot) return;
    this.hot.destroy();
    this.hot = null;
  }

  changeDate(type, newDate) {
    // ③ここでバリデーションなど、の処理を書く
    this.setState({ [type]: newDate });
  }

  syncStateByRender() {
    if (!this.hot) return;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.hot);
    if (!util.equal(hotTasks, this.state.taskData)) {
      this.setState({ taskData: JSON.stringify(hotTasks, null, '\t') });
    }
  }

  backToWorkSheet() {
    this.props.history.push(`/${this.state.worksheetId}`);
  }

  render() {
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12}>
          <Typography variant="title">
            アクティビティ(α版)
          </Typography>
          <Typography gutterBottom variant="caption">
            過去に行った内容を期間指定し確認することができます。
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Paper square elevation={0}>
            <DatePicker value={this.state.startDate} changeDate={(e) => { this.changeDate('startDate', e.target.value); }} label="開始日" />
            <span style={{ margin: `0 ${theme.spacing.unit}px` }}>→</span>
            <DatePicker value={this.state.endDate} changeDate={(e) => { this.changeDate('endDate', e.target.value); }} label="終了日" />
            <div style={{ marginTop: theme.spacing.unit * 2 }} ref={(node) => { this.hotDom = node; }} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <CodeMirror
            value={this.state.taskData}
            options={Object.assign({}, editorOptions, { readOnly: true })}
          />
        </Grid>
        <Grid item xs={12}>
          <Button size="small" onClick={this.backToWorkSheet.bind(this)} variant="raised">ワークシートに戻る</Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={this.state.isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false }); }}
          message={this.state.snackbarText}
        />
      </Grid>
    );
  }
}
Activity.propTypes = {
  userId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  classes: PropTypes.object.isRequired, // eslint-disable-line
  match: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(Activity);

