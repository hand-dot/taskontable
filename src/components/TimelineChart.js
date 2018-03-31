import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import uuid from 'uuid';
import { withStyles } from 'material-ui/styles';
import constants from '../constants';
import util from '../util';


const h = 50;
const margin = {
  top: 10,
  right: 50,
  left: 25,
  bottom: 10,
};

// 灰色は重なった時に色が分かりにくいので消す
const brandColorLight = util.cloneDeep(constants.brandColor.light);
delete brandColorLight.GREY;
const brandColorBase = util.cloneDeep(constants.brandColor.base);
delete brandColorBase.GREY;

const today = moment('00:00', constants.TIMEFMT).toDate();
const tomorrow = moment('00:00', constants.TIMEFMT).add(1, 'days').toDate();
const fillColors = Object.values(brandColorLight);
const strokeColors = Object.values(brandColorBase);
const styles = {};
class TimelineChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: `${uuid()}`,
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
  }

  componentDidUpdate() {
    if (!this.timeline) return;
    this.draw(this.props.tableTasks);
  }

  componentWillUnmount() {
  }

  draw(data) {
    d3.selectAll(`#timeline-${this.state.id} > *`).remove();
    const labels = d3.nest().key(d => d.key).entries(data);
    const w = constants.APPWIDTH;
    // svg
    const svg = d3.select(`#timeline-${this.state.id}`).attr('width', w).attr('height', h);
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
      .style('height', 20)
      .attr('stroke-width', 0.5)
      .attr('stroke', (d, i) => strokeColors[i % strokeColors.length])
      .style('fill', (d, i) => fillColors[i % fillColors.length])
      .attr('class', 'active')
      .on('mouseover', () => { tooltip.style('display', 'block'); })
      .on('mouseout', () => { tooltip.style('display', 'none'); })
      .on('mousemove', (d) => {
        const xPosition = d3.mouse(svg.node())[0] - 5;
        const yPosition = d3.mouse(svg.node())[1] - 5;
        tooltip.attr('transform', `translate(${xPosition},${yPosition})`);
        tooltip.select('text').text(d.title);
      });
  }
  render() {
    return (<svg id={`timeline-${this.state.id}`} ref={(node) => { this.timeline = node; }} />);
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
