import { useInView } from "react-intersection-observer";
import React, { useEffect, useState } from "react";
import AttackTrends from "./AttackTrends";
import IndustryImpact from "./IndustryImpact";
import FinancialImpact from "./FinancialImpact";
import AttackSources from "./AttackSources";
import DefenseMechanisms from "./DefenseMechanisms";
import "../App.css";

// const Section = ({ text, children }) => {
//     const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.3 });
//     return (
//       <div ref={ref} className={`story-section ${inView ? "visible" : ""}`}>
//         <div className="story-text">{text}</div>
//         <div className="story-chart">{children}</div>
//       </div>
//     );
// };

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
    { component: <AttackTrends />, text: "Cyberattacks are increasing over time..." },
    { component: <IndustryImpact />, text: "Different industries are impacted..." },
    { component: <FinancialImpact />, text: "Financial losses and affected users..." },
    { component: <AttackSources />, text: "Where do attacks come from?" },
    { component: <DefenseMechanisms />, text: "How defenses evolved..." },
];
const ScrollStory = () => {
    
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <div className="scroll-container">
            {/* Left Text Column */}
            <div className="text-container">
                {sections.map((section, index) => (
                <p key={index} className={`sticky-text fade-text ${activeIndex === index ? "active" : ""}`}> 
                    {section.text}
                </p>
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