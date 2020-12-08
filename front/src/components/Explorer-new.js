import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { color, precisionPrefix } from 'd3';
import inside from 'point-in-polygon'
import ShepardDiagram from './Detail-Shepard';
import BarChart from './Detail-BarChart';
import CompareView from "./CompareView";
import BottomBarChart from './Bottom-BarChart';

const ExplorerNew = (props) => {

    let jsonFileName = props.dataset + "_" + props.method;
    let pointsData = require("../json/" + jsonFileName + "_points.json");
    let edgesData = require("../json/" + jsonFileName + "_edges.json");
    let missingPointsData = require("../json/" + jsonFileName + "_missing_points.json")
    const label_data = Array.from(new Set(pointsData.map((d) => d.label))).sort((a,b)=> a - b);
    // pointsData = pointsData.map((d, i) => {
    //     return {
    //         coor: d.coor,
    //         lable: d.label,
    //         idx: i
    //     };
    // });

    let knnData = edgesData.reduce(function(acc, val) {
        if (val.start in acc) acc[val.start].push(val.end);
        else                  acc[val.start] = [val.end];
        if (val.end in acc)   acc[val.end].push(val.start);
        else                  acc[val.end] = [val.start];
        return acc;
    }, {})

    // console.log(pointsData, edgesData, missingPointsData, knnData) 

    const width = 800;
    const height = 800;
    // const margin = { hor: width / 40, ver: height / 40 };
    const margin = { hor: 15, ver: 15 };

    const [minX, maxX] = d3.extent(pointsData, d => d.coor[0]);
    const [minY, maxY] = d3.extent(pointsData, d => d.coor[1]);

    const xScale = d3.scaleLinear()
                        .domain([minX, maxX])
                        .range([0, width]);
    
    const yScale = d3.scaleLinear()
                        .domain([minY, maxY])
                        .range([0, height]);

    const ratio = 0.38;


    let svgContour, svgContourPoints;
    let svgMainView, gMainView, svgMiniMap, gBrush;

    let miniContourPoints;

    let pointSelection;

    const radius = props.radius;
    const strokeWidth = props.stroke;



    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const [update, setUpdate] = useState();
    const [pointsIn, setPointsIn] = useState([]);
    const [missingPointsIn, setMissingPointsIn] = useState([]);
    const isSelecting = useRef(false);
    const isMakingContour = useRef(false);
    let contour = useRef([]);


    function pointsInPolygon(polygon) {

        
        let scale = getTransformValue()[0];

        polygon = polygon.map(d => [xScale.invert(d[0] - margin.hor / scale), yScale.invert(d[1] - margin.ver / scale)]);
        let pointsInPolygon = pointsData.reduce(function(acc, val, i){
            if (inside(val.coor, polygon)) acc.push(i);
            return acc;
        }, []);
        return pointsInPolygon;
    }

    function getMissingEdgesInfo(missingPointsDict) {
        let missingPointsList = Object.keys(missingPointsDict);
        let edges = missingPointsList.reduce(function(acc, val) {
            let adjacentPoints = knnData[val.toString()]
            if (adjacentPoints === undefined) return acc;
            adjacentPoints.forEach(adjacentPoint => {
                if(parseInt(adjacentPoint) in missingPointsDict) {
                    let keyStr = parseInt(adjacentPoint) < val ? 
                                adjacentPoint  + "_" + val.toString() : 
                                val.toString() + "_" + adjacentPoint;
                    acc.push(keyStr);
                }
            });
            return acc;
        }, []);
        edges = Array.from(new Set(edges));
        edges = edges.map(d => {
            const incidentPoints = d.split("_");
            return [parseInt(incidentPoints[0]), parseInt(incidentPoints[1])];
        })
        return edges;
    }

    const drawPlot = (ratio, prefix) => {
        let svgs = d3.select(`#${prefix}_${props.dataset}_${props.method}`)
        .attr("width", ratio * (width + margin.hor * 2))
        .attr("height", ratio * (height + margin.ver * 2));


        svgs.append("rect")
            .attr("width", ratio * (width + margin.hor * 2))
            .attr("height", ratio * (height  + margin.ver * 2))
            .style("fill-opacity", 0)
            // .style("stroke", "black")
            // .style("stroke-width", 2)

        let svg = svgs.append("g")
            .attr("id", `${prefix}_g_${props.dataset}_${props.method}`)
            .attr("transform", `translate(${ratio * margin.hor}, ${ratio * margin.ver})`);

        let svgEdges = svg.append("g")
                        .attr("id", `${prefix}_edge_g_${props.dataset}_${props.method}`);

        let svgContour = svg.append("g")
                        .attr("id", `${prefix}_contour_g_${props.dataset}_${props.method}`);
            
        let svgContourPoints = svg.append("g")
                        .attr("id", `${prefix}_contour_point_g_${props.dataset}_${props.method}`);


        let svgPoints = svg.append("g")
                        .attr("id", `${prefix}_circle_g_${props.dataset}_${props.method}`);

        let svgMissingEdges = svg.append("g")
                        .attr("id", `${prefix}_missing_edge_g_${props.dataset}_${props.method}`);
        
                        //points
        svgPoints.selectAll("circle")
                        .data(pointsData)
                         .join(
                             enter => {
                                 enter.append("circle")
                                     .attr("class", (d,i) => "circle" + i.toString())
                                     .attr("fill", d => {
                                         if (props.isLabel) return colorScale(d.label);
                                         else return "black"; 
                                     })
                                     .attr("cx", d => ratio * xScale(d.coor[0]))
                                     .attr("cy", d => ratio * yScale(d.coor[1]))
                                     .style("opacity", 0.8)
                                     .attr("r", radius)
                             }
                         );
        
                         // edges
        function scaleBivariate(first, second) {
                        let lScale = d3.scaleLinear().domain([0, 2]).range([100, 30])
                        let aScale = d3.scaleLinear().domain([1, -1]).range([30, -30])
                        let bScale = d3.scaleLinear().domain([1, -1]).range([20, -20])
            
                        return d3.color(d3.lab(lScale(first + second), aScale(first - second), bScale(second-first)))
                    };

        svgEdges.selectAll("path")
                    .data(edgesData)
                    .join(
                        enter => {
                            enter.append("path")
                                 .attr("fill", "none")
                                 .attr("stroke-width", strokeWidth)
                                 .attr("stroke", d => {
                                     if (props.showMissing && props.showFalse) return scaleBivariate(d.false_val, d.missing_val);
                                     else return "black";
                                 })
                                 .attr("d", d => {
                                    return d3.line()
                                             .x(datum => ratio * xScale(pointsData[datum].coor[0]))
                                             .y(datum => ratio * yScale(pointsData[datum].coor[1]))
                                             ([d.start, d.end])
                                 });
                        }
                    );


    }
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

    const drag = (e) => { // 매우느림

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

    

    useEffect(() => {
        
        console.log('useEffect1')

        drawPlot(1.0, "scatterplot");
        drawPlot(ratio, "minimap");
        svgContour = d3.select(`#scatterplot_contour_g_${props.dataset}_${props.method}`);
        svgContourPoints = d3.select(`#scatterplot_contour_point_g_${props.dataset}_${props.method}`);
        miniContourPoints = d3.select(`#minimap_contour_point_g_${props.dataset}_${props.method}`);
        
        function renderMissingEdges(edges, missingPointsDict) {
            d3.select(`#scatterplot_missing_edge_g_${props.dataset}_${props.method}`)
                    .selectAll("path")
                          .data(edges)
                          .enter()
                          .append("path")
                          .attr("fill", "none")
                          .attr("stroke-width", strokeWidth)
                          .attr("stroke", "red")
                          .attr("d", d => {
                              return d3.line()
                                      .x(datum => xScale(pointsData[datum].coor[0]))
                                      .y(datum => yScale(pointsData[datum].coor[1]))
                                      (d);
                          })
                          .style("opacity", d => {
                              return (missingPointsDict[d[0]] + missingPointsDict[d[1]]) / 2
                          });


            d3.select(`#minimap_missing_edge_g_${props.dataset}_${props.method}`)
                          .selectAll("path")
                                .data(edges)
                                .enter()
                                .append("path")
                                .attr("fill", "none")
                                .attr("stroke-width", strokeWidth)
                                .attr("stroke", "red")
                                .attr("d", d => {
                                    return d3.line()
                                            .x(datum => ratio * xScale(pointsData[datum].coor[0]))
                                            .y(datum => ratio * yScale(pointsData[datum].coor[1]))
                                            (d);
                                })
                                .style("opacity", d => {
                                    return (missingPointsDict[d[0]] + missingPointsDict[d[1]]) / 2
                                });
        }

        const finalPointSelection = () => {
            
            let points = pointsInPolygon(contour.current);
            
            svgContourPoints.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("r", radius * 2)
                    .attr("cx", d => 
                        xScale(pointsData[d].coor[0]))
                    .attr("cy", d => yScale(pointsData[d].coor[1]))
                    .attr("fill", "blue");

            miniContourPoints.selectAll("circle")
                    .data(points)
                    .enter()
                    .append("circle")
                    .attr("r", radius * 6 * ratio)
                    .attr("cx", d => ratio * xScale(pointsData[d].coor[0]))
                    .attr("cy", d => ratio * yScale(pointsData[d].coor[1]))
                    .attr("fill", "blue");
        
            let missingPointsDict = points.reduce(function(acc, val) {
                let currentDict = missingPointsData[val];
                Object.keys(currentDict).forEach(key => {
                    if (key in acc) acc[key] += currentDict[key];
                    else            acc[key] =  currentDict[key];
                });
                return acc;
            }, {})
            

            let listLen = points.length;
            Object.keys(missingPointsDict).forEach(d => {
                missingPointsDict[d] /= listLen;
            })
            let edges = getMissingEdgesInfo(missingPointsDict);
            renderMissingEdges(edges, missingPointsDict);

            setMissingPointsIn(() => missingPointsDict);
            setPointsIn(() => points);
            setUpdate(() => true);
        }

        pointSelection = d3.select(`#scatterplot_g_${props.dataset}_${props.method}`)
                        .append("rect")
                        .attr("width", width + margin.hor * 2)
                        .attr("height", height  + margin.ver * 2)
                        .attr("transform", "translate(-" + margin.hor + ", -" + margin.ver + ")")
                        .style("fill-opacity", 0)
                        .on("click", function(event) {
                            if(!isSelecting.current) {
                                
                                const [scale, transX, transY] = getTransformValue();
                                const realX = (event.offsetX - transX + margin.hor) / scale;
                                const realY = (event.offsetY - transY + margin.hor) / scale;
                                
                                if(!isMakingContour.current) {
                                    // 새 점
                                    isMakingContour.current = true;
                                    // contour.current.push([event.offsetX, event.offsetY])
                                    contour.current.push([realX, realY])
                                    svgContour.append("path")
                                            .attr("id", "current_path")
                                            .attr("fill", "none")
                                            .attr("stroke", "blue")
                                            .attr("storke-width", 1)
                                            .attr("stroke-dasharray", "2 ");
                                }
                                else {
                                    // 이미 시작점은 존재한 상태에서 새로운 점 그리는 중 
                                    svgContour.select("#current_path")
                                            .attr("id", "")
                                            .attr("d", () => {
                                                let start, end;
                                                if (Math.abs(realX - contour.current[0][0]) < 4 &&
                                                    Math.abs(realY - contour.current[0][1]) < 4) {
                                                        start = contour.current[contour.current.length - 1];
                                                        end = contour.current[0];
                                                        isSelecting.current = true;
                                                        isMakingContour.current = false; // finish making contour
                                                    }
                                                else {
                                                    contour.current.push([realX, realY])
                                                    start = contour.current[contour.current.length - 2];
                                                    end = contour.current[contour.current.length - 1];
                                                    svgContour.append("path")
                                                                .attr("id", "current_path")
                                                                .attr("fill", "none")
                                                                .attr("stroke", "blue")
                                                                .attr("storke-width", 1)
                                                                .attr("stroke-dasharray", "2 ");
                                                }
                                                
                                                return d3.line()
                                                            .x(datum => datum[0])
                                                            .y(datum => datum[1])
                                                            ([[start[0] - margin.hor / scale, start[1] - margin.ver / scale],[end[0] - margin.hor / scale, end[1] - margin.ver / scale]])
                                            })
                                    

                                    if(isSelecting.current) { // finish making contour 마지막검에서 끝날때 
                                        finalPointSelection();
                                    }   
                                }
                                if(isMakingContour.current){

                                    // 마지막합쳐질떄 제외하고 세 점을 만들어야 함.
                                    
                                    // console.log(event.offsetX, event.offsetY);
                                    svgContour.append("circle")
                                            .attr("r", 1.5)
                                            .attr("cx", realX - margin.hor / scale)
                                            .attr("cy", realY - margin.ver / scale)
                                            .attr("fill", "none")
                                            .attr("stroke", "blue")
                                            .attr("stroke-width", 1);
                                }
                            }
                            else { // 이미 selection있을 경우
                                // clearing
                                // TODO : refresh

                                contour.current = [];
                                isSelecting.current = false;
                                setUpdate(() => false);

                                svgContour.selectAll("path").remove();
                                svgContour.selectAll("circle").remove();
                                svgContourPoints.selectAll("circle").remove();
                                miniContourPoints.selectAll("circle").remove();
                                d3.select(`#scatterplot_missing_edge_g_${props.dataset}_${props.method}`).selectAll("path").remove();
                                d3.select(`#minimap_missing_edge_g_${props.dataset}_${props.method}`).selectAll("path").remove();

                            }
                        })
                        .on("mousemove", function(event) {
                            svgContour.select("#current_path")
                                        .attr("d",() =>{
                                            const [scale, transX, transY] = getTransformValue();
                                            const realX = (event.offsetX - transX + margin.hor) / scale;
                                            const realY = (event.offsetY - transY + margin.ver) / scale;
                                            let start = contour.current[contour.current.length - 1]
                                            let end;
                                            if (Math.abs(realX - contour.current[0][0]) < 4 &&
                                                Math.abs(realY - contour.current[0][1]) < 4) 
                                                end = contour.current[0];
                                            else end = [realX, realY]
                                            return d3.line()
                                                    .x(datum => datum[0])
                                                    .y(datum => datum[1])
                                                    ([[start[0] - margin.hor / scale, start[1] - margin.ver / scale],[end[0] - margin.hor / scale, end[1] - margin.ver / scale]])
                                        })
                                    })
                        .on('dblclick', e => {
                            svgContour.select("#current_path")
                                        .attr("d", () => {
                                            let start = contour.current[contour.current.length - 1];
                                            let end = contour.current[0];
                                            const scale = getTransformValue()[0];
                                            return d3.line()
                                                    .x(datum => datum[0])
                                                    .y(datum => datum[1])
                                                    ([[start[0] - margin.hor / scale, start[1] - margin.ver / scale],[end[0] - margin.hor / scale, end[1] - margin.ver / scale]])
                                        })
                                        .attr("id", "")
                                        .attr("d", () => {
                                            const scale = getTransformValue()[0];
                                                let start, end;
                                                start = contour.current[contour.current.length - 1];
                                                end = contour.current[0];
                                                isSelecting.current = true;
                                                isMakingContour.current = false; // finish making contour
                                                return d3.line()
                                                            .x(datum => datum[0])
                                                            .y(datum => datum[1])
                                                            ([[start[0] - margin.hor / scale, start[1] - margin.ver / scale],[end[0] - margin.hor / scale, end[1] - margin.ver / scale]])
                                            });

                                            finalPointSelection();

                        })
                        .on("contextmenu", e => {
                            if (!isSelecting.current){
                            e.preventDefault();
                            // svgContour아래에 있는거 다 지우면 됨. 
                            // contour안에 있는거 지우고
                            // 
                            contour.current = [];
                            svgContour.select("#current_path")
                                        .attr("id", "")

                            svgContour.selectAll("*").remove();

                            isSelecting.current = false;
                            isMakingContour.current = false;
                            setUpdate(() => false);
                            }
                        });
        

        svgMainView = d3.select("#scatterplot_" + props.dataset + "_" + props.method);
        svgMainView.select("rect").style("fill-opacity", 0);
        gMainView = d3.select("#scatterplot_g_" + props.dataset + "_" + props.method);
        

        d3.select(`#scatterplot_circle_g_${props.dataset}_${props.method}`).selectAll("circle")
                            .data(pointsData)
                            .join(enter => null, update => {
                                update.on("mouseenter", function() {
                                    if(!isSelecting.current && !isMakingContour.current)
                                       d3.select(this).attr("r", radius * 3)
                                })
                                .on("mouseleave", function() {
                                    if(!isSelecting.current && !isMakingContour.current)
                                       d3.select(this).attr("r", radius)
                                })
                                .on("click", function(e, d) {
                                    if(!isSelecting.current && !isMakingContour.current){
                                       isSelecting.current = true;
                                       d3.select(this).attr("r", radius * 5);
                                       let missingPointsDict = missingPointsData[d.idx];
                                       let edges = getMissingEdgesInfo(missingPointsDict)
                                       renderMissingEdges(edges, missingPointsDict);
                                    }
                                });
                                

                            });

        // minimap

        d3.select("#minimap").style("position","fixed");
        svgMiniMap = d3.select("#minimap_" + props.dataset + "_" + props.method)
                        

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
                        });

                svgMiniMap.on('wheel', e => {
                    let newScale, newTransX, newTransY;
                    const {offsetX, offsetY, wheelDelta} = e;
                    
                    const [scale, transX, transY] = getTransformValue();
                    if (wheelDelta > 0){ // ZOOM IN
                        if (scale < 5.0){
                            newScale = parseFloat(scale) + parseFloat(0.1);
                            newTransX = transX - 0.1 * (offsetX / ratio - transX) / scale;
                            newTransY = transY - 0.1 * (offsetY / ratio- transY) / scale;
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
                            newTransX = transX + 0.1 * (offsetX / ratio - transX) / scale;
                            newTransY = transY + 0.1 * (offsetY / ratio- transY) / scale;
                            const moveX = d3.max([d3.min([newTransX, margin.hor * newScale]),(30 / newScale) - (newScale - 1.0) * width]);
                            const moveY = d3.max([d3.min([newTransY, margin.ver * newScale]),(30 / newScale) - (newScale - 1.0) * height]);
                            gMainView.attr('transform', `translate(${moveX.toFixed(3)}, ${moveY.toFixed(3)}) scale(${newScale.toFixed(1)})`);
        
                            brush.move(gBrush, [
                                [(margin.hor * newScale - moveX) * ratio / newScale, (margin.ver * newScale - moveY) * ratio / newScale],
                                [(margin.hor * newScale - moveX) * ratio / newScale + (width + 2 * margin.hor) * ratio / newScale,
                                 (margin.ver * newScale - moveY) * ratio / newScale + (height + 2 * margin.ver) * ratio / newScale],
                            ]);
                    }
                });

        svgMainView.call(
            d3.drag()
            .on("drag",drag));

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
        <div id="content">
            <div id="content-left">
                <div id="scatterplot">
                    <svg id={`scatterplot_${props.dataset}_${props.method}`}></svg>
                </div>
                <div id="detailview">
                    <BottomBarChart data={pointsData} update={update} points={pointsIn} label={label_data}/>
                </div>
            </div>
            <div id="content-right">


                <CompareView
                    main_method={props.method}
                    methods={props.methods}
                    dataset={props.dataset}
                    update={update}
                    points={pointsIn}
                    data={pointsData}
                    label={label_data}
                    dataset={props.dataset}
                    colorScale={colorScale}
                    missingPoints={missingPointsIn}
                />
                <ShepardDiagram
                    method={props.method}
                    dataset={props.dataset} 
                />

                <BarChart 
                    method={props.method}
                    dataset={props.dataset}
                    option={"count"}
                    threshold={0.5}
                />

            </div>
            
            <div id="minimap" style={{bottom:0, left:0}}>
                <div className="minimap-title">Minimap</div>
                <svg id={`minimap_${props.dataset}_${props.method}`}></svg>
            </div>
            <div id="repoview"></div>
        </div>
    );
};

export default ExplorerNew;