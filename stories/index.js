import React from 'react';
import moment from 'moment';
import { storiesOf } from '@storybook/react'; // eslint-disable-line
// import { action } from '@storybook/addon-actions';
import Clock from '../src/components/Clock';
import constants from '../src/constants';

// https://storybook.js.org/basics/guide-react/
storiesOf('Button', module)
  .add('now clock', () => (<Clock title={'現在時刻'} caption="" time={moment().format(constants.TIMEFMT)} />
  ));
