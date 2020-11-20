import React, { Component } from 'react';
import parse from 'html-react-parser';

class ControlTab extends Component {
  state = {
    df_filename: 'MNIST-TEST_original.json',
    label_filename: 'MNIST-TEST_label.json',
    n_label: 'not-applied',
    emb_name: 'PCA',
    emb_params: {'param1': 111, 'param2': 222, 'param3': 222, 'param4': 222, 'param5': 222}
  }
  printParam = (obj) => {
    let txt = '';
    for (let x in obj){
      txt+= x + "&nbsp;&nbsp;:&nbsp;&nbsp;" + obj[x] + '<br/>';
    }
    txt += ""
    return parse(txt);
  }
  spacing = (num) => {
    let txt = '';
    for (let x = 0; x < num; x++){
      txt+= "&nbsp;"
    }
    return parse(txt);
  }

  render() {
    return (
      <div id="control" className='Tab'>
         <div id="title">
         Control
         </div>
        <div id="header"><b>DATASET</b></div>
        <div id="fileIO">
          <button>Load Original Data</button>
          {this.spacing(4)}
          <button>Load Label Data</button>
        </div>
        <div id="body" style={{fontSize:'13px'}}>
          original-data{this.spacing(2)}:{this.spacing(2)}{this.state.df_filename}<br/>
          label-data{this.spacing(2)}:{this.spacing(2)}{this.state.label_filename}

        </div>

        <div id="header"><b>EMBEDDING</b></div>
        <div id="body">asdf</div>
      </div>
    );
  }
}
export default ControlTab;