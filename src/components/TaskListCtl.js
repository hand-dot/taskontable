import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Switch from 'material-ui/Switch';
import Tooltip from 'material-ui/Tooltip';
import Grid from 'material-ui/Grid';
import { FormControlLabel, FormGroup } from 'material-ui/Form';

function addTask() {
  if (window.hot) {
    window.hot.alter('insert_row');
  }
}

function TaskListCtl(props) {
  const { lastSaveTime, saveHot, notifiable, toggleNotifiable } = props;
  return (
    <Grid container spacing={5}>
      <Grid item xs={6}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                disabled={!('Notification' in window)}
                checked={notifiable}
                onChange={toggleNotifiable}
              />
            }
            label={`終了時刻通知${!('Notification' in window) ? '(ブラウザが未対応です。)' : ''}`}
          />
        </FormGroup>
      </Grid>
      <Grid item xs={6}>
        <div style={{ textAlign: 'right' }}>
          <Button raised onClick={addTask} color="default">
            <i className="fa fa-plus fa-lg" />
            　追加
          </Button>
          <Tooltip title={`最終保存時刻 : ${(`00${lastSaveTime.hour}`).slice(-2)}:${(`00${lastSaveTime.minute}`).slice(-2)}`} placement="top">
            <Button raised onClick={saveHot} color="default">
              <i className="fa fa-floppy-o fa-lg" />
              　保存
            </Button>
          </Tooltip>
        </div>
      </Grid>
    </Grid>
  );
}

TaskListCtl.propTypes = {
  lastSaveTime: PropTypes.shape({
    hour: PropTypes.number.isRequired,
    minute: PropTypes.number.isRequired,
    second: PropTypes.number.isRequired,
  }).isRequired,
  saveHot: PropTypes.func.isRequired,
  notifiable: PropTypes.bool.isRequired,
  toggleNotifiable: PropTypes.func.isRequired,

};

export default TaskListCtl;
