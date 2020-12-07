import React, { useState, useEffect } from 'react'
import * as d3 from 'd3';
import { svg } from 'd3';

const CompareViewComponent = (props) => {

    let jsonFileName = props.dataset + "_" + props.method;
    let pointsData = require("../json/" + jsonFileName + "_points.json");
    console.log(pointsData);
    const colorScale = props.colorScale

    const radius = 1;

    let width = props.width
    let height = props.height
    const margin = { hor: 15, ver: 15 };

    const [minX, maxX] = d3.extent(pointsData, d => d.coor[0]);
    const [minY, maxY] = d3.extent(pointsData, d => d.coor[1]);

    const xScale = d3.scaleLinear()
                        .domain([minX, maxX])
                        .range([0, width]);
    
    const yScale = d3.scaleLinear()
                        .domain([minY, maxY])
                        .range([0, height]);
    
    let compareSvg;
    
    let compareSvgPoints;
    let svgSelectedPoints;
    let svgHeighlightedPoints;

    useEffect(() => {
        compareSvg = d3.select("#" + props.method+ "_compare")
                            .attr("width", width + margin.hor * 2)
                            .attr("height", height + margin.ver * 2);
        
        compareSvgPoints = compareSvg.append("g").attr("id", props.method+ "_compare_points");
        svgSelectedPoints = compareSvg.append("g").attr("id", props.method+ "_compare_selected");
        svgHeighlightedPoints = compareSvg.append("g").attr("id", props.method+ "_compare_highlighted");
        compareSvgPoints.selectAll("circle")
                        .data(pointsData)
                        .join(
                            enter => enter.append("circle")
                                        .attr("fill", d => colorScale(d.label))
                                        .style("opacity", 0.4)
                                        .attr("r", radius)
                                        .attr("cx", d => xScale(d.coor[0]))
                                        .attr("cy", d => yScale(d.coor[1]))

                        );

    }, [])

    useEffect(() => {
        console.log(props.update)
        console.log(props.points)



        if(props.update) {   // if new selection
            d3.select("#" + props.method+ "_compare_selected").selectAll("circle")
                             .data(props.points)
                             .enter()
                             .append("circle")
                             .attr("fill", "blue")
                             .attr("r", radius *1.5)
                             .attr("cx", i => xScale(pointsData[i].coor[0]))
                             .attr("cy", i => yScale(pointsData[i].coor[1]))
            
        }
        else {
            // svgSelectedPoints.selectAll("circle").remove()
        }

    }, [props.update])

                                     
    

    



    return (
        <div>
            {props.method}
            <svg id={props.method + "_compare"}>

            </svg>
        </div>
    )
}

export default CompareViewComponent;