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

import TaskList from './TaskList';

const styles = {};

const TAB = {
  highPriorityTasks: 0,
  lowPriorityTasks: 1,
  regularTasks: 2,
  dailyTasks: 3,
};

class TaskPool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: 0,
    };
  }

  addTask(task) {
    if (this.state.tab === TAB.highPriorityTasks) {
      console.log('addTask', task);
    }
  }

  moveTask(index) {
    if (this.state.tab === TAB.highPriorityTasks) {
      console.log(index, 'move');
    }
  }

  removeTask(index) {
    if (this.state.tab === TAB.highPriorityTasks) {
      console.log(index, 'removeTask');
    }
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
                if (this.state.tab === TAB.highPriorityTasks) {
                  tasks = poolTasks.highPriorityTasks;
                } else if (this.state.tab === TAB.lowPriorityTasks) {
                  tasks = poolTasks.lowPriorityTasks;
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
  }).isRequired,
};

export default withStyles(styles)(TaskPool);
