import React, { useState } from 'react';
import parse from 'html-react-parser';

const BasicInfoTab = (props) => {

  const df_name = useState('MNIST-TEST')[0];
  const n_label = useState('not-applied')[0];
  const emb_name = useState('PCA')[0];
  const emb_params = useState({'param1': 111, 'param2': 222, 'param3': 222, 'param4': 222, 'param5': 222})[0];

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
       <div id="title">
       Basic Information
       </div>
      <div id="header"><b>DATASET</b>{spacing(5)}{df_name}</div>
      <div id="body">label{spacing(2)}:{spacing(2)}{n_label}</div>
      <div id="header"><b>EMBEDDING</b>{spacing(5)}{emb_name}</div>
      <div id="body">{printParam(emb_params)}</div>
    </div>
  );


}

export default BasicInfoTab;