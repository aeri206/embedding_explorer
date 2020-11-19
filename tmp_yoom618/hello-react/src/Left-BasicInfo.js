import React, { Component } from 'react';
import parse from 'html-react-parser';

class BasicInfoTab extends Component {
  state = {
    df_name: 'MNIST-TEST',
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
      <div id="basic-info" className='Tab'>
         <div id="title">
         Basic Information
         </div>
        <div id="header"><b>DATASET</b>{this.spacing(5)}{this.state.df_name}</div>
        <div id="body">label{this.spacing(2)}:{this.spacing(2)}{this.state.n_label}</div>
        <div id="header"><b>EMBEDDING</b>{this.spacing(5)}{this.state.emb_name}</div>
        <div id="body">{this.printParam(this.state.emb_params)}</div>
      </div>
    );
  }
}
export default BasicInfoTab;