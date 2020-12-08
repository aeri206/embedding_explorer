import { range } from 'd3';
import React, { useState } from 'react';
import aaa from '../assets/mnist_sampled_10_isomap.png';

const RepositoryTab = (props) => {

  const repo_dict = [
    {dataset: "mnist_sampled_10", method: "pca", thumbnail: require("../assets/mnist_sampled_10_pca.png"), repo: NaN},
    {dataset: "mnist_sampled_10", method: "umap", thumbnail: require("../assets/mnist_sampled_10_umap.png"), repo: NaN},
    {dataset: "mnist_sampled_10", method: "isomap", thumbnail: require("../assets/mnist_sampled_10_isomap.png"), repo: NaN},
    {dataset: "mnist_sampled_10", method: "tsne", thumbnail: require("../assets/mnist_sampled_10_tsne.png"), repo: NaN},
  ]
  
  function makeButtons(){
    let items = [];
    for (let i in repo_dict){
      items.push(
        <button id="repo-button"> 
          <img src={repo_dict[i].thumbnail.default} alt={repo_dict[i].dataset+"-"+repo_dict[i].method} 
            style={{width:"200px", height:"200px", margin:"10px 0"}}/>
          <div id="repo-name" style={{transform: "translateY(-120px)"}}>
            {repo_dict[i].dataset}<br/>{repo_dict[i].method}
            </div>
        </button>
      )
    }
    return items;
  }


  return (
    <div id="repoview" className='Tab'>
      <div className="tab-title">
      Repository
      </div>
      {makeButtons()}

    </div>
  );


}

export default RepositoryTab;