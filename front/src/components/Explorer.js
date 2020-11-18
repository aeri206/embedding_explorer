import React, { useEffect } from 'react';
import * as d3 from 'd3';
import { precisionFixed } from 'd3';
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
    let svgMiniMap, gMiniMap, pointMiniMap, gBrush;
    const width = 600;
    const height = 600;
    const margin = { hor: width / 20, ver: height / 20 };
    const ratio = 0.8;
    const radius = 3;

    const [minX, maxX] = d3.extent(embeddedData, d => d.emb[0]);
    const [minY, maxY] = d3.extent(embeddedData, d => d.emb[1]);

        const xScale = d3.scaleLinear()
                         .domain([minX, maxX])
                         .range([0, width]);

        const xMiniMapScale = d3.scaleLinear()
                                .domain([minX, maxX])
                                .range([0, width * ratio]);

        
        const yScale = d3.scaleLinear()
                         .domain([minY, maxY])
                         .range([0, height]);

        const yMiniMapScale = d3.scaleLinear()
                                .domain([minY, maxY])
                                .range([0, height * ratio]);


    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const Brushing = e => {
      
    // if (selection){
    //       console.log(selection);
    //       let [[x0, y0], [x1, y1]] = selection;
    //       const [minimapWidth, minimapHeight] = [x1-x0 - margin.hor, y1-y0 - margin.ver];
    //       const scale = [minimapWidth / width, minimapHeight / height];
    //       console.log(scale);
    //   }
  }

  const brush = d3.brush()
                      .extent([[0,0], [ratio * (width + 2 * margin.hor) ,ratio * (height + 2 * margin.ver)]])
                      .on('brush', Brushing);

  const getTransValue = trans => {
      const tmp = trans.split("translate(")[1].split(",");
      return [parseFloat(tmp[0]), parseFloat(tmp[1])];
  }

  const drag = (e) => {
      const dragX = (e.subject.x - e.x) * 0.05;
      const dragY = (e.subject.y - e.y) * 0.05;
      let scale;
      const trans = gMainView.attr("transform");
      let tmp = trans.split("translate(")[1].split(",");

      if (tmp[1].includes("scale")){
          scale = parseFloat(tmp[1].split("scale(")[1]);
      }
      else scale = 1.0;
      const [transX, transY] = getTransValue(gMainView.attr('transform'));
      const moveX = d3.max([d3.min([transX - dragX, margin.hor * scale]),(30 / scale) - (scale - 1.0) * width]);
      const moveY = d3.max([d3.min([transY - dragY, margin.ver * scale]),(30 / scale) - (scale - 1.0) * height]);
      gMainView.attr('transform', `translate(${moveX}, ${moveY}) scale(${scale})`);
    // TODO : brush
    brush.move(gBrush, [
        [(margin.hor * scale - moveX) * ratio / scale, (margin.ver * scale - moveY) * ratio / scale],
        [(margin.hor * scale - moveX) * ratio / scale + (width + 2 * margin.hor) * ratio / scale,
        (margin.ver * scale - moveY) * ratio / scale + (height + 2 * margin.ver) * ratio / scale],
    ])
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
                .style("padding", "10px 0 0 10px");

               
           
        svgMiniMap.append("rect")
            .attr("width", (width + margin.hor * 2) * ratio)
            .attr("height", (height + margin.ver * 2) * ratio)
            .style('fill', 'lightgrey')
            .style('fill-opacity', 0.5)
            .style("stroke", "black")
            .style("stroke-width", 2);
    

        gMiniMap = svgMiniMap.attr("width", (width + margin.hor * 2) * ratio)
            .attr("height", (height + margin.ver * 2) * ratio)
            .append("g")
            .attr("id", "minimap_g_" +  props.dataset + props.method)
            // .attr("transform", "translate(" + margin.hor + ", " + margin.ver + ")");
        

        pointMiniMap = gMiniMap
                             .append("g")
                             .attr("id", "minimap_circle_g_"+ props.dataset + props.method)
                             .attr("transform", "translate(" + ratio * margin.hor + ", " + ratio * margin.ver + ")");


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
                                    .attr("cx", d => xMiniMapScale(d.emb[0]))
                                    .attr("cy", d => yMiniMapScale(d.emb[1]))
                                    .style("opacity", 0.8)
                                    .attr("r", radius);
                            }
                        );
                        

        svgMainView.on('wheel', e => {
            let scale, newScale, newTransX, newTransY;
            const {offsetX, offsetY, wheelDelta} = e;
            const trans = gMainView.attr("transform");
            let tmp = trans.split("translate(")[1].split(",");

            if (tmp[1].includes("scale")){
                scale = parseFloat(tmp[1].split("scale(")[1]);
            }
            else scale = 1.0;
            const [transX, transY] = getTransValue(gMainView.attr('transform'));
            if (wheelDelta > 0){ // ZOOM IN
                if (scale < 5.0){
                    newScale = parseFloat(scale) + parseFloat(0.1);
                    newTransX = transX - 0.1 * (offsetX - transX) / scale;
                    newTransY = transY - 0.1 * (offsetY - transY) / scale;
                    gMainView.attr('transform', `translate(${newTransX.toFixed(3)}, ${newTransY.toFixed(3)}) scale(${newScale.toFixed(1)})`);
                    
                    brush.move(gBrush, [
                        [(margin.hor * newScale - newTransX) * ratio / newScale, (margin.ver * newScale - newTransY) * ratio / newScale],
                        [(margin.hor * newScale - newTransX) * ratio / newScale + (width + 2 * margin.hor) * ratio / newScale,
                         (margin.ver * newScale - newTransY) * ratio / newScale + (height + 2 * margin.ver) * ratio / newScale],
                    ]);
                }
            }
            else if (scale > 1.0){ // ZOOM OUT
                    newScale = parseFloat(scale) - parseFloat(0.1);
                    newTransX = transX + 0.1 * (offsetX - transX) / scale;
                    newTransY = transY + 0.1 * (offsetY - transY) / scale;
                    const moveX = d3.max([d3.min([newTransX, margin.hor * newScale]),(30 / newScale) - (newScale - 1.0) * width]);
                    const moveY = d3.max([d3.min([newTransY, margin.ver * newScale]),(30 / newScale) - (newScale - 1.0) * height]);
                    gMainView.attr('transform', `translate(${moveX.toFixed(3)}, ${moveY.toFixed(3)}) scale(${newScale.toFixed(1)})`);

                    brush.move(gBrush, [
                        [(margin.hor * newScale - moveX) * ratio / newScale, (margin.ver * newScale - moveY) * ratio / newScale],
                        [(margin.hor * newScale - moveX) * ratio / newScale + (width + 2 * margin.hor) * ratio / newScale,
                         (margin.ver * newScale - moveY) * ratio / newScale + (height + 2 * margin.ver) * ratio / newScale],
                    ]);
            }
        })

        svgMainView.call(
            d3.drag()
            .on("drag", drag));


        gBrush = svgMiniMap.append('g').attr('id', 'gBrush');
        gBrush.call(brush);
        brush.move(gBrush, [
            [0,0],
            [(width + 2 * margin.hor) * ratio, (height + 2 * margin.ver) * ratio]
        ]);

        svgMiniMap.selectAll('.handle').remove();
        svgMiniMap.selectAll('.overlay').remove();



            
        
    }, [])
    return (
        <div>
            <svg id={"scatterplot" + props.dataset + props.method}></svg>
            <svg id="minimap" ></svg>
        </div>
    );
};

export default Explorer;