import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import constants from '../constants';
import util from '../utils/util';
import i18n from '../i18n';

import PoolTaskList from './PoolTaskList';

class TaskPool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: constants.taskPoolType.HIGHPRIORITY,
    };
  }

  addTask(task) {
    const { changePoolTasks } = this.props;
    const { tab } = this.state;
    changePoolTasks(constants.taskActionType.ADD, tab, task);
  }

  editTask(task, index) {
    const { changePoolTasks } = this.props;
    const { tab } = this.state;
    changePoolTasks(constants.taskActionType.EDIT, tab, { task, index });
  }

  doTaskAction(index, taskActionType) {
    const { changePoolTasks, poolTasks } = this.props;
    const { tab } = this.state;
    if (taskActionType === constants.taskActionType.REMOVE && window.confirm(`${i18n.t('taskPool.areYouSureDelete_target', { target: poolTasks[tab][index].title })}`)) {
      changePoolTasks(constants.taskActionType.REMOVE, tab, index);
    } else if (taskActionType !== constants.taskActionType.REMOVE) {
      changePoolTasks(taskActionType, tab, index);
    }
  }

  handleTabChange(event, tab) {
    this.setState({ tab });
  }

  render() {
    const { userId, poolTasks, members } = this.props;
    const { tab } = this.state;
    let tasks = null;
    if (tab === constants.taskPoolType.HIGHPRIORITY) {
      tasks = poolTasks.highPriorityTasks;
    } else if (tab === constants.taskPoolType.LOWPRIORITY) {
      tasks = poolTasks.lowPriorityTasks;
    } else if (tab === constants.taskPoolType.REGULAR) {
      tasks = poolTasks.regularTasks;
    }
    return (
      <div>
        <AppBar style={{ boxShadow: 'none', borderBottom: '1px solid #ccc' }} color="inherit" position="static">
          {(() => {
            if (!util.isMobile()) {
              return (
                <Tabs scrollable scrollButtons="on" fullWidth value={tab} onChange={this.handleTabChange.bind(this)} indicatorColor="secondary" textColor="inherit">
                  <Tab value={constants.taskPoolType.HIGHPRIORITY} fullWidth style={{ maxWidth: 'none' }} label={i18n.t('taskPool.highPriority')} />
                  <Tab value={constants.taskPoolType.LOWPRIORITY} fullWidth style={{ maxWidth: 'none' }} label={i18n.t('taskPool.lowPriority')} />
                  <Tab value={constants.taskPoolType.REGULAR} fullWidth style={{ maxWidth: 'none' }} label={i18n.t('taskPool.regular')} />
                </Tabs>
              );
            }
            return (
              <Tabs scrollable scrollButtons="on" fullWidth value={tab} onChange={this.handleTabChange.bind(this)} indicatorColor="secondary" textColor="inherit">
                <Tab value={constants.taskPoolType.HIGHPRIORITY} fullWidth style={{ maxWidth: 'none' }} label={i18n.t('taskPool.highPriority')} />
                <Tab value={constants.taskPoolType.LOWPRIORITY} fullWidth style={{ maxWidth: 'none' }} label={i18n.t('taskPool.lowPriority')} />
              </Tabs>
            );
          })()}
        </AppBar>
        <PoolTaskList
          userId={userId}
          addTask={this.addTask.bind(this)}
          editTask={this.editTask.bind(this)}
          doTaskAction={this.doTaskAction.bind(this)}
          tasks={tasks}
          members={members}
          isRegularTask={tab === constants.taskPoolType.REGULAR}
        />
      </div>
    );
  }
}

TaskPool.propTypes = {
  userId: PropTypes.string.isRequired,
  poolTasks: PropTypes.shape({
    highPriorityTasks: PropTypes.array.isRequired,
    lowPriorityTasks: PropTypes.array.isRequired,
    regularTasks: PropTypes.array.isRequired,
  }).isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  })).isRequired,
  changePoolTasks: PropTypes.func.isRequired,
};

export default TaskPool;
