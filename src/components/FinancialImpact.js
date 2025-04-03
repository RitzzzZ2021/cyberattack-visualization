// cyberattack-visualization/src/components/FinancialImpact.js
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import useData from "../utils/useData";

const FinancialImpact = () => {
  const ref = useRef();
  const { data, error } = useData();

  useEffect(() => {
    if (error) return;
    if (!data) return;

    // Group by Year and sum the Financial Loss (in Million $)
    const financialData = Array.from(
      d3.rollup(
        data,
        v => d3.sum(v, d => +d["Financial Loss (in Million $)"]),
        d => +d.Year
      )
    ).map(([year, totalLoss]) => ({ year, totalLoss }));

    // Sort data by year
    financialData.sort((a, b) => a.year - b.year);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleLinear()
      .domain(d3.extent(financialData, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(financialData, d => d.totalLoss)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.totalLoss))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(financialData)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 2)
      .attr("d", line)
      .attr("stroke-dasharray", function() { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [data, error]);

  return <svg ref={ref} width={600} height={300}></svg>;
};

export default FinancialImpact;
