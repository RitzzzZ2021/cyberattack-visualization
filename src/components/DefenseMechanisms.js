import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import useData from '../utils/useData';

const DefenseMechanisms = () => {
  const ref = useRef();
  const { data, error } = useData();

  useEffect(() => {
    if (error || !data) return;

    // Process data
    const groupedData = Array.from(
      d3.rollup(data, 
        v => ({
          mechanisms: d3.rollup(v, 
            group => group.length,
            d => d['Defense Mechanism Used']
          ),
          avgResolution: d3.mean(v, d => d['Incident Resolution Time (in Hours)'])
        }),
        d => d.Year
      ),
      ([year, metrics]) => ({
        year: new Date(year, 0, 1),
        ...metrics
      })
    ).sort((a, b) => a.year - b.year);

    const mechanisms = [...new Set(data.map(d => d['Defense Mechanism Used']))].filter(Boolean);

    // Dimensions
    const width = 800;
    const height = 600;
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Scales
    const xScale = d3.scaleBand()
      .domain(groupedData.map(d => d.year.getFullYear()))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y1Scale = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d3.max([...d.mechanisms.values()]))])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const y2Scale = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d.avgResolution)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const y1Axis = d3.axisLeft(y1Scale);
    const y2Axis = d3.axisRight(y2Scale);

    // Draw axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(y1Axis);

    svg.append('g')
      .attr('transform', `translate(${width - margin.right},0)`)
      .call(y2Axis);

    // Axis labels
    svg.append('text')
      .attr('transform', `translate(${width/2},${height - margin.bottom + 50})`)
      .style('text-anchor', 'middle')
      .text('Year');

    svg.append('text')
      .attr('transform', `translate(${margin.left - 50},${height/2}) rotate(-90)`)
      .style('text-anchor', 'middle')
      .text('Defense Mechanisms Used (Count)');

    svg.append('text')
      .attr('transform', `translate(${width - margin.right + 50},${height/2}) rotate(-90)`)
      .style('text-anchor', 'middle')
      .text('Average Resolution Time (Hours)');

    // Draw grouped bars
    const barGroups = svg.selectAll('.year-group')
      .data(groupedData)
      .join('g')
      .attr('class', 'year-group')
      .attr('transform', d => `translate(${xScale(d.year.getFullYear())},0)`);

    barGroups.selectAll('rect')
      .data(d => mechanisms.map(mechanism => ({
        mechanism,
        count: d.mechanisms.get(mechanism) || 0
      })))
      .join('rect')
      .attr('x', (_, i) => xScale.bandwidth() / mechanisms.length * i)
      .attr('y', d => y1Scale(d.count))
      .attr('width', xScale.bandwidth() / mechanisms.length)
      .attr('height', d => height - margin.bottom - y1Scale(d.count))
      .attr('fill', (_, i) => d3.schemeTableau10[i]);

    // Draw resolution line
    const line = d3.line()
      .x(d => xScale(d.year.getFullYear()) + xScale.bandwidth() / 2)
      .y(d => y2Scale(d.avgResolution))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(groupedData)
      .attr('fill', 'none')
      .attr('stroke', '#c0c0c0')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Legend for Defense Mechanisms
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top - 60})`);

      let legendX = 0;
      mechanisms.forEach((mechanism, i) => {
        legend.append('rect')
          .attr('x', legendX)
          .attr('y', 0)
          .attr('width', 18)
          .attr('height', 18)
          .attr('fill', d3.schemeTableau10[i]);
  
        legend.append('text')
          .attr('x', legendX + 24)
          .attr('y', 9)
          .attr('dy', '0.32em')
          .text(mechanism)
          .style('font-size', '12px');
  
        // Update X position for next item
        legendX += mechanism.length * 7 + 40; // Adjust spacing based on text length
      });

    // Line legend positioned after defense mechanisms
    legend.append('path')
      .attr('d', `M${legendX + 10},9 L${legendX + 40},9`)
      .attr('stroke', '#c0c0c0')
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', legendX + 44)
      .attr('y', 9)
      .attr('dy', '0.32em')
      .text('Average Resolution Time')
      .style('font-size', '12px');

    // Legend background
    legend.insert('rect', ':first-child')
      .attr('fill', 'white')
      .attr('opacity', 0.8)
      .attr('width', legendX + 200) // Dynamic width
      .attr('height', 25)
      .attr('rx', 4);

    // Tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', 'rgba(255,255,255,0.9)')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Hover effects
    barGroups.selectAll('rect')
      .on('mouseover', function(event, d) {
        tooltip
          .style('opacity', 1)
          .html(`
            <strong>${d.mechanism}</strong><br>
            Year: ${event.target.parentNode.__data__.year.getFullYear()}<br>
            Count: ${d.count}
          `).transition().duration(200);
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mousemove', (event) => {
        tooltip.style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 15}px`);
      })
      .on('mouseout', function() {
        tooltip.transition().duration(200).style('opacity', 0);
        d3.select(this).attr('opacity', 1);
      });

  }, [data, error]);

  return (
    <div style={{ margin: '20px' }}>
      <h3>Defense Mechanism Evolution and Average Resolution Time</h3>
      <svg ref={ref} width={800} height={600} />
    </div>
  );
};

export default DefenseMechanisms;