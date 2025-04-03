// cyberattack-visualization/src/components/AttackSources.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import useData from "../utils/useData";

const AttackSources = () => {
  const ref = useRef();
  const { data, error } = useData();

  useEffect(() => {
    if (error) return;
    if (!data) return;

    // Group by Attack Source and count the occurrences
    const sourceData = Array.from(
      d3.rollup(data, v => v.length, d => d["Attack Source"])
    ).map(([source, count]) => ({ source, count }));

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // X scale for attack sources
    const x = d3.scaleBand()
      .domain(sourceData.map(d => d.source))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Y scale for counts
    const y = d3.scaleLinear()
      .domain([0, d3.max(sourceData, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("fill", "orange")
      .selectAll("rect")
      .data(sourceData)
      .enter().append("rect")
      .attr("x", d => x(d.source))
      .attr("y", d => y(d.count))
      .attr("height", d => y(0) - y(d.count))
      .attr("width", x.bandwidth());

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-40)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data, error]);

  return <svg ref={ref} width={600} height={300}></svg>;
};

export default AttackSources;
