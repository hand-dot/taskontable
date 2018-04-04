import UAParser from 'ua-parser-js';
import SENTRY_URL from './configs/sentry';
import GA_ID from './configs/ga';

const parser = new UAParser();
const osName = parser.getOS().name;

const rgb = {
  RED: '255, 99, 132',
  YELLOW: '255, 205, 86',
  GREEN: '75, 192, 192',
  BLUE: '54, 162, 235',
  PURPLE: '153, 102, 255',
  GREY: '201, 203, 207',
};
export default {
  RELEASE: '0.0.0-beta',
  TITLE: 'Taskontable',
  SUPPORTEDBROWSERS: ['Chrome'],
  METAKEY: osName === 'Mac OS' ? '⌘' : 'ctrl',
  URL: 'https://taskontable.com',
  DEVURL1: 'http://localhost:3000',
  DEVURL2: 'http://192.168.0.104:3000', // lanの別端末で検証を行う場合に必要。
  GA_ID,
  SENTRY_URL,
  CHROME_DL_URL: 'https://www.google.co.jp/chrome/',
  CONTACT_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd12kJ8lJ79_669Ymzx8QyRksfZ0LvmwasK99Ual7HdUOvNVg/viewform',
  REPOSITORY_URL: 'https://github.com/hand-dot/taskchute-web',
  ROADMAP_URL: 'https://trello.com/b/fFhYhlCu/taskontable-roadmap',
  COMMUNITY_URL: 'https://join.slack.com/t/taskontable/shared_invite/enQtMzQwMDQ0MjcwOTE1LTZiODZjYmY4OTczNzJjZTU2NDM1NTlmODIyNDdlNTY3MGIzYzE0YTNjZjU0NmM2MzRhOGQ1ZTIyYTA3NmNiODE',
  HEADWAY_ACCOUNT: '7zwPXJ',
  CHROME_HELP_PERMISSION_URL: 'https://support.google.com/chrome/answer/114662',
  APPWIDTH: window.innerWidth < 1280 ? window.innerWidth : 1280,
  APPHEIGHT: window.innerHeight,
  REQEST_DELAY: 500,
  RENDER_DELAY: 500,
  HOT_MINROW: 20,
  shortcuts: {
    SAVE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.keyCode === 83,
    HOT_CURRENTTIME: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.key === ':',
    NEXTDATE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 190,
    PREVDATE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 188,
    TOGGLE_HELP: e => e.ctrlKey && e.shiftKey && e.keyCode === 191, // ヘルプだけはmacOSでクロームのヘルプがアプリのレベルで割り当てられていてctrlにしなければいけない
    TOGGLE_DASHBOAD: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.keyCode === 74,
  },
  menuItemKey: {
    CONTACT: 'contact',
    GIT: 'git',
    ROADMAP: 'roadmap',
    COMMUNITY: 'community',
  },
  taskPoolType: {
    HIGHPRIORITY: 'highPriorityTasks',
    LOWPRIORITY: 'lowPriorityTasks',
    REGULAR: 'regularTasks',
  },
  taskStateType: {
    add: 'add',
    edit: 'edit',
  },
  taskActionType: {
    ADD: 'add',
    EDIT: 'edit',
    MOVE_TABLE: 'moveTable',
    MOVE_POOL_HIGHPRIORITY: 'movePoolHighPriority',
    MOVE_POOL_LOWPRIORITY: 'movePoolLowPriority',
    REMOVE: 'remove',
    DOWN: 'down',
    UP: 'up',
    BOTTOM: 'bottom',
    TOP: 'top',
  },
  soundType: {
    start: 'START',
    end: 'END',
    snooz: 'SNOOZ',
  },
  scriptType: {
    IMPORTSCRIPT: 'importScript',
    EXPORTSCRIPT: 'exportScript',
  },
  DATEFMT: 'YYYY-MM-DD',
  TIMEFMT: 'HH:mm',
  INITIALDATE: '1970-01-01',
  DAY_OF_WEEK_STR: ['日', '月', '火', '水', '木', '金', '土'],
  brandColor: {
    base: {
      RED: `rgb(${rgb.RED})`,
      YELLOW: `rgb(${rgb.YELLOW})`,
      GREEN: `rgb(${rgb.GREEN})`,
      BLUE: `rgb(${rgb.BLUE})`,
      PURPLE: `rgb(${rgb.PURPLE})`,
      GREY: `rgb(${rgb.GREY})`,
    },
    light: {
      RED: `rgba(${rgb.RED},0.2)`,
      YELLOW: `rgba(${rgb.YELLOW},0.2)`,
      GREEN: `rgba(${rgb.GREEN},0.2)`,
      BLUE: `rgba(${rgb.BLUE},0.2)`,
      PURPLE: `rgba(${rgb.PURPLE},0.2)`,
      GREY: `rgba(${rgb.GREY},0.2)`,
    },
  },
  cellColor: {
    DONE: `rgba(${rgb.GREY},0.2)`,
    RESERVATION: `rgba(${rgb.GREEN},0.2)`,
    WARNING: `rgba(${rgb.YELLOW},0.2)`,
    RUNNING: `rgba(${rgb.BLUE},0.2)`,
    OUT: `rgba(${rgb.RED},0.2)`,
  },
};
