import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import constants from './constants';
import { getEmptyHotData } from './hot';

const initialState = {
  user: { displayName: '', photoURL: '', uid: '' },
  loading: true,
  notifiable: true,
  saveable: false,
  isOpenDashboard: false,
  isOpenTaskPool: false,
  isOpenHelpDialog: false,
  isOpenProcessingDialog: false,
  date: moment().format(constants.DATEFMT),
  lastSaveTime: { hour: 0, minute: 0, second: 0 },
  tableTasks: getEmptyHotData(),
  poolTasks: {
    highPriorityTasks: [],
    lowPriorityTasks: [],
    regularTasks: [],
  },
};

export default {
  getState: () => cloneDeep(initialState),
};

