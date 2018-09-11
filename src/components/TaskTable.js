import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.min.css';
import { withStyles } from '@material-ui/core/styles';
import debounce from 'lodash.debounce';

import {
  hotConf, contextMenuCallback, contextMenuItems, getHotTasksIgnoreEmptyTask, setDataForHot,
} from '../hot';
import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';

import '../styles/handsontable-custom.css';
import tasksUtil from '../utils/tasksUtil';

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
    const {
      onRef,
      isActive,
    } = this.props;
    onRef(this);
    const self = this;
    const isActiveNotifi = isActive;
    this.hot = new Handsontable(this.hotDom, Object.assign(hotConf, {
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
    setTimeout(() => {
      if (this.hot) this.hot.selectCell(0, this.hot.getSettings().columns.findIndex(column => column.data === 'title'));
    });
  }

  componentDidUpdate(prevProps) {
    const {
      members,
      userId,
      taskTableFilterBy,
      tableTasks,
    } = this.props;
    if (!util.equal(members, prevProps.members)) {
      hotConf.columns[hotConf.columns.findIndex(column => column.data === 'assign')].selectOptions = members.reduce((obj, member) => Object.assign(obj, { [member.uid]: member.displayName }), {});
      this.hot.updateSettings(Object.assign(hotConf, {
        userId,
        members,
      }));
    }
    if (taskTableFilterBy !== prevProps.taskTableFilterBy
      || !util.equal(tableTasks, prevProps.tableTasks)) {
      this.setDataForHot(taskTableFilterBy
        ? tasksUtil.getTasksByAssign(tableTasks, taskTableFilterBy) : tableTasks);
    }
  }

  componentWillUnmount() {
    const { onRef } = this.props;
    onRef(undefined);
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
    const { moveTableTaskToPoolTask } = this.props;
    const task = hotInstance.getSourceDataAtRow(hotInstance.toPhysicalRow(index));
    if (!task.title) {
      alert(i18n.t('worksheet.cantMoveToTaskPoolWithNoTitleTask'));
      return;
    }
    hotInstance.alter('remove_row', index);
    moveTableTaskToPoolTask(taskPoolType, task);
  }

  syncPropByRender() {
    const {
      handleSaveable,
      handleTableTasks,
    } = this.props;
    if (!this.hot) return;
    if (!this.isSamePropTaskAndHotData()) {
      handleSaveable(true);
      const tableTasks = getHotTasksIgnoreEmptyTask(this.hot);
      handleTableTasks(tableTasks.map(task => tasksUtil.deleteUselessTaskProp(task)));
    }
  }

  syncPropByUpdate() {
    const { handleSaveable } = this.props;
    if (!this.hot) return;
    if (!this.isSamePropTaskAndHotData()) {
      handleSaveable(false);
    }
  }

  isSamePropTaskAndHotData() {
    const {
      tableTasks,
      taskTableFilterBy,
    } = this.props;
    const hotTasks = getHotTasksIgnoreEmptyTask(this.hot)
      .map(task => tasksUtil.deleteUselessTaskProp(task));
    const propTasks = tableTasks.map(task => tasksUtil.deleteUselessTaskProp(task));
    let same = false;
    if (taskTableFilterBy) {
      same = util.equal(tasksUtil.getTasksByAssign(hotTasks, taskTableFilterBy),
        tasksUtil.getTasksByAssign(propTasks, taskTableFilterBy));
    } else {
      same = util.equal(hotTasks, propTasks);
    }
    return same;
  }

  updateIsActive(isActive) {
    if (this.hot) this.hot.updateSettings({ isActiveNotifi: isActive });
  }

  render() {
    return (<div ref={(node) => { this.hotDom = node; }} />);
  }
}

TaskTable.propTypes = {
  userId: PropTypes.string.isRequired,
  taskTableFilterBy: PropTypes.string.isRequired,
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
