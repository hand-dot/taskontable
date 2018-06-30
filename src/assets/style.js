import util from '../util';

export default {
  table: theme => ({
    root: {
      padding: 0,
    },
    actionIcon: {
      fontSize: 14,
      width: util.isMobile() ? 14 : 45,
      height: util.isMobile() ? 'inherit' : 45,
    },
    actionIcons: {
      margin: '0 auto',
    },
    cellInput: {
      padding: '0 3px',
      fontSize: 12,
    },
    miniCellInput: {
      fontSize: 12,
      width: util.isMobile() ? '3.5rem' : '6.4rem',
    },
    taskRow: {
      padding: theme.spacing.unit,
      animation: 'blink 0.5s',
      height: 20,
    },
  }),
};
