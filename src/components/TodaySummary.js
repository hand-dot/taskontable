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
          <TableCell padding="none">{Math.floor(((data.estimate.minute / 60) * 100)) / 100}h</TableCell>
          <TableCell padding="none">{data.estimate.task}タスク</TableCell>
        </TableRow>
        <TableRow>
          <TableCell padding="none">消化</TableCell>
          <TableCell padding="none">{Math.floor(((data.done.minute / 60) * 100)) / 100}h</TableCell>
          <TableCell padding="none">{data.done.task}タスク</TableCell>
        </TableRow>
        <TableRow>
          <TableCell padding="none">残</TableCell>
          <TableCell padding="none">{Math.floor((((data.estimate.minute - data.done.minute) / 60) * 100)) / 100}h</TableCell>
          <TableCell padding="none">{data.estimate.task - data.done.task}タスク</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

TodaySummary.propTypes = {
  data: PropTypes.shape({
    estimate: PropTypes.shape({
      minute: PropTypes.number.isRequired,
      task: PropTypes.number.isRequired,
    }),
    done: PropTypes.shape({
      minute: PropTypes.number.isRequired,
      task: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

export default withStyles(styles)(TodaySummary);
