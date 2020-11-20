import React, { useState } from 'react';
import parse from 'html-react-parser';

const ControlTab = (props) => {

  
  const df_filename = useState('MNIST-TEST_original.json')[0];
  const label_filename = useState('MNIST-TEST_label.json')[0];
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
    <div id="control" className='Tab'>
        <div id="title">
        Control
        </div>
      <div id="header"><b>DATASET</b></div>
      <div id="fileIO">
        <button>Load Original Data</button>
        {spacing(4)}
        <button>Load Label Data</button>
      </div>
      <div id="body" style={{fontSize:'13px'}}>
        original-data{spacing(2)}:{spacing(2)}{df_filename}<br/>
        label-data{spacing(2)}:{spacing(2)}{label_filename}

      </div>

      <div id="header"><b>EMBEDDING</b></div>
      <div id="body">asdf</div>
    </div>
  );

}

export default ControlTab;