import React from 'react';
import moment from 'moment';
import { storiesOf, ReactiveVar } from '@storybook/react'; // eslint-disable-line
// import { action } from '@storybook/addon-actions';
import Clock from '../src/components/Clock';
import TimelineChart from '../src/components/TimelineChart';
import constants from '../src/constants';

// https://storybook.js.org/basics/guide-react/
storiesOf('DashBoad', module)
  .add('Clock', () => (<Clock
    title={'Clock'}
    time={{
      hour: 0,
      minute: 0,
      second: 0,
    }}
  />))
  .add('TimelineChart', () => (<TimelineChart tableTasks={
    [
      {
        key: 'test',
        title: 'test1',
        start: moment('01:00', constants.TIMEFMT).toDate(),
        end: moment('05:00', constants.TIMEFMT).toDate(),
      },
      {
        key: 'test',
        title: 'test2',
        start: moment('06:45', constants.TIMEFMT).toDate(),
        end: moment('07:00', constants.TIMEFMT).toDate(),
      },
      {
        key: 'test',
        title: 'test3',
        start: moment('10:00', constants.TIMEFMT).toDate(),
        end: moment('11:00', constants.TIMEFMT).toDate(),
      },
      {
        key: 'test',
        title: 'test4',
        start: moment('11:30', constants.TIMEFMT).toDate(),
        end: moment('11:45', constants.TIMEFMT).toDate(),
      },
      {
        key: 'test',
        title: 'test5',
        start: moment('13:00', constants.TIMEFMT).toDate(),
        end: moment('16:00', constants.TIMEFMT).toDate(),
      },
      {
        key: 'test',
        title: 'test6',
        start: moment('15:30', constants.TIMEFMT).toDate(),
        end: moment('19:00', constants.TIMEFMT).toDate(),
      },
    ]
  }
  />));

