import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import uuid from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import constants from '../constants';
import util from '../util';

const formatDatas = tableTasks => tableTasks.reduce((result, current) => {
  const element = result.find(p => p.date === current.date);
  const actually = util.getTimeDiffMinute(current.startTime, current.endTime);
  if (element) {
    element.actuallys.push(actually);
  } else {
    result.push({ date: current.date, actuallys: [actually] });
  }
  return result;
}, []);

const styles = {};
class ActivityChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: `${uuid()}`,
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    if (!this.activity || !Array.isArray(this.props.tableTasks)) return;
    this.draw(formatDatas(this.props.tableTasks));
  }

  componentDidUpdate() {
    if (!this.activity || !Array.isArray(this.props.tableTasks)) return;
    this.draw(formatDatas(this.props.tableTasks));
  }

  componentWillUnmount() {
  }


  draw(datas) {
    d3.selectAll(`#activity-${this.state.id} > *`).remove();
    const padding = 60;
    const width = constants.APPWIDTH - (padding * 2);
    const height = 300;
    const svg = d3.select(`#activity-${this.state.id}`).attr('width', width).attr('height', height);
    let dataset = datas.map(data => ({ date: data.date, value: data.actuallys.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / 60 }));

    const timeparser = d3.timeParse('%Y-%m-%d');
    dataset = dataset.map(d => ({ date: timeparser(d.date), value: d.value }));

    const xScale = d3.scaleTime()
      .domain([d3.min(dataset, d => moment(d.date).toDate()), d3.max(dataset, d => moment(d.date).toDate())])
      .range([padding, width - padding]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d.value)])
      .range([height - padding, padding]);

    const axisx = d3.axisBottom(xScale)
      .ticks(dataset.length)
      .tickFormat(d3.timeFormat('%Y-%m-%d(%a)'));
    const axisy = d3.axisLeft(yScale).tickFormat(d => `${d}h`);

    const line = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value));

    svg.append('g')
      .attr('transform', `translate(${0},${height - padding})`)
      .call(axisx);

    svg.append('g')
      .attr('transform', `translate(${padding},${0})`)
      .call(axisy);

    svg.append('path')
      .datum(dataset)
      .attr('stroke-width', 0.5)
      .attr('stroke', constants.brandColor.base.BLUE)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('d', line);
  }
  render() {
    return (<svg id={`activity-${this.state.id}`} ref={(node) => { this.activity = node; }} />);
  }
}

ActivityChart.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    assign: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    estimate: PropTypes.any.isRequired,
    endTime: PropTypes.string.isRequired,
    startTime: PropTypes.string.isRequired,
    memo: PropTypes.string.isRequired,
  })).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(ActivityChart);
