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
class TaskPool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  handleChange(event, value) {
    this.setState({ value });
  }

  render() {
    const { isOpenTaskPool, toggleTaskPool } = this.props;
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
                  value={this.state.value}
                  onChange={this.handleChange.bind(this)}
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
                if (this.state.value === 0) {
                  return <TaskList datas={data1} />;
                } else if (this.state.value === 1) {
                  return <TaskList datas={data2} />;
                }
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
};

export default withStyles(styles)(TaskPool);
