import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

import '../styles/Clock.css';


const styles = () => ({
});

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
    return (
      <div>
        <Typography gutterBottom type="subheading" align="center" title={this.props.caption}>
          {this.props.title}
        </Typography>
        <div className="circle">
          <div className="face">
            <div ref={(node) => { this.hour = node; }} className="hour" />
            <div ref={(node) => { this.minute = node; }} className="minute" />
            <div ref={(node) => { this.second = node; }} className="second" />
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
  time: PropTypes.object.isRequired,
};

export default withStyles(styles)(Clock);
