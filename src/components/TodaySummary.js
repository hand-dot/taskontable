import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

function TodaySummary(props) {
  const { data } = props;

  return (

    <Grid container spacing={0}>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">見積</TableCell>
              <TableCell padding="none">{(data.estimateTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.estimateTasks.taskNum}タスク</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">実績</TableCell>
              <TableCell padding="none">{(data.actuallyTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.actuallyTasks.taskNum}タスク</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">消化</TableCell>
              <TableCell padding="none">{(data.doneTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.doneTasks.taskNum}タスク</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">残</TableCell>
              <TableCell padding="none">{(data.remainingTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.remainingTasks.taskNum}タスク</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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

export default TodaySummary;
