import './App.css';
import Explorer from './components/Explorer';

import BasicInfoTab from './components/Left-BasicInfo';
import ControlTab from './components/Left-Control';
import ShepardDiagram from './components/Detail-Shepard';

function App() {
  return (
    <div className="App">
      <title>Embeding Explorer</title>
      <header className="App-header">
        Distortion in Dimension Reduction
      </header>
      <div id="body">
        <div id="left-bar">
            <BasicInfoTab/>
            <ControlTab/>
        </div>
        <div id="content">
          <Explorer
            method="pca"
            dataset="mnist_sampled_10"
            isLabel={true}
          />
        </div>
        <div id="detail-info">
          <div style={{textAlign:'center', height:'25px', fontSize:'16px'}}>Shepard Diagram</div>
          <ShepardDiagram/>
        </div>
      </div>
      <footer/>
    </div>
  );
}

export default App;
