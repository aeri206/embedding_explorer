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
    const minimapRatio = 0.8;
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

  const makeView = (scale) => {
  }


    useEffect(() => {

        svgMainView = d3.select("#scatterplot" + props.dataset + props.method);

        svgMainView.append("rect")
            .attr("width", width + margin.hor * 2)
            .attr("height", height  + margin.ver * 2)
            .style("fill-opacity", 0)
            .style("stroke", "black")
            .style("stroke-width", 2);

        gMainView = svgMainView.attr("width", width + margin.hor * 2)
                    .attr("height", height + margin.ver * 2)
                    .append("g")
                    .attr("id", "scatterplot_g_" + props.dataset + props.method) // gCam이랑 동일.
                    .attr("transform", "translate(" + margin.hor + ", " + margin.ver + ")");
        

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

        svgMainView.on("wheel", e => {
            console.log(e.deltaX, e.deltaY, e.deltaMode);
            let trans = gMainView.attr("transform");
            if (!trans.includes("scale")){
                gMainView.attr("transform","scale(1.00) " + trans);
                trans = gMainView.attr("transform");
            }
            if (e.deltaY < 0){ // scale 줄임
                
                gMainView.attr("transform-origin", `${e.offsetX}px ${e.offsetY}px`);
                
                let zoom = parseFloat(trans.substr(6,4));
                if (zoom > 1.0) {
                    gMainView.attr("transform", `scale(${(zoom - 0.05).toFixed(2)}) ${trans.substr(11)}`)
                }
                
            }
            else { // scale ++;
                
                gMainView.attr("transform-origin", `${e.offsetX}px ${e.offsetY}px`);
                let zoom = parseFloat(trans.substr(6,4));
                if (zoom < 10.0) {
                    gMainView.attr("transform", `scale(${(zoom + 0.05).toFixed(2)}) ${trans.substr(11)}`)
                }

            }
            // gMainView.attr("transform", "scale(1.1)")
            console.log(gMainView.attr('transform-origin'))
        })


        // const gBrush = d3.select("#minimap")
        // .append('g').attr('id', 'gBrush');

        // gBrush.call(brush);

        // brush.move(gBrush, [
        //     [0,0],

        //     [width, height] // zooming scale 추가하면 될.듯!
        // ]);

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
            <svg id="minimap"></svg>
        </div>
    );
};

export default Explorer;