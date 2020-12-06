import React from 'react';
import { Chart } from "react-charts";


const BarChart = (props) => {
  function randomNum() {return Math.ceil(Math.random()*100)};
  function countNum(df, d) {
    let count = 0;
    for (let i in df){ if (d === df[i]) count++;}
    return count;
  };

  // let jsonFileName = props.dataset + "_" + props.method;
  let jsonFileName = 'mnist_sampled_10_pca';
  let label_data = require("../json/" + jsonFileName + "_points.json");
  label_data = label_data.map((d) => d.label.toString());
  const label_list = Array.from(new Set(label_data)).sort((a,b)=> a - b);
  let data = label_list.map((d) => { 
    return {
      label: d,
      data: [
        {x:"original", y:countNum(label_data, d)}, 
        {x:"missing", y:0}, 
        {x:"false", y:0},
      ]};
  });


  const series = React.useMemo(
    () => ({
      type: "bar"
    }),
    []
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom" },
      { position: "left", type: "linear", stacked: false, show: false}
    ],
    []
  );




  return (
    <div name="labelplot" className='BarChart'>
      <Chart data={data} series={series} axes={axes} tooltip />
    </div>
  );


};


export default BarChart;