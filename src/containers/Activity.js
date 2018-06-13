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
import ArrowForward from '@material-ui/icons/ArrowForward';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import constants from '../constants';
import '../styles/handsontable-custom.css';
import { hotConf, getHotTasksIgnoreEmptyTask } from '../hot';
import util from '../util';
import DatePicker from '../components/DatePicker';
import ActivityChart from '../components/ActivityChart';

// TODO ！期間をスタート、エンドで絞り込めるようにする
// ①画面の遷移時、デフォルトで直近の1週間のデータを取得する。
// ②期間はあとから変更可能
// ③その期間は同じ年で同じ月でないといけない(大量のデータを処理させ、システムに無駄に不可をかけないように)

const database = util.getDatabase();

const editorOptions = {
  height: '600px',
  mode: 'javascript',
  theme: 'material',
  lineNumbers: true,
};

const styles = {
  root: {
    paddingTop: '5em',
    minHeight: '100vh',
    padding: '4em 2em 2em',
    width: '100%',
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
    this.setActivityData = debounce(this.setActivityData, constants.REQEST_DELAY_SLOW);
    this.syncStateByRender = debounce(this.syncStateByRender, constants.RENDER_DELAY);
    this.state = {
      worksheetId: '',
      isOpenSnackbar: false,
      snackbarText: '',
      startDate: moment().add(-7, 'days').format(`${constants.DATEFMT}`),
      endDate: moment().format(`${constants.DATEFMT}`),
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
            if (this.hot) {
              this.hot.updateSettings({ members: memberDatas });
              // データの取得処理
              this.setActivityData();
            } else {
              this.props.history.push('/');
            }
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
    // この画面だけで使う日付のカラムを追加
    hotConf.columns.unshift({
      title: `日付(${constants.DATEFMT})`,
      data: 'date',
      type: 'date',
      dateFormat: constants.DATEFMT,
      colWidths: 70,
    });
    this.hot = new Handsontable(this.hotDom, Object.assign({}, hotConf, {
      userId: this.props.userId,
      isActiveNotifi: false,
      renderAllRows: true,
      height: 300,
      colWidths: Math.round(window.innerWidth / hotConf.columns.length),
      minRows: 10,
      data: [],
      afterRender() { self.syncStateByRender(); },
    }));
  }

  componentWillUnmount() {
    if (!this.hot) return;
    this.hot.destroy();
    this.hot = null;
    // この画面だけで使う日付のカラムを削除
    hotConf.columns = hotConf.columns.filter(column => column.data !== 'date');
  }

  setActivityData() {
    const startDate = moment(this.state.startDate);
    const endDate = moment(this.state.endDate);
    const diff = endDate.diff(startDate, 'days');
    if (!util.isNaturalNumber(diff)) {
      this.hot.updateSettings({ data: [] });
      return;
    }
    if (diff >= 100) {
      alert('一度に取得できるデータは100日までです。');
      this.hot.updateSettings({ data: [] });
      return;
    }
    const promises = [];
    promises.push(database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${startDate.format(constants.DATEFMT)}`).once('value'));
    promises.push(...Array(diff).fill('dummy').map(() => database.ref(`/${constants.API_VERSION}/worksheets/${this.state.worksheetId}/tableTasks/${startDate.add(1, 'days').format(constants.DATEFMT)}`).once('value')));
    Promise.all(promises).then((datas) => {
      const datasVals = datas.map(data => (data.exists() ? data.val() : [{
        id: '', assign: '', title: 'no task', estimate: '', startTime: '', endTime: '', memo: '',
      }]));
      const datasKeys = datas.map(data => data.key);
      return datasKeys.reduce((accum, key, index) => accum.concat(datasVals[index].map((task) => {
        task.date = key; // eslint-disable-line no-param-reassign
        return task;
      })), []);
    }).then((data) => {
      // テーブルを更新
      this.hot.updateSettings({ data });
    });
  }

  changeDate(type, newDate) {
    // ③ここでバリデーションなど、の処理を書く
    this.setState({ [type]: newDate });
    setTimeout(() => this.setActivityData());
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
        <Grid item xs={12}>
          <Typography gutterBottom variant="caption">
            本日({moment().format(constants.DATEFMT)})
          </Typography>
          <DatePicker value={this.state.startDate} changeDate={(e) => { this.changeDate('startDate', e.target.value); }} label="開始" />
          <span style={{ margin: `0 ${theme.spacing.unit * 2}px` }}><ArrowForward /></span>
          <DatePicker value={this.state.endDate} changeDate={(e) => { this.changeDate('endDate', e.target.value); }} label="終了" />
        </Grid>
        <Grid item xs={12}>
          {this.state.taskData !== '' && (<ActivityChart tableTasks={JSON.parse(this.state.taskData)} />)}
        </Grid>
        <Grid item xs={8}>
          <Paper square elevation={0}>
            <div ref={(node) => { this.hotDom = node; }} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <CodeMirror
            value={this.state.taskData}
            options={Object.assign({}, editorOptions, { readOnly: true })}
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: theme.spacing.unit * 2 }}>
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

