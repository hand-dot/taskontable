import constants from '../constants';

export default {
  table: theme => ({
    root: {
      padding: 0,
    },
    actionIcon: {
      fontSize: 14,
      width: theme.breakpoints.values.sm < constants.APPWIDTH ? 45 : 14,
    },
    actionIcons: {
      margin: '0 auto',
    },
    tableHeader: {
      backgroundColor: '#f3f3f3',
      padding: 0,
    },
    cellInput: {
      fontSize: 11,
    },
    miniCellInput: {
      fontSize: 11,
      width: theme.breakpoints.values.sm < constants.APPWIDTH ? '6.4rem' : '3rem',
    },
    taskRow: {
      animation: 'blink 0.5s',
    },
  }),
};
