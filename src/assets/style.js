import util from '../utils/util';

export default {
  table: theme => ({
    root: {
      padding: 0,
    },
    actionIcon: {
      fontSize: 14,
      width: util.isMobile() ? 14 : 40,
      height: util.isMobile() ? 'inherit' : 40,
    },
    actionIcons: {
      margin: '0 auto',
    },
    cellInput: {
      padding: '0 3px',
      fontSize: 10,
      width: util.isMobile() ? '5.5rem' : null,
    },
    miniCellInput: {
      fontSize: 10,
      width: util.isMobile() ? '3rem' : '6.5rem',
    },
    taskRow: {
      padding: theme.spacing.unit,
      animation: 'blink 0.5s',
      height: 20,
    },
  }),
};
