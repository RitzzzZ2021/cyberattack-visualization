import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { interpolateArray } from "d3-interpolate";
import useData from "../utils/useData";

const IndustryImpact = () => {
  const ref = useRef();
  const { data, error } = useData();
  const [selectedSource, setSelectedSource] = useState(null);
  const prevXDomain = useRef([]);
  const prevYDomain = useRef([0, 0]);

  useEffect(() => {
    if (error || !data) return;

    // Filter data
    const filteredData = selectedSource
      ? data.filter(d => d["Attack Source"] === selectedSource)
      : data;

    // Process industry data
    const industryData = Array.from(
      d3.rollup(filteredData, v => v.length, d => d["Target Industry"])
    ).map(([industry, count]) => ({ industry, count }))
     .sort((a, b) => b.count - a.count);

    // Dimensions
    const width = 600, height = 400;
    const margin = { top: 40, right: 20, bottom: 100, left: 60 };

    // Clear SVG
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Create scales
    const x = d3.scaleBand()
      .domain(industryData.map(d => d.industry))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    // Calculate y domain with 10% padding
    const yValues = industryData.map(d => d.count);
    const yMin = yValues.length ? d3.min(yValues) : 0;
    const yMax = yValues.length ? d3.max(yValues) : 0;
    const yPadding = (yMax - yMin) * 0.1;
    const y = d3.scaleLinear()
      .domain([Math.max(yMin - yPadding, 0), yMax + yPadding])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Create main group
    const mainGroup = svg.append("g");

    // Bars transition
    mainGroup.selectAll("rect")
      .data(industryData, d => d.industry)
      .join(
        enter => enter.append("rect")
          .attr("x", d => x(d.industry))
          .attr("width", x.bandwidth())
          .attr("y", d => y(y.domain()[0]))
          .attr("height", 0)
          .attr("fill", "teal")
          .call(enter => enter.transition()
            .duration(1000)
            .attr("y", d => y(d.count))
            .attr("height", d => y(y.domain()[0]) - y(d.count))
          ),
        update => update.call(update => update.transition()
          .duration(1000)
          .attr("x", d => x(d.industry))
          .attr("width", x.bandwidth())
          .attr("y", d => y(d.count))
          .attr("height", d => y(y.domain()[0]) - y(d.count))
        ),
        exit => exit.call(exit => exit.transition()
          .duration(1000)
          .attr("height", 0)
          .attr("y", y(y.domain()[0]))
          .remove()
        )
      );

    // X-axis transition
    const xAxisGroup = svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`);

    const currentXDomain = x.domain();
    const xDomainInterpolator = interpolateArray(prevXDomain.current, currentXDomain);
    prevXDomain.current = currentXDomain;

    xAxisGroup.transition()
      .duration(1000)
      .tween("xAxis", () => {
        const xScale = x.copy();
        return t => {
          xScale.domain(xDomainInterpolator(t));
          xAxisGroup.call(d3.axisBottom(xScale)
            .tickSizeOuter(0))
            .selectAll(".tick text")
            .attr("transform", "rotate(-40)")
            .style("text-anchor", "end");
        };
      });

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Industries");

    // Y-axis transition
    const yAxisGroup = svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`);

    const currentYDomain = y.domain();
    const yDomainInterpolator = interpolateArray(prevYDomain.current, currentYDomain);
    prevYDomain.current = currentYDomain;

    yAxisGroup.transition()
      .duration(1000)
      .tween("yAxis", () => {
        const yScale = y.copy();
        return t => {
          yScale.domain(yDomainInterpolator(t));
          yAxisGroup.call(d3.axisLeft(yScale).ticks(5));
        };
      });
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Number of Attacks");

  }, [data, error, selectedSource]);

  return (
    <div>
      <h3>Number of Attacks across Industries</h3>
      <div style={{ margin: "20px" }}>
        <label htmlFor="attackSource">Attack Source: </label>
        <select
          id="attackSource"
          onChange={e => setSelectedSource(e.target.value || null)}
          value={selectedSource || ""}
        >
          <option value="">All Sources</option>
          {data && [...new Set(data.map(d => d["Attack Source"]))]
            .filter(Boolean)
            .map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
        </select>
      </div>
      
      <svg ref={ref} width={600} height={400} />
    </div>
  );
};

export default IndustryImpact;