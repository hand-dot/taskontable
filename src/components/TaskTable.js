import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { withStyles } from 'material-ui/styles';
import moment from 'moment';
import debounce from 'lodash.debounce';

import { hotConf, getEmptyHotData, contextMenuCallback, contextMenuItems, getEmptyRow, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';
import constants from '../constants';
import util from '../util';


const styles = {
};

class TaskTable extends Component {
  constructor(props) {
    super(props);
    this.hot = null;
    this.oldTimeDiffMinute = '';
    this.bindOpenTaskIntervalID = '';
    this.state = {
    };
    this.syncPropByUpdate = debounce(this.syncPropByUpdate, constants.RENDER_DELAY);
    this.syncPropByRender = debounce(this.syncPropByRender, constants.RENDER_DELAY);
  }
  componentWillMount() {
    this.oldTimeDiffMinute = '';
    this.bindOpenTaskIntervalID = '';
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
  }
  componentDidMount() {
    this.props.onRef(this);
    const self = this;
    this.hot = new Handsontable(this.hotDom, Object.assign(hotConf, {
      contextMenu: {
        callback(key, selection) {
          if (key === 'reverse_taskpool_hight' || key === 'reverse_taskpool_low') {
            const taskPoolType = key === 'reverse_taskpool_hight' ? constants.taskPoolType.HIGHPRIORITY : constants.taskPoolType.LOWPRIORITY;
            for (let row = selection.start.row; row <= selection.end.row; row += 1) {
              // テーブルタスクからタスクプールに移すタイミングでテーブルが1行減るので常に選択開始行を処理する
              self.moveTableTaskToPoolTask(taskPoolType, selection.start.row, this);
            }
          } else {
            contextMenuCallback(key, selection, this);
          }
        },
        items: contextMenuItems,
      },
      afterRender() { self.syncPropByRender(); },
      afterUpdateSettings() { self.syncPropByUpdate(); },
    }));
  }
  componentWillReceiveProps() {
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    if (!this.hot) return;
    this.hot.destroy();
    this.hot = null;
  }

  setData(datas) {
    setDataForHot(this.hot, datas);
  }

  getTasksIgnoreEmptyTaskAndProp() {
    return getHotTasksIgnoreEmptyTask(this.hot);
  }

  moveTableTaskToPoolTask(taskPoolType, index, hotInstance) {
    const task = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
    if (!task.title) {
      alert('作業内容が未記入のタスクはタスクプールに戻せません。');
      return;
    }
    hotInstance.alter('remove_row', index);
    this.props.moveTableTaskToPoolTask(taskPoolType, task);
  }

  syncPropByRender() {
    if (!this.hot) return;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.hot);
    this.bindOpenTasksProcessing(hotTasks);
    if (!util.equal(hotTasks, this.props.tableTasks)) {
      this.props.handleSaveable(true);
      this.props.handleTableTasks(hotTasks);
    } else if (util.equal(hotTasks, this.props.tableTasks)) {
      this.props.handleSaveable(false);
    }
  }

  syncPropByUpdate() {
    this.props.handleSaveable(false);
    this.props.handleTableTasks(getHotTasksIgnoreEmptyTask(this.hot));
  }

  addTask() {
    if (this.hot) this.hot.alter('insert_row');
  }

  clear() {
    if (this.hot) this.hot.updateSettings({ data: getEmptyHotData() });
  }

  // 開始しているタスクを見つけ、経過時間をタイトルに反映する
  bindOpenTasksProcessing = (tasks) => {
    const openTask = tasks.find(hotTask => hotTask.length !== 0 && hotTask.startTime && hotTask.endTime === '');
    document.title = constants.TITLE;
    if (this.bindOpenTaskIntervalID) clearInterval(this.bindOpenTaskIntervalID);
    if (openTask) {
      this.bindOpenTaskIntervalID = setInterval(() => {
        const newTimeDiffMinute = util.getTimeDiffMinute(openTask.startTime, moment().format('HH:mm'));
        // 1分に一度タイトルが書き変わったタイミングでhotを再描画する。
        if (newTimeDiffMinute !== this.oldTimeDiffMinute && this.hot) this.hot.render();
        if (newTimeDiffMinute === -1) {
          // 開始まで秒単位でカウントダウンする場合
          document.title = `${moment().format('ss') - 60}秒 - ${openTask.title || '無名タスク'}`;
        } else if (newTimeDiffMinute === 0) {
          document.title = `${moment().format('ss')}秒 - ${openTask.title || '無名タスク'}`;
        } else {
          document.title = `${newTimeDiffMinute}分 - ${openTask.title || '無名タスク'}`;
        }
        this.oldTimeDiffMinute = newTimeDiffMinute;
      }, 1000);
    }
  }

  render() {
    return (<div ref={(node) => { this.hotDom = node; }} />);
  }
}

TaskTable.propTypes = {
  tableTasks: PropTypes.array.isRequired,
  handleTableTasks: PropTypes.func.isRequired,
  handleSaveable: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  moveTableTaskToPoolTask: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TaskTable);

