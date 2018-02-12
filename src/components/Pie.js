import React, { Component } from 'react';
import Chart from 'chart.js';
import PropTypes from 'prop-types';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

const styles = {
};
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
    // FIXME グラフの色を決める https://github.com/hand-dot/taskontable/issues/166
    charts[this.state.ctxId].data.datasets = [{ data: nextProps.data, backgroundColor: nextProps.data.map(() => `rgba(0, 0, 0, ${0.1})`) }];
    charts[this.state.ctxId].update();
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Typography gutterBottom type="caption" align="center">
          {this.props.title}
        </Typography>
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
  data: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Pie);
