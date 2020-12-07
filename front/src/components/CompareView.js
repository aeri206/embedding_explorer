import React, { useState, useEffect } from 'react'

import CompareViewComponent from './Compare-Component'


const CompareView = (props) => {

    const methods  = props.methods.filter(d => d !== props.main_method)

    const compareWidth = 200;
    const compareHeight = 200;

    useEffect(() => {
        console.log(props.points)
        console.log(methods);
    }, [props.update])




    return (
        <div>
            {methods.map((method, i) => (
                <CompareViewComponent
                    method = {method}
                    dataset = {props.dataset}
                    points = {props.points}
                    update = {props.update}
                    width = {compareWidth}
                    height = {compareHeight}
                    colorScale = {props.colorScale}
                />
            ))}
        </div>
    )

}

export default CompareView;