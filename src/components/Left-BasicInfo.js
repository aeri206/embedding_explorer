import React, { useState } from 'react';
import * as d3 from 'd3';
import parse from 'html-react-parser';

const BasicInfoTab = (props) => {

  const df_name = props.dataset;
  const emb_name = props.method;
  const emb_params = props.emb_params;
  
  function labelChart(){
    if (props.isLabel){
      let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
      let label_data = require("../json/" + props.dataset + "_" + props.method + "_points.json");
      label_data = Array.from(new Set(label_data.map((d) => d.label))).sort((a,b)=> a - b);
      
      const items = [];
      for (let x=0; x<label_data.length; x++){
        items.push(
          <div style={{display: "flex", marginBottom: "3px"}}>
            <rect style={{height: "15px", width: "50px", backgroundColor: colorScale(x)}}></rect>
            <div style={{height: "15px", fontSize: "15px"}}>&nbsp;&nbsp;:&nbsp;&nbsp;{label_data[x]}</div>
          </div>
        )
      }
      return items;
    }
    else{ 
      return (<div>-</div>);
    }
  }

  function printParam(obj) {
    const items = [];
    for (let x in obj){
      items.push(
        <div>
          {x}&nbsp;&nbsp;:&nbsp;&nbsp;{obj[x]}
        </div>
      )
    }
    return items;
  }

  function spacing(num) {
    let txt = '';
    for (let x = 0; x < num; x++){
      txt+= "&nbsp;"
    }
    return parse(txt);
  }

  return (
    <div id="basic-info" className='Tab'>
       <div className="tab-title">
       Basic Information
       </div>
      <div className="keyword">
        <b>DATASET{spacing(5)}</b>
        <div style={{height:'20px',width:'220px',overflow:'auto'}}>{df_name.toUpperCase()}</div>
      </div>
      <div className="keyword">
        <b>EMBEDDING{spacing(5)}</b>
        <div style={{height:'20px',width:'200px',overflow:'auto'}}>{emb_name.toUpperCase()}</div>
      </div>

      <div className="two-cols">
        <div id="header" className="column1">Label Color</div>
        <div id="header" className="column2">Model Parameter</div>
      </div>

      <div className="two-cols">
        <div className="column1" style={{height:'85px',overflow:'auto'}}>
          {labelChart()}
        </div>
        <div className="column2" style={{height:'85px',overflow:'auto'}}>
          {printParam(emb_params)}
        </div>
      </div>
    </div>
  );


}

export default BasicInfoTab;