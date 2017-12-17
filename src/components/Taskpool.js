import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';
import Paper from 'material-ui/Paper';

import constants from '../constants';

import TaskList from './TaskList';

const styles = {};

class TaskPool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
    };
  }

  handleTaskIdentifier() {
    let identifier;
    if (this.state.tab === constants.taskPool.HIGHPRIORITY) {
      identifier = constants.taskPool.HIGHPRIORITY;
    } else if (this.state.tab === constants.taskPool.LOWPRIORITY) {
      identifier = constants.taskPool.LOWPRIORITY;
    } else if (this.state.tab === constants.taskPool.REGULAR) {
      identifier = constants.taskPool.REGULAR;
    } else if (this.state.tab === constants.taskPool.DAILY) {
      identifier = constants.taskPool.DAILY;
    }
    return identifier;
  }

  addTask(task) {
    this.props.changePoolTasks('add', this.handleTaskIdentifier(), task);
  }
  moveTask(index) {
    this.props.changePoolTasks('move', this.handleTaskIdentifier(), index);
  }

  removeTask(index) {
    this.props.changePoolTasks('remove', this.handleTaskIdentifier(), index);
  }

  handleTabChange(event, tab) {
    this.setState({ tab });
  }

  render() {
    const { isOpenTaskPool, toggleTaskPool, poolTasks } = this.props;
    return (
      <ExpansionPanel expanded={isOpenTaskPool}>
        <ExpansionPanelSummary onClick={toggleTaskPool} expandIcon={<i className="fa fa-angle-down fa-lg" />}>
          <i className="fa fa-tasks fa-lg" />
          <Typography>　タスクプール</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid item xs={12}>
            <Paper elevation={1}>
              <AppBar style={{ boxShadow: 'none', borderBottom: '1px solid #ccc' }} color="inherit" position="static">
                <Tabs
                  fullWidth
                  value={this.state.tab}
                  onChange={this.handleTabChange.bind(this)}
                  indicatorColor="#888"
                  textColor="inherit"
                >
                  <Tab fullWidth style={{ maxWidth: 'none' }} label="すぐにやる" />
                  <Tab fullWidth style={{ maxWidth: 'none' }} label="いつかやる" />
                  <Tab fullWidth style={{ maxWidth: 'none' }} label="定期的にやる" />
                  <Tab fullWidth style={{ maxWidth: 'none' }} label="毎日やる" />
                </Tabs>
              </AppBar>
              {(() => {
                let tasks = null;
                if (this.state.tab === constants.taskPool.HIGHPRIORITY) {
                  tasks = poolTasks.highPriorityTasks;
                } else if (this.state.tab === constants.taskPool.LOWPRIORITY) {
                  tasks = poolTasks.lowPriorityTasks;
                } else if (this.state.tab === constants.taskPool.REGULAR) {
                  tasks = poolTasks.regularTasks;
                } else if (this.state.tab === constants.taskPool.DAILY) {
                  tasks = poolTasks.dailyTasks;
                }
                return <TaskList addTask={this.addTask.bind(this)} moveTask={this.moveTask.bind(this)} removeTask={this.removeTask.bind(this)} tasks={tasks} />;
              })()}
            </Paper>
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

TaskPool.propTypes = {
  isOpenTaskPool: PropTypes.bool.isRequired,
  toggleTaskPool: PropTypes.func.isRequired,
  poolTasks: PropTypes.shape({
    highPriorityTasks: PropTypes.array.isRequired,
    lowPriorityTasks: PropTypes.array.isRequired,
    regularTasks: PropTypes.array.isRequired,
    dailyTasks: PropTypes.array.isRequired,
  }).isRequired,
  changePoolTasks: PropTypes.func.isRequired,
};

export default withStyles(styles)(TaskPool);
