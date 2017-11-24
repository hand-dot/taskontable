import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableRow } from 'material-ui/Table';

const styles = theme => ({
  table: {
    maxWidth: 700,
  },
});

function TodaySummary(props) {
  const { data, classes } = props;

  return (
    <Table className={classes.table}>
      <TableBody>
        <TableRow>
          <TableCell padding="none">見積</TableCell>
          <TableCell padding="none">{data.estimate.hour}h</TableCell>
          <TableCell padding="none">{data.estimate.task}タスク</TableCell>
        </TableRow>
        <TableRow>
          <TableCell padding="none">消化</TableCell>
          <TableCell padding="none">{data.done.hour}h</TableCell>
          <TableCell padding="none">{data.done.task}タスク</TableCell>
        </TableRow>
        <TableRow>
          <TableCell padding="none">残</TableCell>
          <TableCell padding="none">{data.estimate.hour - data.done.hour}h</TableCell>
          <TableCell padding="none">{data.estimate.task - data.done.task}タスク</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

TodaySummary.propTypes = {
  data: PropTypes.object.isRequired,
};

export default withStyles(styles)(TodaySummary);
