import React from 'react';
import { Chart } from "react-charts";


const BarChart = (props) => {
  let jsonFileName = props.dataset + "_" + props.method;
  const option = props.option
  const threshold = props.threshold;

  function countLabel(df, d) {
    let count = 0;
    for (let i in df){ if (d === df[i]) count++;}
    return count;
  };
  function sumLabel(df_label, df_value, target_label) {
    let sum = 0;
    if (df_value === NaN){
      for (let i in df_label){ 
        if (df_label[i] === target_label) sum += parseFloat(df_value[i]);
      }
    }else{
      for (let i in df_label){ 
        if (df_label[i] === target_label & df_value[i] > threshold) sum += parseFloat(df_value[i]);
      }
    }
    return sum;
  };

  let data;
  let point_data = require("../json/" + jsonFileName + "_points.json");
  let label_data = point_data.map((d) => d.label.toString());
  let trust_data = point_data.map((d) => d.trust.toString());
  let cont_data = point_data.map((d) => d.cont.toString());
  const label_list = Array.from(new Set(label_data)).sort((a,b)=> a - b);

  if (option==='count'){
    data = label_list.map((d) => { 
      return {
        label: d,
        data: [
          {x:"All", y: countLabel(label_data, d)}, 
          {x:"Missing", y: countLabel(label_data.filter(e => cont_data[e] > threshold), d)}, 
          {x:"False", y: countLabel(label_data.filter(e => trust_data[e] > threshold), d)},
        ]};
    });
  }
  else{ // if option === "sum"
    data = label_list.map((d) => { 
      return {
        label: d,
        data: [
          {x: "All", y: 0.0}, 
          {x: "Missing", y: sumLabel(label_data, cont_data, d)}, 
          {x: "False", y: sumLabel(label_data, trust_data, d)},
        ]};
    });
  }


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