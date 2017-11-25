import React, { Component } from 'react';
import moment from 'moment';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import '../styles/Clock.css';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
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
        <div className="hero-circle">
          <div className="hero-face">
            <div id="hour" className="hero-hour" />
            <div id="minute" className="hero-minute" />
            <div id="second" className="hero-second" />
          </div>
        </div>
        <Typography type="display2" align="center">{`${('00' + this.state.hour).slice(-2) }:${ ('00' + this.state.minute).slice(-2)}`}</Typography>
      </div>
    );
  }
}

export default withStyles(styles)(Clock);
