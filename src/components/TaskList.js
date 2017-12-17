import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import task from '../task';

const styles = {
  root: {
    padding: '0 24px 24px',
    minHeight: 350,
    maxHeight: 350,
    overflowY: 'scroll',
  },
  actionIcon: {
    width: 30,
  },
  miniCell: {
    maxWidth: 50,
  },
};

class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTask: task,
    };
  }

  changeNewTaskTitle(e) {
    const newTask = Object.assign({}, this.state.newTask);
    newTask.title = e.target.value;
    this.setState({ newTask });
  }

  changeNewTaskMemo(e) {
    const newTask = Object.assign({}, this.state.newTask);
    newTask.memo = e.target.value;
    this.setState({ newTask });
  }

  changeNewTaskEstimate(e) {
    const newTask = Object.assign({}, this.state.newTask);
    newTask.estimate = e.target.value;
    this.setState({ newTask });
  }

  addTask() {
    // 作業内容が空の場合は登録させない
    if (this.state.newTask.title === '') return;

    this.props.addTask(cloneDeep(this.state.newTask));
    const newTask = Object.assign({}, this.state.newTask);
    newTask.title = '';
    newTask.memo = '';
    newTask.estimate = '';
    this.setState({ newTask });
  }

  render() {
    const { tasks, classes, moveTask, removeTask } = this.props;
    return (
      <div className={classes.root}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>作業内容</TableCell>
              <TableCell>備考</TableCell>
              <TableCell className={classes.miniCell}>見積</TableCell>
              <TableCell>アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((n, index) => (
              <TableRow hover key={index.toString()}>
                <TableCell>{n.title}</TableCell>
                <TableCell>{n.memo}</TableCell>
                <TableCell className={classes.miniCell}>{n.estimate}</TableCell>
                <TableCell>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => moveTask(index)}>
                    <i className="fa fa-level-down" />
                  </IconButton>
                  <span>　/　</span>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => removeTask(index)}>
                    <i className="fa fa-trash-o" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Input
                  fullWidth
                  onChange={this.changeNewTaskTitle.bind(this)}
                  value={this.state.newTask.title}
                  placeholder="作業内容"
                />
              </TableCell>
              <TableCell>
                <Input
                  fullWidth
                  onChange={this.changeNewTaskMemo.bind(this)}
                  value={this.state.newTask.memo}
                  placeholder="備考"
                />
              </TableCell>
              <TableCell className={classes.miniCell}>
                <Input
                  type="number"
                  onChange={this.changeNewTaskEstimate.bind(this)}
                  value={this.state.newTask.estimate}
                  placeholder="見積"
                />
              </TableCell>
              <TableCell>
                <IconButton color="default" onClick={this.addTask.bind(this)}>
                  <i className="fa fa-plus" />
                </IconButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

TaskList.propTypes = {
  tasks: PropTypes.array.isRequired,
  addTask: PropTypes.func.isRequired,
  moveTask: PropTypes.func.isRequired,
  removeTask: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TaskList);
