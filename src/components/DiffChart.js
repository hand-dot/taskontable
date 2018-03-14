import React, { Component } from 'react';
import Chart from 'chart.js';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import constants from '../constants';
import util from '../util';

const styles = {
};
const backgroundColors = Object.values(constants.brandColor.light);
const borderColors = Object.values(constants.brandColor.base);
const charts = {};

class DiffChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ctxId: `ctx-${this.props.title}-${Date.now()}`,
      data: [],
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const conf = {
      type: 'horizontalBar',
      data: {
        labels: this.props.chartLabels,
        datasets: [{
          data: [''],
        }],
      },
      options: {
        title: {
          display: true,
          text: this.props.title || '',
        },
        tooltips: {
          mode: 'point',
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            stacked: true,
            ticks: {
              beginAtZero: true,
              callback: value => value.toFixed(1) + this.props.unit,
            },
          }],
          yAxes: [{
            stacked: true,
          }],
        },
        legend: {
          position: 'right',
          labels: {
            boxWidth: 10,
            fontSize: 10,
            padding: 5,
          },
        },
      },
    };
    if (this.props.theme.breakpoints.values.sm > constants.APPWIDTH) {
      conf.options.animation = null;
      conf.options.legend.display = false;
    }
    charts[this.state.ctxId] = new Chart(document.getElementById(this.state.ctxId).getContext('2d'), conf);
  }

  componentWillReceiveProps(nextProps) {
    if (!charts[this.state.ctxId] || !Array.isArray(nextProps.data)) return;
    if (util.equal(nextProps.data, this.state.data)) return;
    charts[this.state.ctxId].data.datasets = nextProps.dataLabels.map((label, index) => ({
      label: (label.length < 13 ? label || '' : `${label.substring(0, 10)}...`),
      data: [nextProps.data[index].estimate, nextProps.data[index].actually],
      backgroundColor: backgroundColors[index % backgroundColors.length],
      borderColor: borderColors[index % backgroundColors.length],
      borderWidth: 1,
      fill: false,
    }));
    charts[this.state.ctxId].update({ lazy: true });
    this.setState({ data: nextProps.data });
  }

  componentWillUnmount() {
    charts[this.state.ctxId].destroy();
    delete charts[this.state.ctxId];
  }

  render() {
    return (
      <canvas id={this.state.ctxId} />
    );
  }
}

DiffChart.propTypes = {
  title: PropTypes.string.isRequired,
  chartLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({
    estimate: PropTypes.number.isRequired,
    actually: PropTypes.number.isRequired,
  })).isRequired,
  dataLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  unit: PropTypes.string.isRequired,
  theme: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles, { withTheme: true })(DiffChart);
