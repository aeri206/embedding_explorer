import React, { useState } from 'react';
import parse from 'html-react-parser';


const ControlTab = (props) => {

  let df_filename = props.dataset + "_original.json";
  let emb_name = props.method;
  let emb_params = props.emb_params;
  let emb_filename = props.dataset + "_" + props.method + "_points(";
  for (let x in emb_params){
    emb_filename += emb_params[x] + "_";
  } emb_filename = emb_filename.slice(0,-1) + ").json";

  let label_data;
  if (props.isLabel){
    let pointsData = require("../json/" + props.dataset + "_" + props.method + "_points.json");
    label_data = Array.from(new Set(pointsData.map((d) => d.label))).sort((a,b)=> a - b);
  }else{ label_data = 'not-exist'; }

  const printParam = (obj) => {
    let txt = '';
    for (let x in obj){
      txt += '<div style="display: flex; padding-bottom:5px">'
      + `<div style="width: 90px; margin: 0 10px">${x}</div>`
      + `<input type = "text" name = "${x}" value = "${obj[x]}"`
      + 'onChange={handleChange} /><br/></div>';
    }
    return parse(txt);
  }
  
  const spacing = (num) => {
    let txt = '';
    for (let x = 0; x < num; x++){
      txt+= "&nbsp;"
    }
    return parse(txt);
  }
  
  function buildFileSelector(){
    const fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.setAttribute('multiple', 'multiple');
    return fileSelector;
  }
  const input_original = buildFileSelector();
  const input_emb = buildFileSelector();
  

  const onClickData = (e) => {
    e.preventDefault();
    input_original.click();
  }
  const onClickMeta = (e) => {
    e.preventDefault();
    input_emb.click();
  }
  const onClickEmb = (e) => {
    e.preventDefault();
    input_emb.click();
  }
  const handleChange = (e) => {
    //
  }
  const handleSubmit = (e) => {
    alert('A name was submitted: ' + this.state.value);
    e.preventDefault();
  }

  return (
    <div id="control" className='Tab'>
        <div className="tab-title">
        Control
        </div>
      <div className="keyword">
        <b style={{marginTop:'4px', height:'20px', width:'120px'}}>DATASET</b>
        <button onClick={onClickData} style={{width:'200px'}}>Load Original Data</button>
      </div>
      <div className="data"  style={{height:'30px',width:'310px',overflow:'auto', fontSize:'15px'}}>
        <div>{`file${spacing(2)}:${spacing(2)}${df_filename}`}</div>
      </div>

      
      <div className="keyword">
        <b style={{marginTop:'4px', height:'20px', width:'120px'}}>EMBEDDING</b>
      </div>
      <div className="keyword">
        <button onClick={onClickMeta}>Load Meta Data</button>
        {spacing(2)}
        <button onClick={onClickEmb}>Load Embedding Data</button>
      </div>
      <div className="data"  style={{height:'30px',width:'310px',overflow:'auto', fontSize:'15px'}}>
      {`file${spacing(2)}:${spacing(3)}${emb_filename}`}</div>

      <div>
        <form onSubmit={handleSubmit}>
          {printParam(emb_params)}
          <div style={{marginLeft:"175px"}}>
            <input type="reset" value="Reset" align="right"/>{spacing(2)}
            <input type="submit" value="Submit" align="right"/>
          </div>
        </form>    
      </div>
    </div>
  );

}

export default ControlTab;