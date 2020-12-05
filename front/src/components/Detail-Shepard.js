import React, { useState } from 'react';
import HeatMap from 'react-heatmap-grid';


const ShepardDiagram = (props) => {
  // let jsonFileName = props.dataset + "_" + props.method;
  let jsonFileName = 'mnist_sampled_50_pca';
  let distance_data = require("../json/" + jsonFileName + "_shephard.json");
  let dist_orig = Object.values(distance_data.dist_orig);
  let dist_emb = Object.values(distance_data.dist_emb);


  const N = 30; const plotHeight= 250;
  const xLabels = useState(new Array(N).fill(0).map((_, i) => `${i}`))[0];
  const yLabels = useState(new Array(N).fill(''))[0];
  const xLabelsVisibility = new Array(N).fill(false);

  const shepardMatrix = (dist_orig, dist_emb) => {
    let shepard_data = new Array(N).fill(0).map(() => new Array(N).fill(0));
    let xmin=Math.min.apply(null, dist_orig); let xdel=Math.max.apply(null, dist_orig) - xmin + 1e-10; 
    let ymin=Math.min.apply(null, dist_emb); let ydel=Math.max.apply(null, dist_emb) - ymin + 1e-10; 
    let m,n;
    for (let i=0; i<dist_emb.length; i++){
      m = Math.floor((dist_orig[i]-xmin) / xdel * N);
      n = Math.floor((dist_emb[i]-ymin) / ydel * N);
      shepard_data[m][n] += 1;
    }
    return shepard_data;
  };

  const onClick = (x, y) => alert(`Clicked ${x}, ${y}.`)
  
  const cellStyle = (background, value, min, max, data, x, y) => ({
    background: `rgb(25, 25, 112, ${1 - (max - value) / (max - min)})`,
    fontSize: "5px",
    color: "#444",
    margin: 0
  });

  // cellRender = (value) => value && <div>{value}</div>
  const cellRender = (value) => {}

  return (
    <div name="heatmap" className='Shepard'>
      <HeatMap name="plot"
        // background={"#329fff"}
        xLabels={xLabels}
        yLabels={yLabels}
        xLabelsLocation={"bottom"} xLabelsVisibility={xLabelsVisibility}
        xLabelWidth={0} yLabelWidth={0}
        data={shepardMatrix(dist_orig, dist_emb)}
        // onClick={onClick}
        squares={true}
        height={plotHeight/N}
        cellStyle={cellStyle}
        cellRender={cellRender}
      />
    </div>
  );


};


export default ShepardDiagram;