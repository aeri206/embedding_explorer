import React, { useEffect } from 'react';
import * as d3 from 'd3';
// import axios from 'axios';
const Explorer = (props) => {


    let jsonFileName = props.dataset + "_" + props.method;
    let data = require("../json/" + jsonFileName + ".json");
    let missingData = require("../json/" + jsonFileName + "_missing.json");
    let falseData = require("../json/" + jsonFileName + "_false.json");
    // let knnData = require("../json/" + jsonFileName + "_knn.json");
    

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

    // let svg, svgPoints, svgEdges;
    let svgMainView, gMainView;
    let svgMiniMap, gBrush;
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
    
    const yScale = d3.scaleLinear()
                         .domain([minY, maxY])
                         .range([0, height]);


    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    
    const getTransformValue = () => {
        const trans = gMainView.attr('transform');
        const tmp = trans.split("translate(")[1].split(",");

        if (tmp[1].includes("scale")){
            return [parseFloat(tmp[1].split("scale(")[1]),
                    parseFloat(tmp[0]),
                    parseFloat(tmp[1])];
        }
        else return [1.0,parseFloat(tmp[0]),parseFloat(tmp[1])];

    }

  function Brushing({selection}) {
    let scale = getTransformValue()[0];
    
    if (selection){
          let [x0, y0] = selection[0];
          let moveX = margin.hor * scale - x0 * scale / ratio;
          let moveY = margin.ver * scale - y0 * scale / ratio;
          gMainView.attr('transform', `translate(${moveX}, ${moveY}) scale(${scale})`);
      }
  }

  const brush = d3.brush()
                      .extent([[0,0], [ratio * (width + 2 * margin.hor) ,ratio * (height + 2 * margin.ver)]])
                      .on('brush', Brushing);

  const drag = (e) => {
      const dragX = (e.subject.x - e.x) * 0.05;
      const dragY = (e.subject.y - e.y) * 0.05;
      const [scale, transX, transY] = getTransformValue();
      const moveX = d3.max([d3.min([transX - dragX, margin.hor * scale]),(30 / scale) - (scale - 1.0) * width]);
      const moveY = d3.max([d3.min([transY - dragY, margin.ver * scale]),(30 / scale) - (scale - 1.0) * height]);
      gMainView.attr('transform', `translate(${moveX}, ${moveY}) scale(${scale})`);
    
    brush.move(gBrush, [
        [(margin.hor * scale - moveX) * ratio / scale, (margin.ver * scale - moveY) * ratio / scale],
        [(margin.hor * scale - moveX) * ratio / scale + (width + 2 * margin.hor) * ratio / scale,
        (margin.ver * scale - moveY) * ratio / scale + (height + 2 * margin.ver) * ratio / scale],
    ])
  }

  const drawPlot = (ratio, prefix) => { // prefix : scatterplot, minimap
    let svg = d3.select(`#${prefix}_` + props.dataset + props.method);
    let g = svg.attr("width", (width + margin.hor * 2) * ratio)
                .attr("height", (height + margin.ver * 2) * ratio)
                .append("g")
                .attr("id",`${prefix}_g_` + props.dataset + props.method)
                .attr("transform", "translate(" + ratio * margin.hor + ", " + ratio * margin.ver + ")");

    svg.append("rect")
        .attr("width", (width + margin.hor * 2) * ratio)
        .attr("height", (height + margin.ver * 2) * ratio)
        .style("stroke", "black")
        .style("stroke-width", 2);

    let point = g.append("g")
                 .attr("id", `${prefix}_circle_g_`+ props.dataset + props.method);

    point.selectAll("circle")
        .data(embeddedData)
        .join(
            enter => {
                enter.append("circle")
                    .attr("class", d => "circle" + d.idx.toString())
                    .attr("fill", d => {
                        if (props.isLabel) return colorScale(data[d.idx].label);
                        else return "black"; 
                    })
                    .attr("cx", d => xScale(d.emb[0]) * ratio)
                    .attr("cy", d => yScale(d.emb[1]) * ratio)
                    .style("opacity", 0.8)
                    .attr("r", radius);
            }
        );
  }
 
    useEffect(() => {
        drawPlot(1.0, "scatterplot");
        
        svgMainView = d3.select("#scatterplot_" + props.dataset + props.method);
        svgMainView.select("rect").style("fill-opacity", 0);

        gMainView = d3.select("#scatterplot_g_" + props.dataset + props.method);
        
        drawPlot(ratio, "minimap");
        svgMiniMap = d3.select("#minimap_" + props.dataset + props.method)
                .style("padding", "10px 0 0 10px");

        svgMiniMap.select("rect")
                    .style('fill', 'lightgrey')
                    .style('fill-opacity', 0.3);
                        

        svgMainView.on('wheel', e => {
            let newScale, newTransX, newTransY;
            const {offsetX, offsetY, wheelDelta} = e;
            
            const [scale, transX, transY] = getTransformValue();

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
    }, []);

    return (
        <div>
            <svg id={"scatterplot_" + props.dataset + props.method}></svg>
            <svg id={"minimap_" + props.dataset + props.method} ></svg>
        </div>
    );
};

export default Explorer;