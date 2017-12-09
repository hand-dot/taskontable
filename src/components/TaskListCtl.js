import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
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
        <Typography type="caption" gutterBottom>
         *終了通知の予約を行うには見積を入力したタスクの開始時刻を入力してください。
        </Typography>
        <Typography type="caption" gutterBottom>
         *通知予約されたタスクの開始時刻に <i className="fa fa-bell-o fa-lg" /> が表示されます。(マウスホバーで予約時刻)
        </Typography>
        <Typography type="caption" gutterBottom>
        *開始時刻を削除、もしくは終了を入力すると終了通知の予約は削除されます。
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography type="caption" gutterBottom>
      *セル上で右クリックすると現在時刻の入力・行の追加・削除を行えます。
        </Typography>
        <Typography type="caption" gutterBottom>
      *行を選択しドラッグアンドドロップでタスクを入れ替えることができます。
        </Typography>
        <Typography type="caption" gutterBottom>
        *列ヘッダーにマウスホバーすると各列の説明を見ることができます。
        </Typography>
      </Grid>
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
            label={`開始したタスクの終了時刻通知${!('Notification' in window) ? '(ブラウザが未対応です。)' : ''}`}
          />
        </FormGroup>
      </Grid>
      <Grid item xs={6}>
        <div style={{ textAlign: 'right' }}>
          <Button raised onClick={addTask} color="default">
            <i className="fa fa-plus fa-lg" />
            　追加
          </Button>
          <Tooltip id="tooltip-top" title={`最終保存時刻 : ${(`00${lastSaveTime.hour}`).slice(-2)}:${(`00${lastSaveTime.minute}`).slice(-2)}`} placement="top">
            <Button raised onClick={saveHot} color="default">
              <i className="fa fa-floppy-o fa-lg" />
              　保存
            </Button>
          </Tooltip>
        </div>
      </Grid>
    </Grid>);
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
