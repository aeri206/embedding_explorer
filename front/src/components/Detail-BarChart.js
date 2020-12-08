import React, { useEffect, useState }  from 'react';
import { Chart } from "react-charts";
import parse from 'html-react-parser';
// import * as d3 from 'd3';


const BarChart = (props) => {
  let jsonFileName = props.dataset + "_" + props.method;
  const [option, setOption] = useState(props.option);
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
  let false_data = point_data.map((d) => d.false.toString());
  let missing_data = point_data.map((d) => d.missing.toString());
  const label_list = Array.from(new Set(label_data)).sort((a,b)=> a - b);

  if (option==='count'){
    data = label_list.map((d) => { 
      return {
        label: d,
        data: [
          {x:"All", y: countLabel(label_data, d)}, 
          {x:"Missing", y: countLabel(label_data.filter((d,i) => missing_data[i] > threshold), d)}, 
          {x:"False", y: countLabel(label_data.filter((d,i) => false_data[i] > threshold), d)},
        ]};
    });
  }
  else{ // if option === "sum"
    data = label_list.map((d) => { 
      return {
        label: d,
        data: [
          {x: "All", y: 0.0}, 
          {x: "Missing", y: sumLabel(label_data, missing_data, d)}, 
          {x: "False", y: sumLabel(label_data, false_data, d)},
        ]};
    });
  }

  function handleChange(event) {
    setOption(event.target.value);
  }


  const [{ activeSeriesIndex, activeDatumIndex }, setState] = React.useState({
    activeSeriesIndex: -1,
    activeDatumIndex: -1
  });

  const series = React.useMemo(
    () => ({
      type: "bar"
    }),
    ["bar"]
  );

  const axes = React.useMemo(
    () => [
      { primary: true, type: "ordinal", position: "bottom"},
      { type: "linear", position: "left", stacked: false, show: false, hardMin:0}
    ],
    []
  );

  const getSeriesStyle = React.useCallback(
    series => ({
      color: `url(#${series.index % label_list.length})`,
      opacity:
        activeSeriesIndex > -1
          ? series.index === activeSeriesIndex
            ? 1
            : 0.3
          : 1
    }),
    [activeSeriesIndex]
  );

  const getDatumStyle = React.useCallback(
    datum => ({
      r:
        activeDatumIndex === datum.index && activeSeriesIndex === datum.seriesIndex
          ? 7
          : activeDatumIndex === datum.index
          ? 5
          : datum.series.index === activeSeriesIndex
          ? 3
          : datum.otherHovered
          ? 2
          : 2
    }),
    [activeDatumIndex, activeSeriesIndex]
  );

  const onFocus = React.useCallback(
    focused =>
      setState({
        activeSeriesIndex: focused ? focused.series.id : -1,
        activeDatumIndex: focused ? focused.index : -1
      }),
    [setState]
  );

  const colorScale = props.colorScale;
  function renderSVG() {
    let txt = "<defs>";
    for (let i=0; i<label_list.length; i++){
      txt += `<linearGradient id="${label_list[i]}">`
            + `<stop stop-color="${colorScale(i)}"/>`
            + "</linearGradient>";
    }
    txt += "</defs>"
    return parse(txt);
  }


  return (
    <div name="labelplot" className='BarChart'>
      <select id="selection-info-view" onChange={handleChange} style={{marginLeft:"420px"}}>
        <option value="count">Count</option>
        <option value="value">Value</option>
      </select>
      <Chart data={data} series={series} axes={axes} tooltip 
        getSeriesStyle={getSeriesStyle}
        getDatumStyle={getDatumStyle}
        onFocus={onFocus}
        setState={setState}
        activeDatumIndex={activeDatumIndex}
        activeSeriesIndex={activeSeriesIndex}
        renderSVG = {renderSVG}
      />
    </div>
  );


};



export default BarChart;