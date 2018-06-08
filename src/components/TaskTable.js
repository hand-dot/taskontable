import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'lodash.debounce';

import { getHotConf, contextMenuCallback, contextMenuItems, getHotTasksIgnoreEmptyTask, setDataForHot } from '../hot';
import constants from '../constants';
import util from '../util';

import '../styles/handsontable-custom.css';
import tasksUtil from '../tasksUtil';

const styles = {
};

const hotConf = getHotConf();

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
    const isActiveNotifi = this.props.isActive;
    this.hot = new Handsontable(this.hotDom, Object.assign(hotConf, {
      data: [{
        id: '', assign: '', title: 'loading...', estimate: '0', startTime: '', endTime: '', memo: 'please wait...',
      }],
      isActiveNotifi,
      contextMenu: {
        callback(key, selections) {
          if (key === 'reverse_taskpool_hight' || key === 'reverse_taskpool_low') {
            const taskPoolType = key === 'reverse_taskpool_hight' ? constants.taskPoolType.HIGHPRIORITY : constants.taskPoolType.LOWPRIORITY;
            selections.forEach((selection) => {
              for (let { row } = selection.start; row <= selection.end.row; row += 1) {
                // テーブルタスクからタスクプールに移すタイミングでテーブルが1行減るので常に選択開始行を処理する
                self.moveTableTaskToPoolTask(taskPoolType, selection.start.row, this);
              }
            });
          } else {
            contextMenuCallback(key, selections, this);
          }
        },
        items: contextMenuItems,
      },
      afterRender() { self.syncPropByRender(); },
      afterUpdateSettings() { self.syncPropByUpdate(); },
    }));
  }
  componentDidUpdate(prevProps) {
    if (!util.equal(this.props.members, prevProps.members)) {
      hotConf.columns[hotConf.columns.findIndex(column => column.data === 'assign')].selectOptions = this.props.members.reduce((obj, member) => Object.assign(obj, { [member.uid]: member.displayName }), {});
      this.hot.updateSettings(Object.assign(hotConf, {
        userId: this.props.userId,
        members: this.props.members,
      }));
    }
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
    if (!this.hot) return;
    this.hot.destroy();
    this.hot = null;
  }

  setDataForHot(datas) {
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
    if (!util.equal(hotTasks.map(task => tasksUtil.deleteUselessTaskProp(task)), this.props.tableTasks.map(task => tasksUtil.deleteUselessTaskProp(task)))) {
      this.props.handleSaveable(true);
      this.props.handleTableTasks(hotTasks);
      if (this.hot) this.hot.render();
    }
  }

  syncPropByUpdate() {
    this.props.handleSaveable(false);
    this.props.handleTableTasks(getHotTasksIgnoreEmptyTask(this.hot));
  }

  updateIsActive(isActive) {
    if (this.hot) this.hot.updateSettings({ isActiveNotifi: isActive });
  }

  renderHot() {
    if (this.hot) this.hot.render();
  }

  render() {
    return (<div ref={(node) => { this.hotDom = node; }} />);
  }
}

TaskTable.propTypes = {
  userId: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    photoURL: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  })).isRequired,
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
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
  isActive: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TaskTable);

