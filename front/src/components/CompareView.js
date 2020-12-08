import React, { useState, useEffect } from 'react'

import CompareViewComponent from './Compare-Component'


const CompareView = (props) => {

    // LLE 추가하면 restore해야함 TODOTODOTODO
    // const methods  = props.methods.filter(d => d !== props.main_method)
    const methods = props.methods;

    const compareWidth = 200;
    const compareHeight = 200;

    useEffect(() => {
        // console.log(props.points);
        // console.log(methods);
    }, [props.update])


    let titleStyle = {
        "marginTop": 14,
        "fontWeight": 600
    }

    let divStyle = {
        "paddingLeft": 17
    }

    return (
        <div style={divStyle}>
            <div style={titleStyle}>Compare View</div>
            <div style={{display: "flex"}}>
            {methods.slice(0,2).map((method, i) => (
                <CompareViewComponent
                    method = {method}
                    dataset = {props.dataset}
                    points = {props.points}
                    update = {props.update}
                    width = {compareWidth}
                    height = {compareHeight}
                    colorScale = {props.colorScale}
                    missingPoints = {props.missingPoints}
                    setMainMethod = {props.setMainMethod}
                />
            ))}
            </div>
            <div style={{display: "flex"}}>
            {methods.slice(2,4).map((method, i) => (
                <CompareViewComponent
                    method = {method}
                    dataset = {props.dataset}
                    points = {props.points}
                    update = {props.update}
                    width = {compareWidth}
                    height = {compareHeight}
                    colorScale = {props.colorScale}
                    missingPoints = {props.missingPoints}
                    setMainMethod = {props.setMainMethod}
                />
            ))}
            </div>
        </div>
    )

}

export default CompareView;