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
    cell: {
      border: '1px solid #CCC',
      padding: '0 5px',
      fontSize: 11,
    },
    miniCell: {
      border: '1px solid #CCC',
      padding: '0 3px',
      width: theme.breakpoints.values.sm < constants.APPWIDTH ? '6.4rem' : '3rem',
      fontSize: 11,
    },
    cellInput: {
      fontSize: 11,
    },
    taskRow: {
      animation: 'blink 0.5s',
    },
  }),
};
