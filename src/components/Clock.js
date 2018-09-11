import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  circle: {
    width: 75,
    height: 75,
    margin: '0 auto',
    position: 'relative',
    border: '1px solid #888',
    borderRadius: '50%',
  },
  'face:after': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 8,
    height: 8,
    margin: '-4px 0 0 -4px',
    background: '#888',
    borderRadius: 4,
    content: '',
    display: 'block',
  },
  hour: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: '50%',
    left: '50%',
    margin: '-1px 0 -1px -25%',
    padding: '1px 0 1px 25%',
    background: '#888',
    transformOrigin: '100% 50%',
    borderRadius: '2px 0 0 2px',
  },
  minute: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: '50%',
    left: '50%',
    margin: '-40% -1px 0',
    padding: '40% 1px 0',
    background: '#888',
    transformOrigin: '50% 100%',
    borderRadius: '2px 2px 0 0',
  },
  second: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: '50%',
    left: '50%',
    margin: '-40% -1px 0 0',
    padding: '40% 1px 0',
    background: '#888',
    transformOrigin: '50% 100%',
  },
};

const getHourRotate = (hour, minute) => `rotate(${((hour % 12) / 12) * 360 + 90 + minute / 12}deg)`;
const getMinuteRotate = (minute, second) => `rotate(${minute * 6 + second / 60}deg)`;
const getSecondRotate = second => `rotate(${second * 6}deg)`;

class Clock extends Component {
  constructor(props) {
    super(props);
    this.timerId = '';
    this.state = {
      stateMoment: moment(),
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const { stateMoment } = this.state;
    const $hour = this.hour;
    const $minute = this.minute;
    const $second = this.second;
    const timedUpdate = () => {
      const newMoment = stateMoment.add(1, 'seconds');
      const hour = newMoment.hour();
      const minute = newMoment.minute();
      const second = newMoment.second();
      $hour.style.transform = getHourRotate(hour, minute);
      $minute.style.transform = getMinuteRotate(minute, second);
      $second.style.transform = getSecondRotate(second);
      this.setState({
        stateMoment: newMoment,
      });
      this.timerId = setTimeout(timedUpdate, 1000);
    };
    timedUpdate();
  }

  componentWillReceiveProps(nextProps) {
    const myMoment = moment();
    myMoment.hour(nextProps.time.hour);
    myMoment.minute(nextProps.time.minute);
    myMoment.second(nextProps.time.second);
    this.setState({
      stateMoment: myMoment,
    });
  }

  componentWillUnmount() {
    clearTimeout(this.timerId);
  }

  render() {
    const { stateMoment } = this.state;
    const { classes, title } = this.props;
    return (
      <div>
        <Typography variant="caption" align="center">
          {title}
        </Typography>
        <div className={classes.circle}>
          <div className={classes.face}>
            <div ref={(node) => { this.hour = node; }} className={classes.hour} />
            <div ref={(node) => { this.minute = node; }} className={classes.minute} />
            <div ref={(node) => { this.second = node; }} className={classes.second} />
          </div>
        </div>
        <Typography gutterBottom variant="body1" align="center">
          {`${(`00${stateMoment.hour()}`).slice(-2)}:${(`00${stateMoment.minute()}`).slice(-2)}`}
        </Typography>
      </div>
    );
  }
}

Clock.propTypes = {
  title: PropTypes.string.isRequired,
  time: PropTypes.shape({
    hour: PropTypes.number.isRequired,
    minute: PropTypes.number.isRequired,
    second: PropTypes.number.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(Clock);
