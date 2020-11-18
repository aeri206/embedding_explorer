import React, { useEffect } from 'react';
import * as d3 from 'd3';
// import axios from 'axios';
const Explorer = (props) => {


    let jsonFileName = props.dataset + "_" + props.method;
    let data = require("../json/" + jsonFileName + ".json");
    let missingData = require("../json/" + jsonFileName + "_missing.json");
    let falseData = require("../json/" + jsonFileName + "_false.json");
    let knnData = require("../json/" + jsonFileName + "_knn.json");
    

    const embeddedData = data.map((d, i) => {
        let embeddedDatum = {
            "raw": d.raw,
            "emb": d.emb,                      // 2D Coordinate
            "idx": i,                           // Current Index
            "missingData": missingData[i],  // Missing points dictionary
            "falseData": falseData[i]        // Power / direction of false value
        }
        return embeddedDatum;
    });

    let svg, svgPoints, svgEdges;
    let svgMainView, gMainView, pointMainView;
    let svgMiniMap, gMiniMap, pointMiniMap;
    const width = 600;
    const height = 600;
    const margin = { hor: width / 20, ver: height / 20 };
    const ratio = 0.05;
    const radius = 3;

    const [minX, maxX] = d3.extent(embeddedData, d => d.emb[0]);
    const [minY, maxY] = d3.extent(embeddedData, d => d.emb[1]);

        const xScale = d3.scaleLinear()
                         .domain([minX, maxX])
                         .range([0, width]);
        
        const yScale = d3.scaleLinear()
                         .domain([minY, maxY])
                         .range([0, height]);


    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const brush = d3.brush()
                      .extent([[0,0], [width,height]])
                      .on('brush', Brushing);


  function Brushing({selection}){
      
    if (selection){
          console.log(selection);
          let [[x0, y0], [x1, y1]] = selection;
          const [minimapWidth, minimapHeight] = [x1-x0 - margin.hor, y1-y0 - margin.ver];
          const scale = [minimapWidth / width, minimapHeight / height];
          console.log(scale);
      }

  }

    useEffect(() => {

        svgMainView = d3.select("#scatterplot" + props.dataset + props.method);

        

        gMainView = svgMainView.attr("width", width + margin.hor * 2)
                    .attr("height", height + margin.ver * 2)
                    .append("g")
                    .attr("id", "scatterplot_g_" + props.dataset + props.method) // gCam이랑 동일.
                    .attr("transform", "translate(" + margin.hor + ", " + margin.ver + ")");
        

        svgMainView.append("rect")
            .attr("width", width + margin.hor * 2)
            .attr("height", height  + margin.ver * 2)
            .style("fill-opacity", 0)
            .style("stroke", "black")
            .style("stroke-width", 2);

        pointMainView = gMainView.append("g")
                    .attr("id", "circle_g_" + props.dataset + props.method); // stageChart 동일한 역할.

        // points
        pointMainView.selectAll("circle")
                         .data(embeddedData)
                         .join(
                             enter => {
                                 enter.append("circle")
                                     .attr("class", d => "circle" + d.idx.toString())
                                     .attr("fill", d => {
                                         if (props.isLabel) return colorScale(data[d.idx].label);
                                         else return "black"; 
                                     })
                                     .attr("cx", d => xScale(d.emb[0]))
                                     .attr("cy", d => yScale(d.emb[1]))
                                     .style("opacity", 0.8)
                                     .attr("r", radius);
                             }
                         );

        svgMiniMap = d3.select("#minimap")
                .style("margin", "10px 0 0 10px");

               
           
        svgMiniMap.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill-opacity",0)
            .style("stroke", "black")
            .style("stroke-width", 2);

        svgMiniMap
            .append('rect')
            .attr("width", width)
            .attr("height", height)
            .style('fill', 'lightgrey')
            .style('fill-opacity', 0.5);

        gMiniMap = svgMiniMap.attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("id", "minimap_g_" +  props.dataset + props.method)
            // .attr("transform", "translate(" + margin.hor + ", " + margin.ver + ")");
        

        pointMiniMap = gMiniMap
                             .append("g")
                             .attr("id", "minimap_circle_g_"+ props.dataset + props.method);


        pointMiniMap.selectAll("circle")
                        .data(embeddedData)
                        .join(
                            enter => {
                                enter.append("circle")
                                    .attr("class", d => "circle" + d.idx.toString())
                                    .attr("fill", d => {
                                        if (props.isLabel) return colorScale(data[d.idx].label);
                                        else return "black"; 
                                    })
                                    .attr("cx", d => xScale(d.emb[0]))
                                    .attr("cy", d => yScale(d.emb[1]))
                                    .style("opacity", 0.8)
                                    .attr("r", radius);
                            }
                        );
        // d3.select('#minimap')
                        
        svgMainView.on('wheel', e => {
            let trans, scale, transX, transY;
            let originX,originY;
            trans = pointMainView.attr('transform');
            if (trans == null){
                scale = 1.0;
                transX = 0.0;
                transY = 0.0;
            }
            else { // parsing
                scale = parseFloat(trans.substr(6,3)).toFixed(1);
                let [tmpX, tmpY] = trans.split("(")[2].split(",")
                transX = parseFloat(tmpX).toFixed(2);
                transY = parseFloat(tmpY).toFixed(2);
                // console.log(transX, transY);

            }
            console.log(e);
            originX = (e.offsetX - margin.hor - transX) / scale;
            originY = (e.offsetY - margin.ver - transY) / scale;
            
            if (e.wheelDelta > 0){ // zoom-in    
                transX = transX - parseFloat(0.1 * originX);
                transY = transY - parseFloat(0.1 * originY);
                // console.log(transX, transY)
                let newScale = (parseFloat(scale) + 0.1).toFixed(1);
                pointMainView.attr('transform', `scale(${newScale}) translate(${transX.toFixed(2)}, ${transY.toFixed(2)})`);
                console.log(originX, originY);
                (offsetX - margin.hor) / scale;
                brush.move(gBrush, [
                    [0,0],[width / 2, height / 2]]);

            }
            else { // zoom-out
                transX = parseFloat(transX) + parseFloat(0.1 * originX);
                transY = parseFloat(transY) + parseFloat(0.1 * originY);
                console.log(transX, transY)
                let newScale = (parseFloat(scale) - 0.1).toFixed(1);
                pointMainView.attr('transform', `scale(${newScale}) translate(${transX.toFixed(2)}, ${transY.toFixed(2)})`);


            }
            
        }, true)


        const gBrush = d3.select("#minimap")
        .append('g').attr('id', 'gBrush');

        gBrush.call(brush);

        brush.move(gBrush, [
            [0,0],

            [width, height] // zooming scale 추가하면 될.듯!
        ]);

        // minimap에도 그리고
        // zoom
        //

            
        
    }, [])
    // const loading = async () => {

    //     axios
    //         .get("/data/")
    //         .then(data => {
    //             console.log(data);
    //         })
    //         .catch(e => {
    //             console.log(e);

    //         });
    // };

    return (
        <div>
            <svg id={"scatterplot" + props.dataset + props.method}></svg>
            <svg id="minimap" ></svg>
        </div>
    );
};

export default Explorer;