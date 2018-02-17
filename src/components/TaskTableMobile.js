import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';


import poolTaskSchema from '../schemas/poolTaskSchema';

import constants from '../constants';
import util from '../util';

const styles = theme => ({
  root: {
    padding: 0,
    minHeight: 210,
    maxHeight: 420,
    overflowY: 'scroll',
  },
  actionIcon: {
    fontSize: 14,
    width: theme.breakpoints.values.sm < constants.APPWIDTH ? 45 : 14,
  },
  actionIcons: {
    margin: '0 auto',
  },
  cell: {
    border: '1px solid rgba(235, 235, 235, 1)',
    padding: '0 5px',
  },
  miniCell: {
    border: '1px solid rgba(235, 235, 235, 1)',
    padding: '0 3px',
    maxWidth: '3rem',
  },
  cellInput: {
    color: '#000',
    fontSize: 12,
  },
  taskRow: {
    animation: 'blink 1s',
  },
});

function getPoolTaskSchema() {
  return util.cloneDeep(poolTaskSchema);
}

class TaskTableMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: [],
      addTask: getPoolTaskSchema(),
      editTask: getPoolTaskSchema(),
      editingTaskIndex: -1,
    };
  }

  openTaskAction(index, e) {
    const anchorEl = Object.assign([], this.state.anchorEl);
    anchorEl[index] = e.currentTarget;
    this.setState({
      anchorEl,
      editingTaskIndex: -1,
    });
  }

  closeTaskAction(index) {
    const anchorEl = Object.assign([], this.state.anchorEl);
    anchorEl[index] = null;
    this.setState({ anchorEl });
  }

  changeTaskTitle(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.title = e.target.value;
    this.setState({ [type]: task });
  }

  changeTaskStartTime(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.startTime = e.target.value;
    this.setState({ [type]: task });
  }

  changeTaskEndTime(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.endTime = e.target.value;
    this.setState({ [type]: task });
  }

  changeTaskEstimate(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.estimate = e.target.value;
    this.setState({ [type]: task });
  }

  changeDayOfWeek(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.dayOfWeek = e.target.value;
    this.setState({ [type]: task });
  }

  changeWeek(type, e) {
    const task = Object.assign({}, this.state[type]);
    task.week = e.target.value;
    this.setState({ [type]: task });
  }

  editTask(index) {
    if (this.state.editingTaskIndex === index) {
      // 編集を保存する場合
      if (this.state.editTask.title === '') {
        alert('作業内容が空の状態では保存できません。');
        return;
      }
      this.props.editTask(util.cloneDeep(this.state.editTask), index);
      this.setState({ editingTaskIndex: -1, editTask: getPoolTaskSchema() });
    } else {
      // 編集スタート
      this.setState({ editTask: util.cloneDeep(this.props.tasks[index]) });
      setTimeout(() => {
        this.setState({ editingTaskIndex: index });
      });
    }
  }

  removeTask(index) {
    this.closeTaskAction(index);
    this.props.removeTask(index);
  }

  downTask(index) {
    this.closeTaskAction(index);
    this.props.downTask(index);
  }

  upTask(index) {
    this.closeTaskAction(index);
    this.props.upTask(index);
  }

  bottomToTask(index) {
    this.closeTaskAction(index);
    this.props.bottomToTask(index);
  }

  topToTask(index) {
    this.closeTaskAction(index);
    this.props.topToTask(index);
  }

  addTask() {
    if (this.state.addTask.title === '') {
      alert('作業内容が空の状態では保存できません。');
      return;
    }
    if (this.props.isRegularTask) {
      if (this.state.addTask.week.length === 0) {
        alert('第何週が空の状態では保存できません。');
        return;
      } else if (this.state.addTask.dayOfWeek.length === 0) {
        alert('何曜日が空の状態では保存できません。');
        return;
      }
    }
    this.props.addTask(util.cloneDeep(this.state.addTask));
    this.setState({ addTask: getPoolTaskSchema() });
    const $root = this.root;
    setTimeout(() => { $root.scrollTop = $root.scrollHeight; });
  }

  render() {
    const { tasks, classes } = this.props;
    return (
      <div ref={(root) => { this.root = root; }} className={classes.root}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="none" className={classes.cell}>作業内容</TableCell>
              <TableCell padding="none" className={classes.miniCell}>見積</TableCell>
              <TableCell padding="none" className={classes.miniCell}>開始時刻</TableCell>
              <TableCell padding="none" className={classes.miniCell}>終了時刻</TableCell>
              <TableCell padding="none" className={classes.miniCell}>アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow className={classes.taskRow} key={task.title + task.memo + task.estimate}>
                <TableCell padding="none" className={classes.cell}>
                  <Input
                    className={classes.cellInput}
                    fullWidth
                    onChange={this.changeTaskTitle.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? task.title : this.state.editTask.title}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.miniCell}>
                  <Input
                    className={classes.cellInput}
                    type="number"
                    fullWidth
                    onChange={this.changeTaskEstimate.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? task.estimate : this.state.editTask.estimate}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.cell}>
                  <TextField
                    type="time"
                    InputProps={{ style: { fontSize: 12 } }}
                    onChange={this.changeTaskStartTime.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? task.startTime : this.state.editTask.startTime}
                    disabled={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.cell}>
                  <TextField
                    type="time"
                    InputProps={{ style: { fontSize: 12 } }}
                    onChange={this.changeTaskEndTime.bind(this, 'editTask')}
                    value={this.state.editingTaskIndex !== index ? task.endTime : this.state.editTask.endTime}
                    disabled={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell style={{ textAlign: 'center' }} padding="none" className={classes.miniCell}>
                  <div className={classes.actionIcons}>
                    <IconButton className={classes.actionIcon} color="default" onClick={this.editTask.bind(this, index)}>
                      <i className={this.state.editingTaskIndex !== index ? 'fa fa-pencil' : 'fa fa-floppy-o'} />
                    </IconButton>
                    <span>/</span>
                    <IconButton className={classes.actionIcon} color="default" onClick={this.openTaskAction.bind(this, index)}>
                      <i className="fa fa-ellipsis-h" />
                    </IconButton>
                    <Menu
                      anchorEl={this.state.anchorEl[index]}
                      open={Boolean(this.state.anchorEl[index] || false)}
                      onClose={this.closeTaskAction.bind(this, index)}
                    >
                      <MenuItem key={'topToTask'} onClick={this.topToTask.bind(this, index)}>
                        <i className="fa fa-angle-double-up" />
                        <Typography variant="caption">先頭に移動</Typography>
                      </MenuItem>
                      <MenuItem key={'upTask'} onClick={this.upTask.bind(this, index)}>
                        <i className="fa fa-angle-up" />
                        <Typography variant="caption">1つ上に移動</Typography>
                      </MenuItem>
                      <MenuItem key={'downTask'} onClick={this.downTask.bind(this, index)}>
                        <i className="fa fa-angle-down" />
                        <Typography variant="caption">1つ下に移動</Typography>
                      </MenuItem>
                      <MenuItem key={'bottomToTask'} onClick={this.bottomToTask.bind(this, index)}>
                        <i className="fa fa-angle-double-down" />
                        <Typography variant="caption">末尾に移動</Typography>
                      </MenuItem>
                      <MenuItem key={'removeTask'} onClick={this.removeTask.bind(this, index)}>
                        <i className="fa fa-trash-o" />
                        <Typography variant="caption">削除</Typography>
                      </MenuItem>
                    </Menu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell padding="none" className={classes.cell}>
                <Input
                  className={classes.cellInput}
                  fullWidth
                  onChange={this.changeTaskTitle.bind(this, 'addTask')}
                  value={this.state.addTask.title}
                  placeholder="作業内容"
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <Input
                  className={classes.cellInput}
                  type="number"
                  fullWidth
                  onChange={this.changeTaskEstimate.bind(this, 'addTask')}
                  value={this.state.addTask.estimate}
                  placeholder="見積"
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <TextField
                  type="time"
                  InputProps={{ style: { fontSize: 12 } }}
                  onChange={this.changeTaskStartTime.bind(this, 'addTask')}
                  value={this.state.addTask.startTime}
                  placeholder="開始時刻"
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <TextField
                  type="time"
                  InputProps={{ style: { fontSize: 12 } }}
                  onChange={this.changeTaskEndTime.bind(this, 'addTask')}
                  value={this.state.addTask.endTime}
                  placeholder="終了時刻"
                />
              </TableCell>
              <TableCell style={{ textAlign: 'center' }} padding="none" className={classes.miniCell}>
                <IconButton className={classes.actionIcon} color="default" onClick={this.addTask.bind(this)}>
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

TaskTableMobile.propTypes = {
  tasks: PropTypes.array.isRequired,
  addTask: PropTypes.func.isRequired,
  editTask: PropTypes.func.isRequired,
  removeTask: PropTypes.func.isRequired,
  downTask: PropTypes.func.isRequired,
  upTask: PropTypes.func.isRequired,
  bottomToTask: PropTypes.func.isRequired,
  topToTask: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TaskTableMobile);
