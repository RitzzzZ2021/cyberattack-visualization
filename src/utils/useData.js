import { useState, useEffect } from "react";
import * as d3 from "d3";

const useData = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load the CSV from the public folder
    d3.csv(process.env.PUBLIC_URL + "/data/Global_Cybersecurity_Threats_2015-2024.csv", d => {
        return {
            Country: d.Country,
            Year: +d.Year,
            "Attack Type": d["Attack Type"],
            "Target Industry": d["Target Industry"],
            "Financial Loss (in Million $)": +d["Financial Loss (in Million $)"],
            "Number of Affected Users": +d["Number of Affected Users"],
            "Attack Source": d["Attack Source"],
            "Security Vulnerability Type": d["Security Vulnerability Type"],
            "Defense Mechanism Used": d["Defense Mechanism Used"],
            "Incident Resolution Time (in Hours)": +d["Incident Resolution Time (in Hours)"]
        };
    })
      .then((loadeddata) => {
        setData(loadeddata);
      })
      .catch((err) => {
        console.error("Error loading CSV:", err);
        setError(err);
      });
  }, []);

  return { data, error };
};

export default useData;
