import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const styles = {
  circle: {
    width: 80,
    height: 80,
    margin: '0 auto',
    position: 'relative',
    border: '4px solid #888',
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
    margin: '-2px 0 -2px -25%',
    padding: '2px 0 2px 25%',
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
    margin: '-40% -2px 0',
    padding: '40% 2px 0',
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
    this.state = {
      moment: moment(),
    };
  }

  componentWillMount() {
    const currentMoment = moment();
    this.setState({
      currentTime: {
        hour: currentMoment.hour(),
        minute: currentMoment.minute(),
        second: currentMoment.second() },
    });
  }

  componentDidMount() {
    const $hour = this.hour;
    const $minute = this.minute;
    const $second = this.second;
    const timedUpdate = () => {
      this.setState({
        moment: this.state.moment.add(1, 'seconds'),
      });
      const hour = this.state.moment.hour();
      const minute = this.state.moment.minute();
      const second = this.state.moment.second();
      $hour.style.transform = getHourRotate(hour, minute);
      $minute.style.transform = getMinuteRotate(minute, second);
      $second.style.transform = getSecondRotate(second);
      setTimeout(timedUpdate, 1000);
    };
    timedUpdate();
  }

  componentWillReceiveProps(nextProps) {
    const myMoment = moment();
    myMoment.hour(nextProps.time.hour);
    myMoment.minute(nextProps.time.minute);
    myMoment.second(nextProps.time.second);
    this.setState({
      moment: myMoment,
    });
  }

  render() {
    const { classes, caption, title } = this.props;
    return (
      <div>
        <Typography gutterBottom type="caption" align="center" title={caption}>
          {title}
        </Typography>
        <div className={classes.circle}>
          <div className={classes.face}>
            <div ref={(node) => { this.hour = node; }} className={classes.hour} />
            <div ref={(node) => { this.minute = node; }} className={classes.minute} />
            <div ref={(node) => { this.second = node; }} className={classes.second} />
          </div>
        </div>
        <Typography gutterBottom type="title" align="center">{`${(`00${this.state.moment.hour()}`).slice(-2)}:${(`00${this.state.moment.minute()}`).slice(-2)}`}</Typography>
      </div>
    );
  }
}

Clock.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string.isRequired,
  time: PropTypes.shape({
    hour: PropTypes.number.isRequired,
    minute: PropTypes.number.isRequired,
    second: PropTypes.number.isRequired,
  }).isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Clock);
