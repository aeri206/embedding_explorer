import './App.css';
import React, { useState } from 'react'

import BasicInfoTab from './components/Left-BasicInfo';
import ControlTab from './components/Left-Control';
import ExplorerNew from './components/Explorer-new';

function App() {

  const methods = ["pca" , "isomap", "tsne", "umap"];
  
  const [mainMethod, setMainMethod] = useState("pca");

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
            methods={methods}
            method={mainMethod}
            dataset="mnist_sampled_10"
            isLabel={true}
            showMissing={true}
            showFalse={true}
            radius={2.5}
            stroke={3}
            setMainMethod = {setMainMethod}
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
