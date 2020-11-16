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

    let svg, svgPoints, svgEdges, svgMiniMap;
    const width = 600;
    const height = 600;
    const margin = { hor: width / 20, ver: height / 20 };
    const radius = 3;


    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // const brushed = ({selection}, [i, j]) => {};
    
  function brushed({selection: [[x0, y0], [x1, y1]]}) {
      console.log(x0, y0, x1, y1)

  }

    useEffect(() => {

        let brush = d3.brush()
                      .on("start brush", brushed);


        svg = d3.select("#scatterplot" + props.dataset + props.method)
                .attr("width", width + margin.hor * 2)
                .attr("height", height + margin.ver * 2)
                .append("g")
                .attr("id", "scatterplot_g" + props.dataset + props.method)
                .attr("transform", "translate(" + margin.hor + ", " + margin.ver + ")");

        d3.select("#scatterplot" + props.dataset + props.method)
          .append("rect")
          .attr("width", width + margin.hor * 2)
          .attr("height", height  + margin.ver * 2)
          .style("fill-opacity", 0)
          .style("stroke", "black")
          .style("stroke-width", 2);

        svgPoints = svg.append("g")
                    .attr("id", "circle_g" + props.dataset + props.method);

        svgEdges = svg.append("g")
                    .attr("id", "edge_g" + props.dataset + props.method);

        const [minX, maxX] = d3.extent(embeddedData, d => d.emb[0]);
        const [minY, maxY] = d3.extent(embeddedData, d => d.emb[1]);

        const xScale = d3.scaleLinear()
                         .domain([minX, maxX])
                         .range([0, width]);
        
        const yScale = d3.scaleLinear()
                         .domain([minY, maxY])
                         .range([0, height]);


        // points
        svgPoints.selectAll("circle")
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

        svg.append("g")
           .call(brush)
           .call(brush.move, [[width * 0.3, height * 0.1], [width * 0.7, height * 0.4]]);
        
        svgMiniMap = d3.select("#minimap")
                       .attr("width", width + margin.hor * 2)
                       .attr("height", height + margin.ver * 2)


            
        
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