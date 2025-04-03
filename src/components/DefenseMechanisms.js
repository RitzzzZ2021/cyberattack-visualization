// cyberattack-visualization/src/components/DefenseMechanisms.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import useData from "../utils/useData";

const DefenseMechanisms = () => {
  const ref = useRef();
  const { data, error } = useData();

  useEffect(() => {
    if (error) return;
    if (!data) return;

    // Group by Defense Mechanism Used and average the Incident Resolution Time (in Hours)
    const defenseData = Array.from(
      d3.rollup(
        data,
        v => d3.mean(v, d => +d["Incident Resolution Time (in Hours)"]),
        d => d["Defense Mechanism Used"]
      )
    ).map(([mechanism, avgTime]) => ({ mechanism, avgTime }));

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // X scale for defense mechanisms
    const x = d3.scaleBand()
      .domain(defenseData.map(d => d.mechanism))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    // Y scale for average resolution time
    const y = d3.scaleLinear()
      .domain([0, d3.max(defenseData, d => d.avgTime)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg.append("g")
      .attr("fill", "purple")
      .selectAll("rect")
      .data(defenseData)
      .enter().append("rect")
      .attr("x", d => x(d.mechanism))
      .attr("y", d => y(d.avgTime))
      .attr("height", d => y(0) - y(d.avgTime))
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

export default DefenseMechanisms;
