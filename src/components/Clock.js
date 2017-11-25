import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const clockHands = {
  width: 0,
  height: 0,
  position: 'absolute',
  top: '50%',
  left: '50%',
  transformOrigin: '50% 100%',
  background: '#000',
};

const styles = () => ({
  circle: {
    width: 130,
    height: 130,
    margin: '0 auto',
    position: 'relative',
    border: '8px solid #000',
    borderRadius: '50%',
  },
  face: {
    '&:after': {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 12,
      height: 12,
      margin: '-6px 0 0 -6px',
      background: '#000',
      borderRadius: 6,
      content: '""',
      display: 'block',
    },
  },
  hour: Object.assign({
    padding: '4px 0 4px 25%',
    borderRadius: '4px 0 0 4px',
  }, clockHands),
  minute: Object.assign({
    margin: '-40% -3px 0',
    padding: '40% 3px 0',
    borderRadius: '3px 3px 0 0',
  }, clockHands),
  second: Object.assign({
    margin: '-40% -1px 0 0',
    padding: '40% 1px 0',
  }, clockHands),
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

  componentDidMount() {
    const timedUpdate = () => {
      const now = moment();
      const second = now.seconds();
      const minute = now.minutes();
      const hour = now.hours();
      this.setState({
        second,
        minute,
        hour,
      });

      document.getElementById('hour').style.transform = `rotate(${((hour % 12) / 12) * 360 + 90 + minute / 12}deg)`;
      document.getElementById('minute').style.transform = `rotate(${minute * 6 + second / 60}deg)`;
      document.getElementById('second').style.transform = `rotate(${second * 6}deg)`;
      setTimeout(timedUpdate, 1000);
    };

    timedUpdate();
  }

  render() {
    return (
      <div>
        <Typography gutterBottom type="subheading">
                現在時刻
        </Typography>
        <div className={this.props.classes.circle}>
          <div className={this.props.classes.face}>
            <div id="hour" className={this.props.classes.hour} />
            <div id="minute" className={this.props.classes.minute} />
            <div id="second" className={this.props.classes.second} />
          </div>
        </div>
        <Typography type="display2" align="center">{`${(`00${this.state.hour}`).slice(-2)}:${(`00${this.state.minute}`).slice(-2)}`}</Typography>
      </div>
    );
  }
}

Clock.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Clock);
