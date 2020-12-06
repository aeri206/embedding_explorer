import './App.css';
import Explorer from './components/Explorer';

import BasicInfoTab from './components/Left-BasicInfo';
import ControlTab from './components/Left-Control';
import ShepardDiagram from './components/Detail-Shepard';
import BarChart from './components/Detail-BarChart';
import ExplorerNew from './components/Explorer-new';

function App() {
  return (
    <div className="App">
      <title>Embeding Explorer</title>
      <div className="App-header">
        Distortion in Dimension Reduction
      </div>
      <div id="body">
        <div id="left-bar">
            <BasicInfoTab/>
            <ControlTab/>
        </div>
          <ExplorerNew
            method="pca"
            dataset="mnist_sampled_10"
            isLabel={false}
            showMissing={true}
            showFalse={true}
            radius={0.7}
            stroke={1.5}
          />
        {/* <div id="detail-info">
          <div style={{textAlign:'center', height:'25px', fontSize:'16px', width:'250px'}}>Shepard Diagram</div> 
          <div style={{textAlign:'center', height:'25px', fontSize:'16px', paddingTop:'10px'}}>Label Distribution</div>
        </div> */}
      </div>
      <footer/>
    </div>
  );
}

export default App;
