import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';
import * as d3 from 'd3';
import uuid from 'uuid';
import { withStyles } from '@material-ui/core/styles';
import constants from '../constants';
import util from '../util';


const h = 50;
const margin = {
  top: 10,
  right: 50,
  left: 50,
  bottom: 10,
};

// 灰色と透明の色は重なった時に色が分かりにくいので消す
const brandColorLight = util.cloneDeep(constants.brandColor.light);
delete brandColorLight.GREY;
delete brandColorLight.SKIN;
const brandColorBase = util.cloneDeep(constants.brandColor.base);
delete brandColorBase.GREY;
delete brandColorBase.SKIN;

const today = moment('00:00', constants.TIMEFMT).toDate();
const tomorrow = moment('00:00', constants.TIMEFMT).add(1, 'days').toDate();
const fillColors = Object.values(brandColorLight);
const strokeColors = Object.values(brandColorBase);
const styles = {};
class TimelineChart extends Component {
  constructor(props) {
    super(props);
    this.draw = debounce(this.draw, constants.RENDER_DELAY);
    this.state = {
      id: `${uuid()}`,
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    if (!this.timeline) return;
    const { tableTasks } = this.props;
    this.draw(tableTasks);
  }

  componentDidUpdate() {
    if (!this.timeline) return;
    const { tableTasks } = this.props;
    this.draw(tableTasks);
  }

  componentWillUnmount() {
  }

  draw(data) {
    console.log(strokeColors);
    if (!this.timeline) return;
    const { id } = this.state;
    d3.selectAll(`#timeline-${id} > *`).remove();
    const labels = d3.nest().key(d => d.key).entries(data);
    const w = this.timeline.parentNode ? this.timeline.parentNode.clientWidth : 0;

    // svg
    const svg = d3.select(`#timeline-${id}`).attr('width', w).attr('height', h);
    // xAxis
    const x = d3.scaleTime().domain([today, tomorrow]).clamp(true).range([0, w - (margin.left + margin.right)]);
    const xAxis = d3.axisBottom(x).ticks(d3.timeHour.every(util.isMobile() ? 2 : 1)).tickFormat(d3.timeFormat(util.isMobile() ? '%_H' : '%H:00')).tickSizeInner(-(h - (margin.top + margin.bottom)))
      .tickSizeOuter(0);
    svg.append('g').attr('class', 'axis x-axis').attr('transform', `translate(${margin.left}, ${h - margin.bottom})`).call(xAxis)
      .selectAll('text');
    // yAxis
    const y = d3.scaleBand(0.5).rangeRound([margin.top, h - margin.bottom]).domain(labels.map(d => d.key));
    const yAxis = d3.axisLeft(y).tickSizeInner(0).tickSizeOuter(0);
    svg.append('g').attr('class', 'axis y-axis').attr('transform', `translate(${margin.left}, 0)`).call(yAxis)
      .selectAll('text')
      .each(() => {
        const el = d3.select(this);
        const parent = d3.select(this.parentNode);
        parent.append('foreignObject').attr('x', -margin.left).attr('y', -5).attr('width', margin.left)
          .attr('height', 20 * 2)
          .append('xhtml:span')
          .attr('class', 'y-axis-label');
        el.remove();
      });
    // Tooltip
    const tooltip = svg.append('g')
      .style('display', 'none');
    tooltip.append('rect');
    tooltip.append('text').attr('x', 30).attr('dy', '1.2em').style('text-anchor', 'middle')
      .style('font-size', '9pt')
      .style('font-weight', 'bold');
    // Bar
    svg.selectAll('.active').data(data).enter().append('rect')
      .attr('x', d => x(d.start) + margin.left + 1)
      .attr('y', d => y(d.key))
      .style('width', d => x(d.end) - x(d.start) - 1)
      .style('height', 30)
      .attr('stroke-width', 0.5)
      .attr('stroke', (d, i) => strokeColors[i % strokeColors.length])
      .style('fill', (d, i) => fillColors[i % fillColors.length])
      .attr('class', 'active')
      .on('mouseover', () => { tooltip.style('display', 'block'); })
      .on('mouseout', () => { tooltip.style('display', 'none'); })
      .on('mousemove', (d) => {
        const xPosition = d3.mouse(svg.node())[0];
        const yPosition = d3.mouse(svg.node())[1] - 15;
        tooltip.attr('transform', `translate(${xPosition},${yPosition})`);
        tooltip.select('text').text(d.title);
      });

    const pointerData = [{
      start: new Date(),
    }];
    // Pointer
    svg.selectAll('.now').data(pointerData).enter().append('rect')
      .attr('x', d => x(d.start) + margin.left)
      .attr('y', 10)
      .style('width', 1)
      .style('height', 30)
      .style('fill', 'red')
      .attr('class', 'now');

    const pointX = Math.floor(svg.select('.now').attr('x')) + 1;
    // Pointer
    svg.selectAll('point')
      .data(pointerData)
      .enter()
      .append('path')
      .attr('d', () => `M${pointX - 5} ${5} L${pointX} ${10} L${pointX + 5} ${5} Z`)
      .attr('fill', 'red')
      .style('width', 30)
      .style('height', 30)
      .attr('class', 'point');
  }

  render() {
    const { id } = this.state;
    return (<svg id={`timeline-${id}`} ref={(node) => { this.timeline = node; }} />);
  }
}

TimelineChart.propTypes = {
  tableTasks: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    start: PropTypes.object.isRequired,
    end: PropTypes.object.isRequired,
  })).isRequired,
  classes: PropTypes.object.isRequired, // eslint-disable-line
};

export default withStyles(styles)(TimelineChart);
