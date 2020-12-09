import './App.css';
import React, { useState } from 'react'

import BasicInfoTab from './components/Left-BasicInfo';
import ControlTab from './components/Left-Control';
import ExplorerNew from './components/Explorer-new';
import RepositoryTab from './components/Right-Repository';

function App() {

  const methods = ["pca" , "isomap", "tsne", "umap"];
  const [mainMethod, setMainMethod] = useState("pca");

  const embedding_parameters = {'param1': 111, 'param2': 222, 'param3': 222, 'param4': 222, 'param5': 222};

  return (
    <div className="App">
      <title>Embeding Explorer</title>
      <div className="App-header">
        Distortion in Dimension Reduction
      </div>
      <div id="body">
        <div id="left-bar">
            <BasicInfoTab
              method="pca"
              dataset="mnist_sampled_10"
              isLabel={true}
              emb_params={embedding_parameters}
            />
            <ControlTab
              method="pca"
              dataset="mnist_sampled_10"
              isLabel={true}
              emb_params={embedding_parameters}
            />
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
        </div>
        <div id="right-bar">
          <RepositoryTab/>
        </div>
      <footer/>
    </div>
  );
}

export default App;
