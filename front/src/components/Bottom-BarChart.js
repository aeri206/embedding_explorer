import React, { useEffect } from 'react';

import * as d3 from 'd3';


let xAxis, yAxis, x, y, series, color, svg;

const width = 800;
const height = 200;
const margin = {top : 30, left : 50, bottom : 30, right : 30};


const BottomBarChart = (props) => {
    
    const {data, label, points, update} = props;

    const res = label.reduce((a,b)=> (a[b]=0,a),{});

    let cnt_data = [{name:"false", ...res, }, {name:"missing", ...res}];
    let val_data = [{name:"false", ...res, }, {name:"missing", ...res}];

    svg = d3.select("#bottomBarChart");


    useEffect(() => {
        if (update){
            points.forEach(n => {
                if (data[n].cont > 0){ // missing
                    val_data[1][data[n].label] += data[n].cont;
                    cnt_data[1][data[n].label] += 1;
                }
                if (data[n].trust > 0){
                    val_data[0][data[n].label] += data[n].trust;
                    cnt_data[0][data[n].label] += 1;
                }
            });

            console.log(cnt_data);
            series = d3.stack()
                .keys(label)(cnt_data)
                .map(d => (d.forEach(v => v.key = d.key), d));

            x = d3.scaleLinear()
                .domain([0,data.length])
                .range([margin.left, width - margin.right]);

            y = d3.scaleBand()
                .domain(["missing", "false"])
                .range([margin.top, height - margin.bottom])
                .padding(0.2);

            color = d3.scaleOrdinal()
                .domain(label)
                .range(d3.schemeSpectral[series.length])
                .unknown("#ccc");

            xAxis = g => g
                .attr("transform", `translate(0,${margin.top})`)
                .call(d3.axisTop(x).ticks(width / 100, "s"))
                .call(g => g.selectAll(".domain").remove());

            yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            
        svg.attr("viewBox", [0, 0, width, height]);


            svg.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => color(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", (d, i) => y(d.data.name))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("height", y.bandwidth());

                svg.append("g")
                    .call(xAxis);

                svg.append("g")
                    .call(yAxis);
            
        }
        else {
            svg.selectAll("g").remove();
        }
    },[props.update]);



    return (
        <svg id="bottomBarChart"></svg>
    )
    
};

export default BottomBarChart;