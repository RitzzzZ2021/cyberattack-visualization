import { useEffect, useRef } from "react";
import * as d3 from "d3";
import "../App.css";
import useData from "../utils/useData.js";

const AttackTrends = () => {
  const ref = useRef();
  const { data, error } = useData();

  useEffect(() => {
    if (error) {
      console.error("Error loading data:", error);
      return;
    }
    if (!data) return;

    const trendData = Array.from(
        d3.rollup(data, v => v.length, d => d.Year)
    ).map(([year, count]) => ({ year, count }));

    trendData.sort((a, b) => a.year - b.year);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleLinear()
      .domain(d3.extent(trendData, d => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(trendData, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
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

export default AttackTrends;
