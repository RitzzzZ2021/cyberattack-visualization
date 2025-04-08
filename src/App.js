import './App.css';
import ScrollStory from './components/ScrollStory';

function App() {
  return (
    <div className="App">
      <div class="title-container">
        <h1 class="story-title">Decade of Cyberattacks</h1>
        <h2 class="story-subtitle">Tracking the Unstoppable Surge of Attacks, Costs, and Systemic Failures</h2>
      </div>
      <div><ScrollStory/></div>
      
    </div>
  );
}

export default App;
