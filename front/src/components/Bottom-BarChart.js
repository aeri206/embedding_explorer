import React, { useEffect, useState } from 'react';

import * as d3 from 'd3';


let xAxis, yAxis, x, y, series, svgLeft, svgRight, tooltipLeft, tooltipRight;

const width = 800;
const height = 100;
const margin = {top : 10, left : 60, bottom : 30, right : 30};




const BottomBarChart = (props) => {

    const [isCountLeft, setCountLeft] = useState(true);
    const [isVisible, setVisible] = useState(false);
    const [isCountRight, setCountRight] = useState(true);

    const onChangeLeft = e => {
        if (e.target.value == "count"){
            setCountLeft(true);
        }
        else setCountLeft(false);
    }

    const onChangeRight = e => {
        if (e.target.value == "count"){
            setCountRight(true);
        }
        else setCountRight(false);
    }
    
    const {data, label, points, update, colorScale} = props;
    let {missingPoints} = props;

    const res = label.reduce((a,b)=> (a[b]=0,a),{});

    let cnt_data = [{name:"false", ...res, }, {name:"missing", ...res}];
    let val_data = [{name:"false", ...res, }, {name:"missing", ...res}];

    svgLeft = d3.select("#bottomBarChart").attr("width", `${width / 2}px`);
    svgRight = d3.select("#bottomResultBarChart").attr("width", `${width / 2}px`);


    useEffect(() => {
        svgLeft.selectAll("g").remove();
        svgRight.selectAll("g").remove();
        setVisible(false);
        if (update){
            setVisible(true);

            points.forEach(n => {
                if (data[n].missing > 0){ // missing
                    val_data[1][data[n].label] += data[n].missing;
                    cnt_data[1][data[n].label] += 1;
                }
                if (data[n].false > 0){ 
                    val_data[0][data[n].label] += data[n].false;
                    cnt_data[0][data[n].label] += 1;
                }
            });

            
            x = d3.scaleLinear()
                .range([margin.left, (width - margin.right) / 2]);

                
            if (isCountLeft) {
                series = d3.stack()
                .keys(label)(cnt_data)
                .map(d => (d.forEach(v => v.key = d.key), d));
                x.domain([0,points.length]);
            }
            else {
                series = d3.stack()
                .keys(label)(val_data)
                .map(d => (d.forEach(v => v.key = d.key), d));
                x.domain([0, d3.max(val_data.map(d => Object.values(d).reduce((a, b) => a+(isNaN(parseFloat(b))?0:parseFloat(b)))))]);
            }

            y = d3.scaleBand()
                .domain(["missing", "false"])
                .range([margin.top, height - margin.bottom])
                .padding(0.08);


            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))

            yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            
        // svg.attr("viewBox", [0, 0, width, height]);


            svgLeft.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", (d, i) => y(d.data.name))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("height", y.bandwidth())
                .on("mouseover", function() { tooltipLeft.style("display", null); })
                .on("mouseout", function() { tooltipLeft.style("display", "none"); })
                .on("mousemove", function(d) {
                    tooltipLeft.attr("transform", `translate(${d.offsetX - 30}, ${d.offsetY - 25} )`);
                    tooltipLeft.select("text").text(d.target.getAttribute("text"));
                })
                .attr("text", d => `${d.key}: ${isCountLeft? parseInt((d[1] - d[0])) : (d[1] - d[0]).toFixed(3)}`)

                svgLeft.append("g")
                    .attr("class", "x-axis")
                    .call(xAxis);

                svgLeft.append("g")
                    .attr("class", "y-axis")
                    .call(yAxis);

                    tooltipLeft = svgLeft.append("g")
                .attr("class", "tooltip")
                .style("display", "none");
                      
                tooltipLeft.append("rect")
                    .attr("width", 60)
                    .attr("height", 20)
                    .attr("fill", "white")
                    .style("opacity", 0.5);
                  
                    tooltipLeft.append("text")
                    .attr("x", 5)
                    .attr("dy", "1.2em")
                    .style("text-anchor", "start")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold");


                    missingPoints = Object.keys(missingPoints);
                    cnt_data = [{name:"false", ...res, }, {name:"missing", ...res}];
                    val_data = [{name:"false", ...res, }, {name:"missing", ...res}];

                    missingPoints.forEach(n => {
                        if (data[n].missing > 0){ // missing
                            val_data[1][data[n].label] += data[n].missing;
                            cnt_data[1][data[n].label] += 1;
                        }
                        if (data[n].false > 0){ 
                            val_data[0][data[n].label] += data[n].false;
                            cnt_data[0][data[n].label] += 1;
                        }
                    });


                    x = d3.scaleLinear()
                .range([margin.left, (width - margin.right) / 2]);

                
            if (isCountRight) {
                series = d3.stack()
                .keys(label)(cnt_data)
                .map(d => (d.forEach(v => v.key = d.key), d));
                x.domain([0,missingPoints.length]);
            }
            else {
                series = d3.stack()
                .keys(label)(val_data)
                .map(d => (d.forEach(v => v.key = d.key), d));
                x.domain([0, d3.max(val_data.map(d => Object.values(d).reduce((a, b) => a+(isNaN(parseFloat(b))?0:parseFloat(b)))))]);
            }

            y = d3.scaleBand()
                .domain(["missing", "false"])
                .range([margin.top, height - margin.bottom])
                .padding(0.08);


            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))

            yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            
        // svg.attr("viewBox", [0, 0, width, height]);


            svgRight.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", d => x(d[0]))
                .attr("y", (d, i) => y(d.data.name))
                .attr("width", d => x(d[1]) - x(d[0]))
                .attr("height", y.bandwidth())
                .on("mouseover", function() { tooltipRight.style("display", null); })
                .on("mouseout", function() { tooltipRight.style("display", "none"); })
                .on("mousemove", function(d) {
                    tooltipRight.attr("transform", `translate(${d.offsetX - 30}, ${d.offsetY - 25} )`);
                    tooltipRight.select("text").text(d.target.getAttribute("text"));
                })
                .attr("text", d => `${d.key}: ${isCountRight? parseInt((d[1] - d[0])) : (d[1] - d[0]).toFixed(3)}`)

                svgRight.append("g")
                    .attr("class", "x-axis")
                    .call(xAxis);

                svgRight.append("g")
                    .attr("class", "y-axis")
                    .call(yAxis);

                    tooltipRight = svgRight.append("g")
                .attr("class", "tooltip")
                .style("display", "none");
                      
                tooltipRight.append("rect")
                    .attr("width", 60)
                    .attr("height", 20)
                    .attr("fill", "white")
                    .style("opacity", 0.5);
                  
                    tooltipRight.append("text")
                    .attr("x", 5)
                    .attr("dy", "1.2em")
                    .style("text-anchor", "start")
                    .attr("font-size", "12px")
                    .attr("font-weight", "bold");
                    
            
        }
    },[props.update, isCountLeft, isCountRight]);


    return (
        <div id="detailview">
            <div className="section-title bottom" style={{width:`${(width / 2) - 140}px`, display:"inline-block"}}>Selected Label Distribution</div>
            <select class="selection-info-view" onChange={onChangeLeft} style={{visibility:`${isVisible? "visible":"hidden"}`}}>
                <option value="count">Count</option>
                <option value="value">Value</option>
            </select>
            <div className="section-title bottom" style={{width:`${(width / 2) - 140}px`, display:"inline-block"}}>Missing Points Label Distribution</div>
            <select class="selection-info-view" onChange={onChangeRight} style={{visibility:`${isVisible? "visible":"hidden"}`}}>
                <option value="count">Count</option>
                <option value="value">Value</option>
            </select>
            <svg id="bottomBarChart"></svg>
            <svg id="bottomResultBarChart"></svg>
        </div>
    )
    
};

export default BottomBarChart;