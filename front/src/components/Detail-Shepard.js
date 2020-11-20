import React, { Component } from 'react';
import HeatMap from 'react-heatmap-grid';


const N = 50; const plotHeight= 300;



class ShepardDiagram extends Component {

  state = {
    xLabels : new Array(N).fill(0).map((_, i) => `${i}`),
    // yLabels : new Array(N).fill(0).map((_, i) => (i % 10 === 0 ? `${i}` : "")),
    yLabels : new Array(N).fill(''),
    data_orig : [[0,0],[2,2],[3,3],[4,4]],
    data_emb : [[0,2],[1,1],[2,2],[2,3]],
    shepard_data : new Array(N).fill(0)
              .map(() => new Array(N).fill(0).map(() => Math.floor(Math.random() * 100))
    )

  
  };

  eucDistance = (a, b) => {
    return a
        .map((x, i) => Math.abs( x - b[i] ) ** 2) // square the difference
        .reduce((sum, now) => sum + now) // sum
        ** (1/2)
  }

  shepardMatrix = (data_orig, data_emb) => {
    let shepard_data = new Array(N).fill(0).map(() => new Array(N).fill(0));
    let dist_orig = []; let dist_emb = [];
    for (let i=0; i < data_orig.length; i++){
      for (let j=i+1; j < data_orig.length; j++){
        dist_orig.push(this.eucDistance(data_orig[i], data_orig[j]));
        dist_emb.push(this.eucDistance(data_emb[i], data_emb[j]));
      }
    }
    let xmin=Math.min.apply(null, dist_orig); let xdel=Math.max.apply(null, dist_orig) - xmin + 1e-10; 
    let ymin=Math.min.apply(null, dist_emb); let ydel=Math.max.apply(null, dist_emb) - xmin + 1e-10; 
    let m,n;
    for (let i=0; i<dist_emb.length; i++){
      m = Math.ceil((dist_orig[i]-xmin)/xdel*(N-1));
      n = (N-1) - Math.ceil((dist_emb[i]-ymin)/ydel*(N-1));
      shepard_data[m][n] += 1;
    }
    // console.log(shepard_data)


    return shepard_data;
  }


  // xLabelsVisibility = new Array(N).fill(0).map((_, i) => (i % 10 === 0 ? true : false));
  xLabelsVisibility = new Array(N).fill(false);

  onClick = (x, y) => alert(`Clicked ${x}, ${y}.`)

  cellStyle = (background, value, min, max, data, x, y) => ({
    background: `rgb(170, 5, 5, ${1 - (max - value) / (max - min)})`,
    fontSize: "5px",
    color: "#444",
    margin: 0
  })

  // cellRender = (value) => value && <div>{value}</div>
  cellRender = (value) => {}

  render() {
    return (
      <div name="heatmap" className='Shepard'>
        <HeatMap name="plot"
          // background={"#329fff"}
          xLabels={this.state.xLabels}
          yLabels={this.state.yLabels}
          xLabelsLocation={"bottom"} xLabelsVisibility={this.xLabelsVisibility}
          xLabelWidth={0} yLabelWidth={0}
          data={this.state.shepard_data}
          // data={this.shepardMatrix(this.state.data_orig, this.state.data_emb)}
          onClick={this.onClick}
          squares={true}
          height={plotHeight/N}
          cellStyle={this.cellStyle}
          cellRender={this.cellRender}
        />
      </div>
    )
  }
}
export default ShepardDiagram;