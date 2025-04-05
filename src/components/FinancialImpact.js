import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import useData from '../utils/useData';

const FinancialImpact = () => {
  const ref = useRef();
  const { data, error } = useData();
  const [selectedMetric, setSelectedMetric] = useState('Financial Loss (in Million $)');
  const simulationRef = useRef(null);

  const metricConfig = {
    'Financial Loss (in Million $)': {
      label: 'Financial Loss (USD)',
      format: d => `$${d3.format('.1f')(d)}M`
    },
    'Number of Affected Users': {
      label: 'Affected Users',
      format: d => d
    }
  };

  useEffect(() => {
    if (error || !data) return;

    // Process data - show top 50 but only label top 20
    const processedData = data
      .filter(d => d[selectedMetric] > 0)
      .sort((a, b) => b[selectedMetric] - a[selectedMetric])
      .slice(0, 50); // Show top 50 attacks

    if (processedData.length === 0) return;

    const width = 900;
    const height = 600;
    const margin = 40;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    // Create scales
    const radiusScale = d3.scaleSqrt()
      .domain([d3.min(processedData, d => d[selectedMetric]),
        d3.max(processedData, d => d[selectedMetric])
      ])
      .range([5, 50]); // Adjusted size range for 50 points

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(processedData.map(d => d.Country))])
      .range(d3.schemeTableau10);

    // Force simulation
    if (simulationRef.current) simulationRef.current.stop();

    simulationRef.current = d3.forceSimulation(processedData)
      .force('charge', d3.forceManyBody().strength(15))
      .force('center', d3.forceCenter(width/2, height/2))
      .force('collision', d3.forceCollide(d => radiusScale(d[selectedMetric]) + 1))
      .force('boundary', () => {
        processedData.forEach(d => {
          d.x = Math.max(margin, Math.min(width - margin, d.x));
          d.y = Math.max(margin, Math.min(height - margin, d.y));
        });
      })
      .on('tick', ticked);

    // Create all 50 bubbles
    const bubbles = svg.selectAll('circle')
      .data(processedData, d => d.id)
      .join('circle')
      .attr('r', d => radiusScale(d[selectedMetric]))
      .attr('fill', d => colorScale(d.Country))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('opacity', d => d.index < 20 ? 0.9 : 0.6); // Dim non-top-20

    // Create labels only for top 20
    const labels = svg.selectAll('.metric-label')
      .data(processedData.slice(0, 20), d => d.id) // Only top 20 get labels
      .join(
        enter => enter.append('text')
          .attr('class', 'metric-label')
          .text(d => metricConfig[selectedMetric].format(d[selectedMetric]))
          .attr('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('fill', '#333')
          .style('font-weight', 'bold')
      );

    // Legend with all countries
    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, 20)`);

    legend.selectAll('.legend-item')
      .data(colorScale.domain())
      .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)
        .call(g => {
          g.append('rect')
            .attr('width', 14)
            .attr('height', 14)
            .attr('fill', d => colorScale(d));
          g.append('text')
            .attr('x', 20)
            .attr('y', 7)
            .attr('dy', '0.32em')
            .text(d => d)
            .style('font-size', '10px');
        });

    function ticked() {
      bubbles
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y + 4);
    }

    return () => simulationRef.current.stop();
  }, [data, error, selectedMetric]);

  return (
    <div>
      <div style={{ margin: '20px' }}>
        <label>Metric: </label>
        <select
          value={selectedMetric}
          onChange={e => setSelectedMetric(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            background: 'white'
          }}
        >
          {Object.entries(metricConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>
      <svg ref={ref} width={900} height={600}/>
    </div>
  );
};

export default FinancialImpact;