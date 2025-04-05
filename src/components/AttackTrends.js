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
      d3.rollup(data, (v) => v.length, (d) => d.Year)
    ).map(([year, count]) => ({ year, count }));

    trendData.sort((a, b) => a.year - b.year);

    const width = 700;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };

    const x = d3.scaleLinear()
      .domain(d3.extent(trendData, (d) => d.year))
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(trendData, (d) => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    // Define gradient for the line stroke
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", margin.left).attr("x2", width - margin.right)
      .attr("y1", y(0)).attr("y2", y(d3.max(trendData, (d) => d.count)));

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#4f8ef7");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#183da0");

    // Define line generator
    const line = d3.line()
      .x((d) => x(d.year))
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX);

    // Append the path
    const path = svg.append("path")
      .datum(trendData)
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)")
      .attr("stroke-width", 3)
      .attr("d", line)
      .attr("stroke-dasharray", function () { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Tooltip setup
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid black")
      .style("padding", "5px 10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Append circles at data points
    svg.selectAll("circle")
      .data(trendData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.count))
      .attr("r", 4)
      .attr("fill", "#183da0")
      .attr("opacity", 0)
      .transition()
      .delay((d, i) => i * 100)
      .duration(500)
      .attr("opacity", 1);

    // Hover effect
    svg.selectAll("circle")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6).attr("fill", "red");

        tooltip.style("opacity", 1)
          .html(`Year: <b>${d.year}</b><br/>Attacks: <b>${d.count}</b>`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mousemove", function (event) {
        tooltip.style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4).attr("fill", "#183da0");

        tooltip.style("opacity", 0);
      });

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Year");

    // Y-axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#333")
      .text("Number of Attacks");
  }, [data, error]);

  return (
    <div style={{ margin: '20px' }}>
      <h3>Cyberattacks Trends Between 2015-2024</h3>
      <svg ref={ref} width={700} height={500}></svg>
    </div>
  );
};

export default AttackTrends;
