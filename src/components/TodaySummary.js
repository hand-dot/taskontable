import React from 'react';
import PropTypes from 'prop-types';
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
    <Table>
      <TableBody>
        <TableRow>
          <TableCell padding="none">見積</TableCell>
          <TableCell padding="none">{Math.floor(((data.estimateTasks.minute / 60) * 100)) / 100}h</TableCell>
          <TableCell padding="none">{data.estimateTasks.taskNum}タスク</TableCell>
        </TableRow>
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
        <TableRow>
          <TableCell padding="none">残</TableCell>
          <TableCell padding="none">{Math.floor(((data.remainingTasks.minute / 60) * 100)) / 100}h</TableCell>
          <TableCell padding="none">{data.remainingTasks.taskNum}タスク</TableCell>
        </TableRow>
      </TableBody>
    </Table>
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
