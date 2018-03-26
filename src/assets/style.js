import util from '../util';

export default {
  // table: theme => ({
  table: {
    root: {
      padding: 0,
    },
    actionIcon: {
      fontSize: 14,
      width: util.isMobile() ? 14 : 45,
    },
    actionIcons: {
      margin: '0 auto',
    },
    cellInput: {
      fontSize: 11,
    },
    miniCellInput: {
      fontSize: 11,
      width: util.isMobile() ? '3rem' : '6.4rem',
    },
    taskRow: {
      animation: 'blink 0.5s',
    },
  },
};
