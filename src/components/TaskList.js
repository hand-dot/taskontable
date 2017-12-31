import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

import taskSchema from '../task';

const styles = {
  root: {
    padding: '0 24px 24px',
    minHeight: 210,
    maxHeight: 210,
    overflowY: 'scroll',
  },
  actionIcon: {
    width: 15,
  },
  miniCell: {
    maxWidth: 50,
  },
};

class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addTask: cloneDeep(taskSchema),
      editTask: cloneDeep(taskSchema),
      editingTaskIndex: -1,
    };
  }

  changeTaskTitle(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.title = e.target.value;
    this.setState({ [type]: task });
  }

  changeTaskMemo(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.memo = e.target.value;
    this.setState({ [type]: task });
  }

  changeTaskEstimate(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.estimate = e.target.value;
    this.setState({ [type]: task });
  }

  editTask(index) {
    if (this.state.editingTaskIndex === index) {
      // 編集を保存する場合
      this.props.editTask(cloneDeep(this.state.editTask), index);
      this.setState({ editingTaskIndex: -1, editTask: cloneDeep(taskSchema) });
    } else {
      // 編集スタート
      this.setState({ editTask: cloneDeep(this.props.tasks[index]) });
      setTimeout(() => {
        this.setState({ editingTaskIndex: index });
      });
    }
  }

  addTask() {
    // 作業内容が空の場合は登録させない
    if (this.state.addTask.title === '') return;
    this.props.addTask(cloneDeep(this.state.addTask));
    this.setState({ addTask: cloneDeep(taskSchema) });
    const $root = this.root;
    setTimeout(() => { $root.scrollTop = $root.scrollHeight; });
  }

  render() {
    const { tasks, classes, moveTask, removeTask, downTask, upTask } = this.props;
    return (
      <div ref={(root) => { this.root = root; }} className={classes.root}>
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
                <TableCell>
                  <Input
                    fullWidth
                    onChange={this.changeTaskTitle.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? n.title : this.state.editTask.title}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    fullWidth
                    onChange={this.changeTaskMemo.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? n.memo : this.state.editTask.memo}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell className={classes.miniCell}>
                  <Input
                    fullWidth
                    onChange={this.changeTaskEstimate.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? n.estimate : this.state.editTask.estimate}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => moveTask(index)}>
                    <i className="fa fa-download" title="テーブルに移動" />
                  </IconButton>
                  <span>　/　</span>
                  <IconButton className={classes.actionIcon} color="default" onClick={this.editTask.bind(this, index)}>
                    <i className={this.state.editingTaskIndex !== index ? 'fa fa-pencil' : 'fa fa-floppy-o'} title={this.state.editingTaskIndex !== index ? '編集' : '編集を保存'} />
                  </IconButton>
                  <span>　/　</span>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => downTask(index)}>
                    <i className="fa fa-arrow-down" title="1つ下に移動" />
                  </IconButton>
                  <span>　/　</span>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => upTask(index)}>
                    <i className="fa fa-arrow-up" title="1つ上に移動" />
                  </IconButton>
                  <span>　/　</span>
                  <IconButton className={classes.actionIcon} color="default" onClick={() => removeTask(index)}>
                    <i className="fa fa-trash-o" title="削除" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Input
                  fullWidth
                  onChange={this.changeTaskTitle.bind(this, 'addTask')}
                  value={this.state.addTask.title}
                  placeholder="作業内容"
                />
              </TableCell>
              <TableCell>
                <Input
                  fullWidth
                  onChange={this.changeTaskMemo.bind(this, 'addTask')}
                  value={this.state.addTask.memo}
                  placeholder="備考"
                />
              </TableCell>
              <TableCell className={classes.miniCell}>
                <Input
                  type="number"
                  onChange={this.changeTaskEstimate.bind(this, 'addTask')}
                  value={this.state.addTask.estimate}
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
  editTask: PropTypes.func.isRequired,
  moveTask: PropTypes.func.isRequired,
  removeTask: PropTypes.func.isRequired,
  downTask: PropTypes.func.isRequired,
  upTask: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TaskList);
