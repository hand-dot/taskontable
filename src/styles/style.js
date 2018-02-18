import constants from '../constants';

export default {
  table: theme => ({
    root: {
      padding: 0,
      minHeight: 210,
      maxHeight: 420,
      overflowY: 'scroll',
    },
    actionIcon: {
      fontSize: 14,
      width: theme.breakpoints.values.sm < constants.APPWIDTH ? 45 : 14,
    },
    actionIcons: {
      margin: '0 auto',
    },
    cell: {
      border: '1px solid rgba(235, 235, 235, 1)',
      padding: '0 5px',
      fontSize: 11,
    },
    miniCell: {
      border: '1px solid rgba(235, 235, 235, 1)',
      padding: '0 3px',
      maxWidth: '2.7rem',
      fontSize: 11,
    },
    cellInput: {
      fontSize: 11,
    },
    taskRow: {
      animation: 'blink 1s',
    },
  }),
};
