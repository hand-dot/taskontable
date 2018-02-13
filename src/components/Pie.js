import React, { Component } from 'react';
import Chart from 'chart.js';
import PropTypes from 'prop-types';
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
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    charts[this.state.ctxId] = new Chart(document.getElementById(this.state.ctxId).getContext('2d'), {
      type: 'horizontalBar',
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
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            stacked: true,
          }],
          yAxes: [{
            stacked: true,
          }],
        },
        animation: false,
        legend: {
          display: true,
          labels: {
            fontSize: 10,
            padding: 5,
          },
        },
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!charts[this.state.ctxId] || !Array.isArray(nextProps.data)) return;
    charts[this.state.ctxId].data.datasets = nextProps.data.map((data, index) => ({
      label: (nextProps.labels[index].length < 9 ? nextProps.labels[index] || '' : `${nextProps.labels[index].substring(0, 7)}..`),
      data: [data],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      borderColor: borderColors[index % backgroundColors.length],
      borderWidth: 1,
      fill: false,
    }));
    charts[this.state.ctxId].update();
  }

  render() {
    return (
      <canvas id={this.state.ctxId} />
    );
  }
}

Pie.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  labels: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default withStyles(styles)(Pie);
