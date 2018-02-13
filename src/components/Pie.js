import React, { Component } from 'react';
import Chart from 'chart.js';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';
import constants from '../constants';

const styles = {
};
const backgroundColors = Object.values(constants.chartColors.background);
const borderColors = Object.values(constants.chartColors.border);
const charts = {};

class Pie extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ctxId: `ctx-${Date.now()}`,
      isNodata: false,
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    charts[this.state.ctxId] = new Chart(document.getElementById(this.state.ctxId).getContext('2d'), {
      type: 'pie',
      data: {
        datasets: [{
          data: [''],
        }],
        labels: [''],
      },
      options: {
        title: {
          display: true,
          text: this.props.title || '',
        },
        responsive: true,
        animation: false,
        legend: {
          display: true,
          position: 'left',
          labels: {
            fontSize: 10,
            padding: 5,
          },
        },
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!charts[this.state.ctxId]) return;
    if (Array.isArray(nextProps.data) && nextProps.data.length > 0) {
      const isNodata = nextProps.data.reduce((previousValue, currentValue) => previousValue + currentValue) === 0;
      this.setState({ isNodata });
    }
    charts[this.state.ctxId].data.labels = nextProps.labels.map(label => (label.length < 9 ? label || '' : `${label.substring(0, 7)}..`));
    const dummyArray = Array(nextProps.data.length).fill(1);
    charts[this.state.ctxId].data.datasets = [{
      data: nextProps.data,
      backgroundColor: dummyArray.map((data, index) => backgroundColors[index % backgroundColors.length]),
      borderColor: dummyArray.map((data, index) => borderColors[index % backgroundColors.length]),
      borderWidth: dummyArray,
    }];
    charts[this.state.ctxId].update();
  }

  render() {
    return (
      <div>
        <canvas id={this.state.ctxId} />
        {(() => {
          if (this.state.isNodata) {
            return (
              <Typography gutterBottom type="caption" align="center">
                no data
              </Typography>
            );
          }
          return null;
        })()}

      </div>
    );
  }
}

Pie.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(Pie);
