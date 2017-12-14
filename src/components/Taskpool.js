import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import ExpansionPanel, {
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from 'material-ui/ExpansionPanel';

import TaskList from './TaskList';

const styles = {
  root: {
    width: '100%',
    position: 'relative',
    overflow: 'auto',
    maxHeight: 170,
  },
};

function Taskpool(props) {
  const { isOpenTaskpool, toggleTaskpool } = props;
  const data1 = [
    { title: '燃えるゴミ出し', memo: '３つくらい玄関にある', estimate: 5 },
    { title: '朝食', memo: 'ヨーグルトを食べてはいけない', estimate: 20 },
    { title: '出勤', memo: '', estimate: 60 },
    { title: 'メールチェック', memo: '', estimate: 10 },
    { title: '日報', memo: '', estimate: 10 },
  ];
  const data2 = [
    { title: 'フライパン捨てる', memo: 'ベランダにある', estimate: 0 },
    { title: 'スイフトスポーツの試乗申し込み', memo: '', estimate: 0 },
    { title: 'ジブリ美術館にいく', memo: '申し込みの日にちがあるらしい', estimate: 0 },    
  ];
  return (
    <ExpansionPanel expanded={isOpenTaskpool} onChange={toggleTaskpool}>
      <ExpansionPanelSummary expandIcon={<i className="fa fa-angle-down fa-lg" />}>
        <i className="fa fa-tasks fa-lg" />
        <Typography>　タスクプール</Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Grid item xs={6}>
          <Typography gutterBottom type="title">
            すぐにやる
          </Typography>
          <TaskList datas={data1} />
        </Grid>
        <Grid item xs={6}>
          <Typography gutterBottom type="title">
          いつかやる
          </Typography>
          <TaskList datas={data2} />          
        </Grid>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
}

Taskpool.propTypes = {
  isOpenTaskpool: PropTypes.bool.isRequired,
  toggleTaskpool: PropTypes.func.isRequired,
};

export default withStyles(styles)(Taskpool);
