import UAParser from 'ua-parser-js';
import SENTRY_URL from './configs/sentry';
import SENDGRID_API_KEY from './configs/sendgrid';
import FCM_KEY from './configs/cloudmessaging';
import GA_ID from './configs/ga';
import i18n from './i18n';

const parser = new UAParser();
const osName = parser.getOS().name;

const rgb = {
  SKIN: '252, 248, 243',
  RED: '255, 99, 132',
  YELLOW: '255, 205, 86',
  GREEN: '75, 192, 192',
  BLUE: '54, 162, 235',
  PURPLE: '153, 102, 255',
  GREY: '201, 203, 207',
};
export default {
  APP_VERSION: '0.0.3',
  API_VERSION: process.env.NODE_ENV === 'development' ? 'development' : 'v0',
  BMC_ID: 'handdot',
  YOUTUBE_MOVIE_ID: 'QwCtcFsx15g',
  CHROME_EXTENTION_ID: 'almilenhamndbeaajhfpmiffjhilkgfi',
  TITLE: 'Taskontable',
  EMAIL: 'info@taskontable.com',
  SUPPORTEDBROWSERS: ['Chrome'],
  METAKEY: osName === 'Mac OS' ? '⌘' : 'ctrl',
  URL: 'https://taskontable.com',
  DEMO_URL: 'https://taskontable.com/demo',
  DEVURL1: 'http://localhost:3000',
  DEVURL2: 'http://192.168.0.104:3000', // lanの別端末で検証を行う場合に必要。
  GA_ID,
  SENTRY_URL,
  SENDGRID_API_KEY,
  FCM_KEY,
  SUBSCRIBE_URL: 'https://taskontable.us18.list-manage.com/subscribe/post?u=1aa080a163a45466467898e8e&amp;id=ad56aad382',
  CHROME_DL_URL: 'https://www.google.co.jp/chrome/',
  TWITTER_URL: 'https://twitter.com/taskontable',
  CONTACT_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSd12kJ8lJ79_669Ymzx8QyRksfZ0LvmwasK99Ual7HdUOvNVg/viewform',
  REPOSITORY_URL: 'https://github.com/hand-dot/taskontable',
  ROADMAP_URL: 'https://trello.com/b/fFhYhlCu/taskontable-roadmap',
  PRESSKIT_URL: 'https://firebasestorage.googleapis.com/v0/b/taskontable.appspot.com/o/presskit.zip?alt=media&token=12b49590-8ce2-4f72-9082-488ab28e4bf0',
  BLOG_URL: 'https://medium.com/@taskontable',
  COMMUNITY_URL: 'https://join.slack.com/t/taskontable/shared_invite/enQtMzQwMDQ0MjcwOTE1LTZiODZjYmY4OTczNzJjZTU2NDM1NTlmODIyNDdlNTY3MGIzYzE0YTNjZjU0NmM2MzRhOGQ1ZTIyYTA3NmNiODE',
  HEADWAY_ACCOUNT: '7zwPXJ',
  CHROME_HELP_PERMISSION_URL: 'https://support.google.com/chrome/answer/114662',
  SIDEBAR_WIDTH: 240,
  REQEST_DELAY_FAST: 100,
  REQEST_DELAY_SLOW: 500,
  RENDER_DELAY: 150,
  HOT_MINROW: 20,
  authType: {
    GOOGLE: 'google',
    EMAIL_AND_PASSWORD: 'emailAndPassword',
  },
  loginProviderId: {
    PASSWORD: 'password',
    GOOGLE: 'google.com',
  },
  shortcuts: {
    SAVE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.keyCode === 83,
    HOT_CURRENTTIME: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && (e.key === ':' || e.key === ';'),
    NEXTDATE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 190,
    PREVDATE: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 188,
    NEXTTAB: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 221,
    PREVTAB: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && e.keyCode === 219,
    TOGGLE_HELP: e => e.ctrlKey && e.shiftKey && e.keyCode === 191, // ヘルプだけはmacOSでクロームのヘルプがアプリのレベルで割り当てられていてctrlにしなければいけない
    TOGGLE_DASHBOAD: e => (osName === 'Mac OS' ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.keyCode === 74,
  },
  menuItemKey: {
    CONTACT: 'contact',
    GIT: 'git',
    ROADMAP: 'roadmap',
    BLOG: 'blog',
    COMMUNITY: 'community',
  },
  worksheetDisclosureRange: {
    PRIVATE: 'private',
    PUBLIC: 'public',
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
  scriptType: {
    IMPORTSCRIPT: 'importScript',
    EXPORTSCRIPT: 'exportScript',
  },
  handleUserType: {
    MEMBER: 'member',
    INVITED: 'invited',
  },
  DATEFMT: 'YYYY-MM-DD',
  TIMEFMT: 'HH:mm',
  INITIALDATE: '1970-01-01',
  DAY_OF_WEEK_STR: [
    i18n.t('common.days.sun'),
    i18n.t('common.days.mon'),
    i18n.t('common.days.tue'),
    i18n.t('common.days.wed'),
    i18n.t('common.days.thurs'),
    i18n.t('common.days.fri'),
    i18n.t('common.days.sat'),
  ],
  brandColor: {
    base: {
      SKIN: `rgb(${rgb.SKIN})`,
      RED: `rgb(${rgb.RED})`,
      YELLOW: `rgb(${rgb.YELLOW})`,
      GREEN: `rgb(${rgb.GREEN})`,
      BLUE: `rgb(${rgb.BLUE})`,
      PURPLE: `rgb(${rgb.PURPLE})`,
      GREY: `rgb(${rgb.GREY})`,
    },
    light: {
      SKIN: `rgba(${rgb.SKIN},0.2)`,
      RED: `rgba(${rgb.RED},0.2)`,
      YELLOW: `rgba(${rgb.YELLOW},0.2)`,
      GREEN: `rgba(${rgb.GREEN},0.2)`,
      BLUE: `rgba(${rgb.BLUE},0.2)`,
      PURPLE: `rgba(${rgb.PURPLE},0.2)`,
      GREY: `rgba(${rgb.GREY},0.2)`,
    },
  },
  cellColor: {
    DONE: `rgba(${rgb.GREY}, 0.2)`,
    RESERVATION: `rgba(${rgb.GREEN}, 0.2)`,
    WARNING: `rgba(${rgb.YELLOW}, 0.2)`,
    RUNNING: `rgba(${rgb.BLUE}, 0.2)`,
    OUT: `rgba(${rgb.RED}, 0.2)`,
  },
  messageType: {
    ERROR: 'error',
    SUCCESS: 'success',
  },
};
