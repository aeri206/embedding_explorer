import React, { useState } from 'react';
import parse from 'html-react-parser';

const BasicInfoTab = (props) => {
  
  const df_name = props.dataset;
  const emb_name = props.method;
  const emb_params = props.emb_params;
  let label_data;

  if (props.isLabel){
    let pointsData = require("../json/" + props.dataset + "_" + props.method + "_points.json");
    label_data = Array.from(new Set(pointsData.map((d) => d.label))).sort((a,b)=> a - b);
  }else{ label_data = 'not-exist'; }
  const printParam = (obj) => {
    let txt = '';
    for (let x in obj){
      txt+= x + "&nbsp;&nbsp;:&nbsp;&nbsp;" + obj[x] + '<br/>';
    }
    txt += ""
    return parse(txt);
  }

  const spacing = (num) => {
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
        <b>DATASET</b>{spacing(5)}
        <div style={{height:'20px',width:'220px',overflow:'auto'}}>{df_name.toUpperCase()}</div></div>
      <div className="data" style={{height:'30px',width:'310px',overflow:'auto'}}>
        label{spacing(2)}:{spacing(2)}{JSON.stringify(label_data)}</div>
      
      <div className="keyword">
        <b>EMBEDDING</b>{spacing(5)}
        <div style={{height:'20px',width:'180px',overflow:'auto'}}>{emb_name.toUpperCase()}</div></div>
      <div className="data" style={{height:'80px',width:'310px',overflow:'auto'}}>
        {printParam(emb_params)}</div>
    </div>
  );


}

export default BasicInfoTab;