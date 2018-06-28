import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import i18n from '../i18n';

function TodaySummary(props) {
  const { data } = props;

  return (

    <Grid container spacing={0}>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">{i18n.t('dashBoad.estimate')}</TableCell>
              <TableCell padding="none">{(data.estimateTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.estimateTasks.taskNum}{i18n.t('common.tasks')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{i18n.t('dashBoad.actually')}</TableCell>
              <TableCell padding="none">{(data.actuallyTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.actuallyTasks.taskNum}{i18n.t('common.tasks')}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
      <Grid item xs={6}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell padding="none">{i18n.t('dashBoad.done')}</TableCell>
              <TableCell padding="none">{(data.doneTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.doneTasks.taskNum}{i18n.t('common.tasks')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell padding="none">{i18n.t('dashBoad.remaining')}</TableCell>
              <TableCell padding="none">{(data.remainingTasks.minute / 60).toFixed(1)}h</TableCell>
              <TableCell padding="none">{data.remainingTasks.taskNum}{i18n.t('common.tasks')}</TableCell>
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
