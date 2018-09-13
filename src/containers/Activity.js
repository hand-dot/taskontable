import React, { Component } from 'react';
import moment from 'moment';
import debounce from 'lodash.debounce';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import constants from '../constants';
import '../styles/handsontable-custom.css';
import { hotConf, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';
import util from '../utils/util';
import i18n from '../i18n';
import DatePicker from '../components/DatePicker';
import UnderDevelopment from '../components/UnderDevelopment';
import ActivityChart from '../components/ActivityChart';

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

  async componentWillMount() {
    const { userId, history, match } = this.props;
    // 認証していないユーザーとメンバー以外をルートに返す
    const worksheetId = encodeURI(match.params.id);
    if (!userId || !worksheetId) {
      history.push('/');
      return;
    }
    const memberIds = await database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/members/`).once('value');
    if (memberIds.exists() && Array.isArray(memberIds.val()) && memberIds.val().includes(userId)) {
      this.setState({ worksheetId });
      // メンバーを取得する処理
      const members = await Promise.all(memberIds.val().map(uid => database.ref(`/${constants.API_VERSION}/users/${uid}/settings/`).once('value')));
      const memberDatas = members.filter(member => member.exists()).map(member => member.val());
      if (this.hot) {
        this.hot.updateSettings({ members: memberDatas });
        // データの取得処理
        this.setActivityData();
      } else {
        history.push('/');
      }
    } else {
      history.push('/');
    }
  }

  componentDidMount() {
    const { userId } = this.props;
    if (!userId) return;
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
      userId,
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
    const { worksheetId, startDate, endDate } = this.state;
    const diff = moment(endDate).diff(moment(startDate), 'days');
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
    promises.push(database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/tableTasks/${moment(startDate).format(constants.DATEFMT)}`).once('value'));
    promises.push(...Array(diff).fill('dummy').map(() => database.ref(`/${constants.API_VERSION}/worksheets/${worksheetId}/tableTasks/${moment(startDate).add(1, 'days').format(constants.DATEFMT)}`).once('value')));
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
      setDataForHot(this.hot, data);
    });
  }

  changeDate(type, newDate) {
    this.setState({ [type]: newDate });
    setTimeout(() => this.setActivityData());
  }

  syncStateByRender() {
    const { taskData } = this.state;
    if (!this.hot) return;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.hot);
    if (!util.equal(hotTasks, taskData)) {
      this.setState({ taskData: JSON.stringify(hotTasks, null, '\t') });
    }
  }

  backToWorkSheet() {
    const { history } = this.props;
    const { worksheetId } = this.state;
    history.push(`/${worksheetId}`);
  }

  render() {
    const {
      startDate,
      endDate,
      taskData,
      isOpenSnackbar,
      snackbarText,
    } = this.state;
    const { classes, theme } = this.props;
    return (
      <Grid className={classes.root} container spacing={theme.spacing.unit} alignItems="stretch" justify="center">
        <Grid item xs={12} style={{ paddingBottom: '3em' }}>
          <Typography variant="title">
            {i18n.t('worksheet.activity')}
          </Typography>
          <Typography gutterBottom variant="caption">
            {i18n.t('activity.description')}
          </Typography>
          <UnderDevelopment />
        </Grid>
        <Grid item xs={12}>
          <Typography gutterBottom variant="caption">
            本日(
            {moment().format(constants.DATEFMT)}
            )
          </Typography>
          <DatePicker value={startDate} changeDate={(e) => { this.changeDate('startDate', e.target.value); }} label="開始" />
          <span style={{ margin: `0 ${theme.spacing.unit * 2}px` }}>
            <ArrowForward />
          </span>
          <DatePicker value={endDate} changeDate={(e) => { this.changeDate('endDate', e.target.value); }} label="終了" />
        </Grid>
        <Grid item xs={12}>
          {taskData !== '' && (
            <div>
              <Typography gutterBottom variant="caption">
                見積:
                <span className={classes.block} style={{ color: constants.brandColor.base.GREEN }}>
                ■
                </span>
                (緑色) /
                実績:
                <span className={classes.block} style={{ color: constants.brandColor.base.BLUE }}>
                ■
                </span>
                (青色) /
                残:
                <span className={classes.block} style={{ color: constants.brandColor.base.RED }}>
                ■
                </span>
                (赤色)
              </Typography>
              <ActivityChart tableTasks={JSON.parse(taskData)} />
            </div>
          )}
        </Grid>
        <Grid item xs={8}>
          <div ref={(node) => { this.hotDom = node; }} />
        </Grid>
        <Grid item xs={4}>
          <CodeMirror
            value={taskData}
            options={Object.assign({}, editorOptions, { readOnly: true })}
          />
        </Grid>
        <Grid item xs={12} style={{ marginTop: theme.spacing.unit * 2 }}>
          <Divider style={{ margin: '1.5em 0' }} />
          <Button size="small" onClick={this.backToWorkSheet.bind(this)} variant="raised">
            {i18n.t('common.backToPreviousPage')}
          </Button>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={isOpenSnackbar}
          onClose={() => { this.setState({ isOpenSnackbar: false }); }}
          message={snackbarText}
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
