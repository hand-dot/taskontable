import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import { withStyles } from 'material-ui/styles';
import debounce from 'lodash.debounce';

import { hotConf, contextMenuCallback, contextMenuItems, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';
import constants from '../constants';
import util from '../util';

import '../styles/handsontable-custom.css';

const styles = {
};

class TaskTable extends Component {
  constructor(props) {
    super(props);
    this.hot = null;
    this.syncPropByUpdate = debounce(this.syncPropByUpdate, constants.RENDER_DELAY);
    this.syncPropByRender = debounce(this.syncPropByRender, constants.RENDER_DELAY);
  }
  componentWillMount() {
  }
  componentDidMount() {
    this.props.onRef(this);
    const self = this;
    this.hot = new Handsontable(this.hotDom, Object.assign(hotConf, {
      isToday: self.props.isToday,
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
  componentWillUnmount() {
    this.props.onRef(undefined);
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
    if (!util.equal(hotTasks, this.props.tableTasks)) {
      this.props.handleSaveable(true);
      this.props.handleTableTasks(hotTasks);
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
    if (this.hot) this.hot.updateSettings({ isToday: this.props.isToday, data: [] });
  }

  renderHot() {
    if (this.hot) this.hot.render();
  }

  render() {
    return (<div ref={(node) => { this.hotDom = node; }} />);
  }
}

TaskTable.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  handleTableTasks: PropTypes.func.isRequired,
  handleSaveable: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  moveTableTaskToPoolTask: PropTypes.func.isRequired,
  isToday: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TaskTable);

