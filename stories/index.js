import React from 'react';
import moment from 'moment';
import { storiesOf, ReactiveVar } from '@storybook/react'; // eslint-disable-line
// import { action } from '@storybook/addon-actions';
import Clock from '../src/components/Clock';
import TimelineChart from '../src/components/TimelineChart';
import ActivityChart from '../src/components/ActivityChart';
import exampleTaskData from '../src/exampleDatas/exampleTaskData';
import constants from '../src/constants';
import util from '../src/util';

const activityChartTasks = [
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-10'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-11'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-12'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
];


// https://storybook.js.org/basics/guide-react/
storiesOf('DashBoad', module)
  .add('Clock', () => (<Clock title="Clock" time={{ hour: 0, minute: 0, second: 0 }} />))
  .add('TimelineChart', () => (<TimelineChart tableTasks={exampleTaskData.filter(tableTask => tableTask.startTime).map((tableTask) => {
    const task = { key: '見積' };
    task.start = moment(tableTask.startTime, constants.TIMEFMT).toDate();
    task.end = moment(tableTask.startTime, constants.TIMEFMT).add(tableTask.estimate || 0, 'minutes').toDate();
    task.title = tableTask.title || '無名タスク';
    return task;
  })}
  />))
  .add('ActivityChart', () => (<ActivityChart tableTasks={activityChartTasks} />));

