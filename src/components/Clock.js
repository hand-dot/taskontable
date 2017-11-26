import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import '../styles/Clock.css';


const styles = () => ({
});

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

    $hour.style.transform = `rotate(${((this.state.hour % 12) / 12) * 360 + 90 + this.state.minute / 12}deg)`;
    $minute.style.transform = `rotate(${this.state.minute * 6 + this.state.second / 60}deg)`;
    $second.style.transform = `rotate(${this.state.second * 6}deg)`;

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
      $hour.style.transform = `rotate(${((hour % 12) / 12) * 360 + 90 + minute / 12}deg)`;
      $minute.style.transform = `rotate(${minute * 6 + second / 60}deg)`;
      $second.style.transform = `rotate(${second * 6}deg)`;
      setTimeout(timedUpdate, 1000);
    };
    if (this.props.updateFlg) {
      timedUpdate();
    }
  }

  render() {
    return (
      <div>
        <Typography gutterBottom type="subheading">
          {this.props.title}
        </Typography>
        <div className="circle">
          <div className="face">
            <div ref={node => this.hour = node} className="hour" />
            <div ref={node => this.minute = node} className="minute" />
            <div ref={node => this.second = node} className="second" />
          </div>
        </div>
        <Typography type="title" align="center">{`${(`00${this.state.hour}`).slice(-2)}:${(`00${this.state.minute}`).slice(-2)}`}</Typography>
      </div>
    );
  }
}

Clock.propTypes = {
  title: PropTypes.string.isRequired,
  moment: PropTypes.object.isRequired,
  updateFlg: PropTypes.bool.isRequired,
};

export default withStyles(styles)(Clock);
