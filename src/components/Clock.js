import React, { Component } from 'react';
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
      second: '',
      minute: '',
      hour: '',
    };
  }

  componentWillMount() {
    this.setState({
      second: this.props.moment.seconds(),
      minute: this.props.moment.minutes(),
      hour: this.props.moment.hours(),
    });
  }

  componentDidMount() {
    const $hour = this.hour;
    const $minute = this.minute;
    const $second = this.second;

    $hour.style.transform = getHourRotate(this.state.hour, this.state.minute);
    $minute.style.transform = getMinuteRotate(this.state.minute, this.state.second);
    $second.style.transform = getSecondRotate(this.state.second);

    if (this.props.updateFlg) {
      const timedUpdate = () => {
        this.props.moment.add(1, 'seconds');
        const second = this.props.moment.seconds();
        const minute = this.props.moment.minutes();
        const hour = this.props.moment.hours();
        this.setState({
          second,
          minute,
          hour,
        });
        $hour.style.transform = getHourRotate(hour, minute);
        $minute.style.transform = getMinuteRotate(minute, second);
        $second.style.transform = getSecondRotate(second);
        setTimeout(timedUpdate, 1000);
      };
      timedUpdate();
    }
  }

  componentWillReceiveProps(nextProps) {
    // 更新フラグが立っていればここでstateの設定はしない
    if (this.props.updateFlg) return;

    this.setState({
      minute: nextProps.moment.minutes(),
      hour: nextProps.moment.hours(),
    });

    const $hour = this.hour;
    const $minute = this.minute;
    const $second = this.second;

    $hour.style.transform = getHourRotate(nextProps.moment.hours(), nextProps.moment.minutes());
    $minute.style.transform = getMinuteRotate(nextProps.moment.minutes(), nextProps.moment.seconds());
    $second.style.transform = getSecondRotate(0);
  }

  render() {
    return (
      <div>
        <Typography gutterBottom type="subheading" align="center">
          {this.props.title}
        </Typography>
        <div className="circle">
          <div className="face">
            <div ref={(node) => { this.hour = node; }} className="hour" />
            <div ref={(node) => { this.minute = node; }} className="minute" />
            <div ref={(node) => { this.second = node; }} className="second" />
          </div>
        </div>
        <Typography gutterBottom type="title" align="center">{`${(`00${this.state.hour}`).slice(-2)}:${(`00${this.state.minute}`).slice(-2)}`}</Typography>
        <Typography type="caption" align="center">
          {this.props.caption}
        </Typography>
      </div>
    );
  }
}

Clock.propTypes = {
  title: PropTypes.string.isRequired,
  caption: PropTypes.string,
  moment: PropTypes.object.isRequired,
  updateFlg: PropTypes.bool.isRequired,
};

export default withStyles(styles)(Clock);
