import moment from 'moment';
export default {
  userId: '',
  loading: true,
  isOpenLoginDialog: false,
  notifiable: true,
  date: moment().format('YYYY-MM-DD'),
  allTasks: [],
  estimateTasks: { minute: 0, taskNum: 0 },
  doneTasks: { minute: 0, taskNum: 0 },
  actuallyTasks: { minute: 0, taskNum: 0 },
  remainingTasks: { minute: 0, taskNum: 0 },
  currentTime: { hour: 0, minute: 0, second: 0 },
  endTime: { hour: 0, minute: 0, second: 0 },
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  categories: [],
  categoryInput: '',
};
