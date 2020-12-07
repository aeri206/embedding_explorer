import React, { useEffect, useState } from 'react';
import { Chart } from "react-charts";

const BottomBarChart = (props) => {
    console.log('draw')

    const {data, label, points} = props;

    
    let cnt_data = label.map((l) => {return({label: l, data:[{primary: 'missing', secondary: 0},{primary: 'false', secondary: 0}]})});
    let val_data = label.map((l) => {return({label: l, data:[{primary: 'missing', secondary: 0},{primary: 'false', secondary: 0}]})});

    const [state, setState] = useState(cnt_data);
    

    const series = React.useMemo(
        () => ({
          type: "bar"
        }),
        []
      );

      const axes = React.useMemo(
        () => [
          { primary: true, type: "ordinal", position: "left" },
          { position: "bottom", type: "linear", stacked: true }
        ],
        []
      );
    
    useEffect(() => {
        if (!props.update) return;
        
            points.forEach(n => {
                if(data[n].cont > 0){ // missing
                    val_data[label.indexOf(data[n].label.toString())].data[0].secondary += props.data[n].cont;
                    cnt_data[label.indexOf(data[n].label.toString())].data[0].secondary += 1;
                }
                if (props.data[n].trust > 0){ // false
                    val_data[label.indexOf(data[n].label.toString())].data[1].secondary += props.data[n].trust;
                    cnt_data[label.indexOf(data[n].label.toString())].data[1].secondary += 1;
                }
            });

        setState(() => cnt_data);

    },[props.update]);

    // const chart_data = React.useMemo(() => {
    //     if (props.update){
    //         points.forEach(n => {
    //             if(data[n].cont > 0){ // missing
    //                 val_data[label.indexOf(data[n].label.toString())].data[0].secondary += props.data[n].cont;
    //                 cnt_data[label.indexOf(data[n].label.toString())].data[0].secondary += 1;
    //             }
    //             if (props.data[n].trust > 0){ // false
    //                 val_data[label.indexOf(data[n].label.toString())].data[1].secondary += props.data[n].trust;
    //                 cnt_data[label.indexOf(data[n].label.toString())].data[1].secondary += 1;
    //             }
    //         });
    //     }
    //     return (val_data);
    // });
    console.log(state);

    return (
        <div id="selectionBarChart">
            <Chart data={state} series={series} axes={axes} />
        </div>
    )
    

};

export default BottomBarChart;