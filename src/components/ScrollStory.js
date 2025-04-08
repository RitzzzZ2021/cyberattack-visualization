import { useInView } from "react-intersection-observer";
import React, { useEffect, useState } from "react";
import AttackTrends from "./AttackTrends";
import IndustryImpact from "./IndustryImpact";
import FinancialImpact from "./FinancialImpact";
import DefenseMechanisms from "./DefenseMechanisms";
import "../App.css";

const SectionWrapper = ({ children, index, setActiveIndex, isActive }) => {
    const { ref, inView } = useInView({
      threshold: 0.5, // adjust threshold as needed
      triggerOnce: false,
    });
  
    useEffect(() => {
      if (inView) {
        setActiveIndex(index);
      }
    }, [inView, index, setActiveIndex]);
  
    return (
      <div ref={ref} className={`section-wrapper ${isActive ? "active" : ""}`}>
        {children}
      </div>
    );
  };

const sections = [
    { component: <AttackTrends />, title: "Peaks, Dips, and No Decline", text: "Cyberattacks have become a persistent threat over the past decade. This chart shows the number of cyberattacks reported each year from 2015 to 2024. While the numbers fluctuate, the overall trend remains alarmingly high—with no sign of disappearing. Peaks in 2017 and 2020 highlight years of intensified activity, while the dip in 2019 stands out as an exception rather than a shift." },
    { component: <FinancialImpact />, title: "From $100M Losses to Millions of Breached Identities—A Crisis of Wealth and Privacy", text: "Cyberattacks aren’t just numbers—they carry a heavy price. In this view, each bubble represents the financial impact of cyber incidents across different countries. From the U.S. to China to Germany, losses consistently hover around $100 million per incident. The size of the problem is global—and so is the cost. But money isn't the only thing at stake. Switching the metric reveals another alarming reality: the number of affected users. Behind every attack are real people—whose data is stolen, accounts breached, or identities compromised. Some countries see tens of millions impacted in a single year. This visualization brings into focus the human and economic toll of cybercrime. The scale of damage reminds us that cybersecurity isn’t just an IT issue—it’s a societal one." },
    { component: <IndustryImpact />, title: "Cybercrime’s Favorite Victims: Industries Built on Data Goldmines", text: "Not all industries are equally equipped—or equally targeted. This chart breaks down the number of cyberattacks across different sectors. Leading the list is the IT industry, with nearly 480 incidents, followed closely by banking and healthcare. Why these industries? They’re rich in data. IT companies store massive digital footprints. Banks guard sensitive financial records. Healthcare systems manage life-critical information. These high-value targets make them prime ground for hackers. Use the dropdown to explore how the attack source shifts the landscape." },
    { component: <DefenseMechanisms />, title: "Even with Cutting-Edge Tech, Incident Recovery Times Refuse to Shrink", text: "The prevalence of cybersecurity defense mechanisms shifts dynamically each year, with no single tool maintaining absolute dominance as threats evolve; however, despite these adaptive changes and the rise of advanced technologies like encryption, the average resolution time for incidents remains stubbornly stagnant, underscoring the escalating complexity of cyberattacks that outpace even the most sophisticated defenses." },
];
const ScrollStory = () => {
    
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <div className="scroll-container">
            {/* Left Text Column */}
            <div className="text-container">
                {sections.map((section, index) => (
                <div key={index} className={`sticky-text fade-text ${activeIndex === index ? "active" : ""}`}>
                    <h2>{section.title}</h2>
                    <p> 
                        {section.text}
                    </p>
                </div>
                ))}
            </div>
            {/* Right Chart Column */}
            <div className="chart-container">
                {sections.map((section, index) => (
                <SectionWrapper key={index} index={index} setActiveIndex={setActiveIndex} isActive={activeIndex === index}>
                    {section.component}
                </SectionWrapper>
                ))}
            </div>
        </div>
    );
};
  
export default ScrollStory;