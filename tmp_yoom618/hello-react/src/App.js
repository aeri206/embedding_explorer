import logo from './logo.svg';
import './App.css';

import React, { Component } from 'react';
import BasicInfoTab from './Left-BasicInfo';
import ControlTab from './Left-Control';
import ShepardDiagram from './Detail-Shepard';






function App() {
  return (
    <div className="App">
      <title>aaa</title>
      <header className="App-header">
        Distortion in Dimension Reduction
      </header>

      <div id="left-bar">
          <BasicInfoTab/>
          <ControlTab/>
      </div>



      <div id="detail-info">
        <div style={{textAlign:'center', height:'25px', fontSize:'16px'}}>Shepard Diagram</div>
        <ShepardDiagram/>
      </div>

    </div>






  );
}

export default App;
