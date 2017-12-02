import React from 'react';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';

const styles = () => ({
  table: {
    maxWidth: 700,
  },
});

function TodaySummary(props) {
  const { data } = props;

  return (

    <Grid container spacing={40}>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">見積*</TableCell>
              <TableCell padding="none">{Math.floor(((data.estimateTasks.minute / 60) * 100)) / 100}h</TableCell>
              <TableCell padding="none">{data.estimateTasks.taskNum}タスク</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">残*</TableCell>
              <TableCell padding="none">{Math.floor(((data.remainingTasks.minute / 60) * 100)) / 100}h</TableCell>
              <TableCell padding="none">{data.remainingTasks.taskNum}タスク</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography type="caption" gutterBottom>
                  *見積は全タスクの見積の合計
        </Typography>
        <Typography type="caption" gutterBottom>
                  *残は残タスクの見積の合計
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">消化*</TableCell>
              <TableCell padding="none">{Math.floor(((data.doneTasks.minute / 60) * 100)) / 100}h</TableCell>
              <TableCell padding="none">{data.doneTasks.taskNum}タスク</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">消費*</TableCell>
              <TableCell padding="none">{Math.floor(((data.actuallyTasks.minute / 60) * 100)) / 100}h</TableCell>
              <TableCell padding="none">{data.actuallyTasks.taskNum}タスク</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography type="caption" gutterBottom>
                  *消化は済タスクの見積の合計
        </Typography>
        <Typography type="caption" gutterBottom>
                  *消費は済タスクの実績の合計
        </Typography>
      </Grid>
    </Grid>
  );
}

TodaySummary.propTypes = {
  data: PropTypes.shape({
    estimateTasks: PropTypes.shape({
      minute: PropTypes.number.isRequired,
      taskNum: PropTypes.number.isRequired,
    }),
    actuallyTasks: PropTypes.shape({
      minute: PropTypes.number.isRequired,
      taskNum: PropTypes.number.isRequired,
    }),
    remainingTasks: PropTypes.shape({
      minute: PropTypes.number.isRequired,
      taskNum: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

export default withStyles(styles)(TodaySummary);
