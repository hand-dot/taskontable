import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { withStyles } from 'material-ui/styles';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import Menu, { MenuItem } from 'material-ui/Menu';
import TextField from 'material-ui/TextField';
import Input from 'material-ui/Input';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import tableTaskSchema from '../schemas/tableTaskSchema';
import constants from '../constants';
import style from '../assets/style';
import util from '../util';

const styles = style.table;

function getTableTaskSchema() {
  return util.setIdIfNotExist(util.cloneDeep(tableTaskSchema));
}

class TaskTableMobile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: [],
      [constants.taskStateType.add]: getTableTaskSchema(),
      [constants.taskStateType.edit]: getTableTaskSchema(),
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

  addTask() {
    if (this.state[constants.taskStateType.add].title === '') {
      alert('作業内容が空の状態では保存できません。');
      return;
    }
    this.props.changeTableTasks(constants.taskActionType.ADD, util.cloneDeep(this.state[constants.taskStateType.add]));
    this.setState({ [constants.taskStateType.add]: getTableTaskSchema() });
    setTimeout(() => { this.root.scrollTop = this.root.scrollHeight; });
  }

  editTask(index) {
    if (this.state.editingTaskIndex === index) {
      // 編集を保存する場合
      if (this.state[constants.taskStateType.edit].title === '') {
        alert('作業内容が空の状態では保存できません。');
        return;
      }
      if (!util.equal(this.props.tableTasks[index], this.state[constants.taskStateType.edit])) {
        this.props.changeTableTasks(constants.taskActionType.EDIT, { task: util.cloneDeep(this.state[constants.taskStateType.edit]), index });
      }
      this.setState({ editingTaskIndex: -1, [constants.taskStateType.edit]: getTableTaskSchema() });
    } else {
      // 編集スタート
      this.setState({
        editingTaskIndex: index,
        [constants.taskStateType.edit]: util.cloneDeep(this.props.tableTasks[index]),
        [constants.taskStateType.add]: getTableTaskSchema(),
      });
    }
  }

  removeTask(index) {
    if (window.confirm(`${this.props.tableTasks[index].title} を本当に削除しますか？`)) {
      this.closeTaskAction(index);
      this.props.changeTableTasks(constants.taskActionType.REMOVE, index);
    }
  }


  downTask(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.DOWN, index);
  }

  upTask(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.UP, index);
  }

  bottomToTask(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.BOTTOM, index);
  }

  topToTask(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.TOP, index);
  }

  movePoolHighPriority(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.MOVE_POOL_HIGHPRIORITY, index);
  }


  movePoolLowPriority(index) {
    this.closeTaskAction(index);
    this.props.changeTableTasks(constants.taskActionType.MOVE_POOL_LOWPRIORITY, index);
  }


  render() {
    const { tableTasks, classes } = this.props;
    return (
      <div ref={(root) => { this.root = root; }} className={classes.root}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="none" className={`${classes.cell} ${classes.tableHeader}`}>作業内容</TableCell>
              <TableCell padding="none" className={`${classes.miniCell} ${classes.tableHeader}`}>見積</TableCell>
              <TableCell padding="none" className={`${classes.miniCell} ${classes.tableHeader}`}>開始</TableCell>
              <TableCell padding="none" className={`${classes.miniCell} ${classes.tableHeader}`}>終了</TableCell>
              <TableCell padding="none" className={`${classes.miniCell} ${classes.tableHeader}`}>編集</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableTasks.map((task, index) => (
              <TableRow
                className={classes.taskRow}
                key={task.id}
                style={(() => {
                  const obj = {};
                  if (task.startTime && task.endTime) {
                    obj.backgroundColor = constants.cellColor.DONE;
                  } else if (task.estimate === '') {
                    obj.backgroundColor = constants.cellColor.WARNING;
                  } else if (this.props.isToday && task.startTime) {
                    // 本日のタスクの場合,開始時刻、見積もりが設定してあるタスクなので、実行中の色,予約の色,終了が近づいている色をつける処理
                    const nowTimeVal = moment().format(constants.TIMEFMT);
                    const expectedEndTimeVal = moment(task.startTime, constants.TIMEFMT).add(task.estimate, 'minutes').format(constants.TIMEFMT);
                    const timeDiffMinute = util.getTimeDiffMinute(nowTimeVal, expectedEndTimeVal);
                    if (timeDiffMinute < 1) {
                      obj.backgroundColor = constants.cellColor.OUT;
                    } else {
                      obj.backgroundColor = util.getTimeDiffMinute(nowTimeVal, task.startTime) < 1 ? constants.cellColor.RUNNING : constants.cellColor.RESERVATION;
                    }
                  }
                  return obj;
                })()}
              >
                <TableCell padding="none" className={classes.cell}>
                  <Input
                    className={classes.cellInput}
                    fullWidth
                    onChange={this.changeTaskTitle.bind(this, constants.taskStateType.edit)}
                    value={this.state.editingTaskIndex !== index ? task.title : this.state[constants.taskStateType.edit].title}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.miniCell}>
                  <Input
                    className={classes.cellInput}
                    type="number"
                    fullWidth
                    onChange={this.changeTaskEstimate.bind(this, constants.taskStateType.edit)}
                    value={this.state.editingTaskIndex !== index ? task.estimate : this.state[constants.taskStateType.edit].estimate}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.miniCell}>
                  <TextField
                    type="time"
                    className={classes.cellInput}
                    InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== index }}
                    onChange={this.changeTaskStartTime.bind(this, constants.taskStateType.edit)}
                    value={this.state.editingTaskIndex !== index ? task.startTime : this.state[constants.taskStateType.edit].startTime}
                    disabled={this.state.editingTaskIndex !== index}
                  />
                </TableCell>
                <TableCell padding="none" className={classes.miniCell}>
                  <TextField
                    type="time"
                    className={classes.cellInput}
                    InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== index }}
                    onChange={this.changeTaskEndTime.bind(this, constants.taskStateType.edit)}
                    value={this.state.editingTaskIndex !== index ? task.endTime : this.state[constants.taskStateType.edit].endTime}
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
                      <i className="fa fa-ellipsis-v" />
                    </IconButton>
                    <Menu
                      anchorEl={this.state.anchorEl[index]}
                      open={Boolean(this.state.anchorEl[index] || false)}
                      onClose={this.closeTaskAction.bind(this, index)}
                    >
                      <MenuItem key={'movePoolHighPriority'} disabled={task.endTime !== ''} onClick={this.movePoolHighPriority.bind(this, index)}>
                        <i className="fa fa-upload" />
                        <Typography variant="caption">[すぐにやる]に戻す</Typography>
                      </MenuItem>
                      <MenuItem key={'movePoolLowPriority'} disabled={task.endTime !== ''} onClick={this.movePoolLowPriority.bind(this, index)}>
                        <i className="fa fa-upload" />
                        <Typography variant="caption">[いつかやる]に戻す</Typography>
                      </MenuItem>
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
                  onChange={this.changeTaskTitle.bind(this, constants.taskStateType.add)}
                  value={this.state[constants.taskStateType.add].title}
                  placeholder="作業内容"
                  disabled={this.state.editingTaskIndex !== -1}
                  disableUnderline={this.state.editingTaskIndex !== -1}
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <Input
                  className={classes.cellInput}
                  type="number"
                  fullWidth
                  onChange={this.changeTaskEstimate.bind(this, constants.taskStateType.add)}
                  value={this.state[constants.taskStateType.add].estimate}
                  placeholder="見積"
                  disabled={this.state.editingTaskIndex !== -1}
                  disableUnderline={this.state.editingTaskIndex !== -1}
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <TextField
                  type="time"
                  className={classes.cellInput}
                  InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== -1 }}
                  onChange={this.changeTaskStartTime.bind(this, constants.taskStateType.add)}
                  value={this.state[constants.taskStateType.add].startTime}
                  placeholder="開始時刻"
                  disabled={this.state.editingTaskIndex !== -1}
                />
              </TableCell>
              <TableCell padding="none" className={classes.miniCell}>
                <TextField
                  type="time"
                  className={classes.cellInput}
                  InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== -1 }}
                  onChange={this.changeTaskEndTime.bind(this, constants.taskStateType.add)}
                  value={this.state[constants.taskStateType.add].endTime}
                  placeholder="終了時刻"
                  disabled={this.state.editingTaskIndex !== -1}
                />
              </TableCell>
              <TableCell style={{ textAlign: 'center' }} padding="none" className={classes.miniCell}>
                <IconButton className={classes.actionIcon} color="default" onClick={this.addTask.bind(this)} disabled={this.state.editingTaskIndex !== -1}>
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
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  changeTableTasks: PropTypes.func.isRequired,
  isToday: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TaskTableMobile);
