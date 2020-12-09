import React, { useEffect, useState } from 'react';

import * as d3 from 'd3';


let xAxis, yAxis, x, y, series, svgLeft, svgRight, tooltipLeft, tooltipRight;

const width = 800;
const height = 150;
const margin = {top : 10, left : 60, bottom : 30, right : 30};

const tooltipMaxLen = 200;




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

    let cnt_data = [{name: "all", ...res}, {name:"false", ...res, }, {name:"missing", ...res}];
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
                cnt_data[0][data[n].label] += 1;

                if (data[n].missing > 0){ // missing
                    val_data[1][data[n].label] += data[n].missing;
                    cnt_data[2][data[n].label] += 1;
                }
                if (data[n].false > 0){ 
                    val_data[0][data[n].label] += data[n].false;
                    cnt_data[1][data[n].label] += 1;
                }
            });

            let series_cnt_left, series_val_left;
            
            series_cnt_left = d3.stack().keys(label)(cnt_data).map(d => (d.forEach(v => v.key = d.key), d));;
            series_val_left = d3.stack().keys(label)(val_data).map(d => (d.forEach(v => v.key = d.key), d));;

            
            
            const getTitle = (label, category) => {
                if (category == "all"){
                    let c = series_cnt_left[label][0];
                    return (`Label : ${label}, Count : ${parseInt(c[1]-c[0])}`); // Label 1, Count : 10, Val : 
                }
                else {
                    let c = series_cnt_left[label][`${(category === "false"? 1 : 2)}`];
                    let v = series_val_left[label][`${(category === "false"? 0 : 1)}`];
                    return (`Label: ${label}, Count: ${parseInt(c[1] - c[0])}, Value : ${(v[1] - v[0]).toFixed(3)}`)
                }

            };
            
            x = d3.scaleLinear()
                .range([margin.left, (width - margin.right) / 2]);

                
            y = d3.scaleBand()
                .range([margin.top, height - margin.bottom])
            .padding(`${isCountLeft? 0.08 : 0.2}`);

                
            if (isCountLeft) {
                series = series_cnt_left;
                x.domain([0,points.length]);
                y.domain(["missing", "false", "all"])
            }
            else {
                series = series_val_left;
                x.domain([0, d3.max(val_data.map(d => Object.values(d).reduce((a, b) => a+(isNaN(parseFloat(b))?0:parseFloat(b)))))]);
                y.domain(["missing", "false"])
            }


            xAxis = g => g
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(x))

            yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickSizeOuter(0))
                .call(g => g.selectAll(".domain").remove());

            
        // svg.attr("viewBox", [0, 0, width, height]);
// d : arr
// 0: 122
// 1: 137
// data: {0: 31, 1: 0, 2: 16, 3: 40, 4: 0, 5: 27, 6: 8, 7: 0, 8: 15, 9: 0, name: "all"}
// key: 8
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
                .on("mouseover", function(e, d) {
                    tooltipLeft.style("display", null); 
                    if (d.data.name === "all"){
                        let contours = document.querySelector(`#scatterplot_contour_point_g_${props.dataset}_${props.method}`);
                        contours.querySelectorAll("circle").forEach(c => {c.style.opacity = 0.1;});
                        contours.querySelectorAll(`.label${d.key}`).forEach(c => {c.style.opacity = 1;});
                    }
            })
                .on("mouseout", function(e,d) { tooltipLeft.style("display", "none");
                if (d.data.name === "all"){
                    let contours = document.querySelector(`#scatterplot_contour_point_g_${props.dataset}_${props.method}`);
                    contours.querySelectorAll("circle").forEach(c => {c.style.opacity = 1;});
                }
            })
                .on("mousemove",function(e, d) {
                    tooltipLeft.select("rect").attr("width",`${d.data.name === "all" ? 130 : tooltipMaxLen}`)
                    tooltipLeft.attr("transform", 
                        `translate(${d3.min([e.offsetX - 30, (width - margin.right ) / 2 - (d.data.name === "all" ? 130 : tooltipMaxLen)])},
                        ${e.offsetY - 25} )`);
                    tooltipLeft.select("text").text(getTitle(d.key, d.data.name));
                })
                
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


            let seriesc_cnt_right, series_val_right;
                    
            seriesc_cnt_right = d3.stack().keys(label)(cnt_data).map(d => (d.forEach(v => v.key = d.key), d));;
            series_val_right = d3.stack().keys(label)(val_data).map(d => (d.forEach(v => v.key = d.key), d));;

            
            x = d3.scaleLinear()
                .range([margin.left, (width - margin.right) / 2]);
            
            const getTitleRight = (label, category) => {
                let c = seriesc_cnt_right[label][`${(category === "false"? 0 : 1)}`];
                let v = series_val_right[label][`${(category === "false"? 0 : 1)}`];
                return (`Label: ${label}, Count: ${parseInt(c[1] - c[0])}, Value : ${(v[1] - v[0]).toFixed(3)}`)

            }

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
                .padding(0.2);


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
                .on("mousemove", function(e, d) {
                    tooltipRight.attr("transform", `translate(${d3.min([e.offsetX - 30, (width - margin.right ) / 2 - tooltipMaxLen])}, ${e.offsetY - 25} )`);
                    tooltipRight.select("text").text(getTitleRight(d.key, d.data.name));
                })

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
                    .attr("width", tooltipMaxLen)
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
            <div className="section-title bottom" style={{width:`${(width / 2) - 140}px`, display:"inline-block"}}>Selected Points Label Distribution</div>
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