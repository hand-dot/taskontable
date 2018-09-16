import React from 'react';
import { storiesOf, ReactiveVar } from '@storybook/react'; // eslint-disable-line
// import { action } from '@storybook/addon-actions';
import Clock from '../src/components/Clock';
import HelpDialog from '../src/components/HelpDialog';
import TimelineChart from '../src/components/TimelineChart';
import ActivityChart from '../src/components/ActivityChart';
import exampleTaskData from '../src/exampleDatas/exampleTaskData';
import util from '../src/utils/util';
import tasksUtil from '../src/utils/tasksUtil';

const activityChartTasks = [
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-10'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  // 2018-06-11の歯抜け
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-12'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-13'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    // 実績をなくしてみる
    tableTask.startTime = '00:00'; // eslint-disable-line no-param-reassign
    tableTask.endTime = '00:00'; // eslint-disable-line no-param-reassign
    tableTask.date = '2018-06-14'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
  ...util.cloneDeep(exampleTaskData).map((tableTask) => {
    tableTask.date = '2018-06-15'; // eslint-disable-line no-param-reassign
    return tableTask;
  }),
];


// https://storybook.js.org/basics/guide-react/
storiesOf('DashBoad', module)
  .add('Clock', () => (<Clock title="Clock" time={{ hour: 0, minute: 0, second: 0 }} />))
  .add('HelpDialog', () => (<HelpDialog open onClose={() => {}} />))
  .add('TimelineChart', () => (
    <TimelineChart
      label="ラベル"
      tableTasks={tasksUtil.getEstimateTimelineChartTasks(exampleTaskData)}
      pointer
    />
  ))
  .add('TimelineChart(nodata)', () => (
    <TimelineChart
      label="ラベル"
      tableTasks={tasksUtil.getEstimateTimelineChartTasks([])}
      pointer
    />
  ))
  .add('ActivityChart', () => (<ActivityChart tableTasks={activityChartTasks} />));
