import React, { useEffect, useState } from 'react';
import HeatMap from 'react-heatmap-grid';
import * as d3 from 'd3';


const ShepardDiagram = (props) => {
  let jsonFileName = props.dataset + "_" + props.method;
  // jsonFileName = "mnist_sampled_50_pca"
  let distance_data = require("../json/" + jsonFileName + "_shepard.json");
  // let dist_orig = Object.values(distance_data.dist_orig);
  // let dist_emb = Object.values(distance_data.dist_emb);


  const N = 20; const plotHeight= 190;
  const xLabels = useState(new Array(N).fill(0).map((_, i) => `${i}`))[0];
  const yLabels = useState(new Array(N).fill(''))[0];
  const xLabelsVisibility = new Array(N).fill(false);

  // const shepardMatrix = (dist_orig, dist_emb) => {
  //   let shepard_data = new Array(N).fill(0).map(() => new Array(N).fill(0));
  //   let xmin=Math.min.apply(null, dist_orig); let xdel=Math.max.apply(null, dist_orig) - xmin + 1e-10; 
  //   let ymin=Math.min.apply(null, dist_emb); let ydel=Math.max.apply(null, dist_emb) - ymin + 1e-10; 
  //   let m,n;
  //   for (let i=0; i<dist_emb.length; i++){
  //     m = Math.floor((dist_orig[i]-xmin) / xdel * N);
  //     n = Math.floor((dist_emb[i]-ymin) / ydel * N);
  //     shepard_data[m][n] += 1;
  //   }
  //   return shepard_data;
  // };
  let matrix = [];
  for (let i = 19; i >= 0; i--) {
    let current = []
    for (let j = 0; j < 20; j++) {
      current.push(distance_data[i + "_" + j])
    }
    matrix.push(current)
  }
  // console.log(shepardMatrix(dist_orig, dist_emb))

  // const onClick = (x, y) => alert(`Clicked ${x}, ${y}.`)
  
  const cellStyle = (background, value, min, max, data, x, y) => ({
    background: `rgb(25, 25, 112, ${1 - (max - value) / (max - min)})`,
    fontSize: "5px",
    color: "#444",
    margin: 0
  });

  const cellRender = (value) => {}


  useEffect(() => {


    let shepardAxisSvg = d3.select("#shepard-axis")
    let xAxis = d3.axisBottom(d3.scaleLinear().domain([0, 1]).range([0, plotHeight]));

    shepardAxisSvg.append("g") 
                  .attr("transform", `translate(30, ${plotHeight+30})`)
                  .call(xAxis)
    
    let yAxis = d3.axisLeft(d3.scaleLinear().domain([0, 1]).range([plotHeight, 0]));


    shepardAxisSvg.append("g")
                  .attr("transform", "translate(30,30)")
                  .call(yAxis)
  }, [])

  const shepardContainerStyle = {

  };

  


  return (
    <div name="heatmap" className='Shepard' style={shepardContainerStyle}>
      <div className="section-title">
                    Shepard Diagram</div>
      
      <svg id={"shepard-axis"} style={{position: 'absolute'}} 
        transform={"translate(-30, -30)"} height={plotHeight+50} width={plotHeight+40}> 
      </svg>
      <div>
        <HeatMap name="plot"
          // background={"#329fff"}
          xLabels={xLabels}
          yLabels={yLabels}
          xLabelsLocation={"bottom"} xLabelsVisibility={xLabelsVisibility}
          xLabelWidth={0} yLabelWidth={0}
          data={matrix}
          // onClick={onClick}
          squares={true}
          height={plotHeight/N}
          cellStyle={cellStyle}
          cellRender={cellRender}
      />
      </div>
      
    </div>
  );


};


export default ShepardDiagram;