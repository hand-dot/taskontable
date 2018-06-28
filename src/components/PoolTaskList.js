import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import Edit from '@material-ui/icons/Edit';
import Save from '@material-ui/icons/Save';
import Add from '@material-ui/icons/Add';

import MultipleSelect from './MultipleSelect';
import poolTaskSchema from '../schemas/poolTaskSchema';
import constants from '../constants';
import util from '../util';
import i18n from '../i18n';
import style from '../assets/style';

const styles = style.table;

const CustomTableCell = withStyles(() => ({
  root: {
    border: '1px solid #CCC',
  },
  head: {
    backgroundColor: '#f3f3f3',
  },
}))(TableCell);

function getPoolTaskSchema() {
  return util.setIdIfNotExist(util.cloneDeep(poolTaskSchema));
}

class TaskList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: [],
      [constants.taskStateType.add]: getPoolTaskSchema(),
      [constants.taskStateType.edit]: getPoolTaskSchema(),
      editingTaskIndex: -1,
    };
  }

  componentWillReceiveProps() {
    this.setState({ editingTaskIndex: -1 });
  }

  openTaskAction(index, e) {
    const anchorEl = Object.assign([], this.state.anchorEl);
    anchorEl[index] = e.currentTarget;
    this.setState({ anchorEl, editingTaskIndex: -1 });
  }

  closeTaskAction(index) {
    const anchorEl = Object.assign([], this.state.anchorEl);
    anchorEl[index] = null;
    this.setState({ anchorEl });
  }

  doTaskAction(index, taskActionType) {
    this.closeTaskAction(index);
    this.props.doTaskAction(index, taskActionType);
  }

  changeTask(type, prop, e) {
    const task = Object.assign({}, this.state[type]);
    task[prop] = e.target.value;
    this.setState({ [type]: task });
  }

  editTask(index) {
    if (this.state.editingTaskIndex === index) {
      // 編集を保存する場合
      if (this.state[constants.taskStateType.edit].title === '') {
        alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.title') })}`);
        return;
      }
      if (this.props.isRegularTask) {
        if (this.state[constants.taskStateType.edit].week.length === 0) {
          alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.weekNumber') })}`);
          return;
        } else if (this.state[constants.taskStateType.edit].dayOfWeek.length === 0) {
          alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.dayOfWeek') })}`);
          return;
        }
      }
      if (!util.equal(this.props.tasks[index], this.state[constants.taskStateType.edit])) {
        this.props.editTask(this.state[constants.taskStateType.edit], index);
      }
      this.setState({ editingTaskIndex: -1, [constants.taskStateType.edit]: getPoolTaskSchema() });
    } else {
      // 編集スタート
      this.setState({
        editingTaskIndex: index,
        [constants.taskStateType.edit]: this.props.tasks[index],
        [constants.taskStateType.add]: getPoolTaskSchema(),
      });
    }
  }

  addTask() {
    if (this.state[constants.taskStateType.add].title === '') {
      alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.title') })}`);
      return;
    }
    if (this.props.isRegularTask) {
      if (this.state[constants.taskStateType.add].week.length === 0) {
        alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.weekNumber') })}`);
        return;
      } else if (this.state[constants.taskStateType.add].dayOfWeek.length === 0) {
        alert(`${i18n.t('taskPool.cantSaveWhenIsEmpty_target', { target: i18n.t('taskPool.dayOfWeek') })}`);
        return;
      }
    }
    // タスクを追加した場合には割当を自動的に自分にする
    this.state[constants.taskStateType.add].assign = this.props.userId;
    this.props.addTask(this.state[constants.taskStateType.add]);
    this.setState({ [constants.taskStateType.add]: getPoolTaskSchema() });
    setTimeout(() => { this.root.scrollTop = this.root.scrollHeight; });
  }

  render() {
    const {
      tasks, isRegularTask, members, classes,
    } = this.props;
    return (
      <div ref={(root) => { this.root = root; }} className={classes.root}>
        <Table>
          <TableHead>
            <TableRow className={classes.taskRow}>
              <CustomTableCell className={classes.cellInput} padding="none">{i18n.t('columns.title')}</CustomTableCell>
              <CustomTableCell className={classes.cellInput} padding="none">{i18n.t('columns.memo')}</CustomTableCell>
              <CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('columns.estimate')}</CustomTableCell>
              {isRegularTask && (<CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('columns.assign')}</CustomTableCell>)}
              {isRegularTask && (<CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('columns.startTime')}</CustomTableCell>)}
              {isRegularTask && (<CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('taskPool.weekNumber')}</CustomTableCell>)}
              {isRegularTask && (<CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('taskPool.dayOfWeek')}</CustomTableCell>)}
              <CustomTableCell className={classes.miniCellInput} padding="none">{i18n.t('common.edit')}</CustomTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow className={classes.taskRow} key={task.id} >
                <CustomTableCell padding="none">
                  <Input
                    fullWidth
                    className={classes.cellInput}
                    onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'title')}
                    value={this.state.editingTaskIndex !== index ? task.title : this.state[constants.taskStateType.edit].title}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </CustomTableCell>
                <CustomTableCell padding="none">
                  <Input
                    fullWidth
                    className={classes.cellInput}
                    onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'memo')}
                    value={this.state.editingTaskIndex !== index ? task.memo : this.state[constants.taskStateType.edit].memo}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </CustomTableCell>
                <CustomTableCell padding="none">
                  <Input
                    className={classes.miniCellInput}
                    type="number"
                    onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'estimate')}
                    value={this.state.editingTaskIndex !== index ? task.estimate : this.state[constants.taskStateType.edit].estimate}
                    disabled={this.state.editingTaskIndex !== index}
                    disableUnderline={this.state.editingTaskIndex !== index}
                  />
                </CustomTableCell>
                {isRegularTask && (
                <CustomTableCell padding="none">
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <FormControl>
                      <Select
                        style={{ fontSize: 12 }}
                        native
                        value={this.state.editingTaskIndex !== index ? task.assign : this.state[constants.taskStateType.edit].assign}
                        onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'assign')}
                        disabled={this.state.editingTaskIndex !== index}
                        disableUnderline={this.state.editingTaskIndex !== index}
                      >
                        <option value="" />
                        {members.map(member => (
                          <option
                            key={member.uid}
                            value={member.uid}
                            style={{
                                fontSize: 12,
                              }}
                          >
                            {member.displayName}
                          </option>
                          ))}
                      </Select>
                    </FormControl>
                  </div>
                </CustomTableCell>
                )}
                {isRegularTask && (
                <CustomTableCell padding="none">
                  <TextField
                    type="time"
                    className={classes.miniCellInput}
                    InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== index }}
                    onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'startTime')}
                    value={this.state.editingTaskIndex !== index ? task.startTime : this.state[constants.taskStateType.edit].startTime}
                    placeholder={i18n.t('columns.startTime')}
                    disabled={this.state.editingTaskIndex !== index}
                  />
                </CustomTableCell>
                )}
                {isRegularTask && (
                  <CustomTableCell padding="none">
                    <MultipleSelect
                      className={classes.miniCellInput}
                      value={this.state.editingTaskIndex !== index ? task.week : this.state[constants.taskStateType.edit].week}
                      options={[1, 2, 3, 4, 5].map(w => ({ key: w.toString(), value: w }))}
                      onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'week')}
                      disabled={this.state.editingTaskIndex !== index}
                    />
                  </CustomTableCell>
                )}
                {isRegularTask && (
                  <CustomTableCell padding="none">
                    <MultipleSelect
                      className={classes.miniCellInput}
                      value={this.state.editingTaskIndex !== index ? task.dayOfWeek : this.state[constants.taskStateType.edit].dayOfWeek}
                      options={[0, 1, 2, 3, 4, 5, 6].map(d => ({ key: constants.DAY_OF_WEEK_STR[d], value: d }))}
                      onChange={this.changeTask.bind(this, constants.taskStateType.edit, 'dayOfWeek')}
                      disabled={this.state.editingTaskIndex !== index}
                    />
                  </CustomTableCell>
                )}
                <CustomTableCell style={{ textAlign: 'center' }} padding="none">
                  <div className={classes.actionIcons}>
                    <IconButton className={classes.actionIcon} color="default" onClick={this.editTask.bind(this, index)}>
                      {this.state.editingTaskIndex !== index ? <Edit style={{ fontSize: 16 }} /> : <Save style={{ fontSize: 16 }} />}
                    </IconButton>
                    <span>/</span>
                    <IconButton className={classes.actionIcon} color="default" onClick={this.openTaskAction.bind(this, index)}>
                      <MoreHoriz style={{ fontSize: 16 }} />
                    </IconButton>
                    <Menu
                      anchorEl={this.state.anchorEl[index]}
                      open={Boolean(this.state.anchorEl[index] || false)}
                      onClose={this.closeTaskAction.bind(this, index)}
                    >
                      <MenuItem key="moveTable" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.MOVE_TABLE)}>
                        <Typography variant="caption">{i18n.t('taskPool.moveToTable')}</Typography>
                      </MenuItem>
                      <MenuItem key="topToTask" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.TOP)}>
                        <Typography variant="caption">{i18n.t('taskPool.moveToTop')}</Typography>
                      </MenuItem>
                      <MenuItem key="upTask" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.UP)}>
                        <Typography variant="caption">{i18n.t('taskPool.moveUpOne')}</Typography>
                      </MenuItem>
                      <MenuItem key="downTask" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.DOWN)}>
                        <Typography variant="caption">{i18n.t('taskPool.moveOneDown')}</Typography>
                      </MenuItem>
                      <MenuItem key="bottomToTask" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.BOTTOM)}>
                        <Typography variant="caption">{i18n.t('taskPool.moveToBottom')}</Typography>
                      </MenuItem>
                      <MenuItem key="removeTask" onClick={this.doTaskAction.bind(this, index, constants.taskActionType.REMOVE)}>
                        <Typography variant="caption">{i18n.t('common.remove')}</Typography>
                      </MenuItem>
                    </Menu>
                  </div>
                </CustomTableCell>
              </TableRow>
            ))}
            <TableRow className={classes.taskRow}>
              <CustomTableCell padding="none">
                <Input
                  fullWidth
                  className={classes.cellInput}
                  onChange={this.changeTask.bind(this, constants.taskStateType.add, 'title')}
                  value={this.state[constants.taskStateType.add].title}
                  placeholder={i18n.t('columns.title')}
                  disabled={this.state.editingTaskIndex !== -1}
                  disableUnderline={this.state.editingTaskIndex !== -1}
                />
              </CustomTableCell>
              <CustomTableCell padding="none">
                <Input
                  fullWidth
                  className={classes.cellInput}
                  onChange={this.changeTask.bind(this, constants.taskStateType.add, 'memo')}
                  value={this.state[constants.taskStateType.add].memo}
                  placeholder={i18n.t('columns.memo')}
                  disabled={this.state.editingTaskIndex !== -1}
                  disableUnderline={this.state.editingTaskIndex !== -1}
                />
              </CustomTableCell>
              <CustomTableCell padding="none">
                <Input
                  className={classes.miniCellInput}
                  type="number"
                  onChange={this.changeTask.bind(this, constants.taskStateType.add, 'estimate')}
                  value={this.state[constants.taskStateType.add].estimate}
                  placeholder={i18n.t('columns.estimate')}
                  disabled={this.state.editingTaskIndex !== -1}
                  disableUnderline={this.state.editingTaskIndex !== -1}
                />
              </CustomTableCell>
              {isRegularTask && (
                <CustomTableCell padding="none">
                  <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: 12 }}>
                    <FormControl>
                      <Select
                        style={{ fontSize: 12 }}
                        native
                        value={this.state[constants.taskStateType.add].assign}
                        onChange={this.changeTask.bind(this, constants.taskStateType.add, 'assign')}
                        disabled={this.state.editingTaskIndex !== -1}
                        disableUnderline={this.state.editingTaskIndex !== -1}
                      >
                        <option value="" />
                        {members.map(member => (
                          <option
                            key={member.uid}
                            value={member.uid}
                            style={{ fontSize: 12 }}
                          >
                            {member.displayName}
                          </option>
                          ))}
                      </Select>
                    </FormControl>
                  </div>
                </CustomTableCell>
                )}
              {isRegularTask && (
                <CustomTableCell padding="none">
                  <TextField
                    type="time"
                    className={classes.miniCellInput}
                    InputProps={{ style: { fontSize: 11 }, disableUnderline: this.state.editingTaskIndex !== -1 }}
                    onChange={this.changeTask.bind(this, constants.taskStateType.add, 'startTime')}
                    value={this.state[constants.taskStateType.add].startTime}
                    placeholder={i18n.t('columns.startTime')}
                    disabled={this.state.editingTaskIndex !== -1}
                  />
                </CustomTableCell>
              )}
              {isRegularTask && (
                <CustomTableCell padding="none">
                  <MultipleSelect
                    className={classes.miniCellInput}
                    value={this.state[constants.taskStateType.add].week}
                    options={[1, 2, 3, 4, 5].map(w => ({ key: w.toString(), value: w }))}
                    onChange={this.changeTask.bind(this, constants.taskStateType.add, 'week')}
                    disabled={this.state.editingTaskIndex !== -1}
                  />
                </CustomTableCell>
              )}
              {isRegularTask && (
                <CustomTableCell padding="none">
                  <MultipleSelect
                    className={classes.miniCellInput}
                    value={this.state[constants.taskStateType.add].dayOfWeek}
                    options={[0, 1, 2, 3, 4, 5, 6].map(d => ({ key: constants.DAY_OF_WEEK_STR[d], value: d }))}
                    onChange={this.changeTask.bind(this, constants.taskStateType.add, 'dayOfWeek')}
                    disabled={this.state.editingTaskIndex !== -1}
                  />
                </CustomTableCell>
              )}
              <CustomTableCell style={{ textAlign: 'center' }} padding="none">
                <IconButton className={classes.actionIcon} color="default" onClick={this.addTask.bind(this)} disabled={this.state.editingTaskIndex !== -1}>
                  <Add style={{ fontSize: 16 }} />
                </IconButton>
              </CustomTableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }
}

TaskList.propTypes = {
  userId: PropTypes.string.isRequired,
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    uid: PropTypes.string.isRequired,
  })).isRequired,
  addTask: PropTypes.func.isRequired,
  editTask: PropTypes.func.isRequired,
  doTaskAction: PropTypes.func.isRequired,
  isRegularTask: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(TaskList);
