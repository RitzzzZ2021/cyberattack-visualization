import { useInView } from "react-intersection-observer";
import AttackTrends from "./AttackTrends";
import IndustryImpact from "./IndustryImpact";
import FinancialImpact from "./FinancialImpact";
import AttackSources from "./AttackSources";
import DefenseMechanisms from "./DefenseMechanisms";
import "../App.css";

const Section = ({ text, children }) => {
    const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.3 });
    return (
      <div ref={ref} className={`story-section ${inView ? "visible" : ""}`}>
        <div className="story-text">{text}</div>
        <div className="story-chart">{children}</div>
      </div>
    );
};

const ScrollStory = () => {
    const sections = [
        { component: <AttackTrends />, text: "Cyberattacks are increasing over time..." },
        // { component: <IndustryImpact />, text: "Different industries are impacted..." },
        // { component: <FinancialImpact />, text: "Financial losses and affected users..." },
        // { component: <AttackSources />, text: "Where do attacks come from?" },
        // { component: <DefenseMechanisms />, text: "How defenses evolved..." },
    ];

    return (
        <div className="scroll-container">
        {sections.map((section, index) => (
          <Section key={index} text={section.text}>
            {section.component}
          </Section>
        ))}
      </div>
    );
};
  
export default ScrollStory;