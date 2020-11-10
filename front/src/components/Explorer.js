import React, { useEffect } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
const Explorer = (props) => {

    const loading = async () => {

        axios
            .get("/data/")
            .then(data => {
                console.log(data);
            })
            .catch(e => {
                console.log(e);

            });
    };

    useEffect(() => {
        loading();
    });

    return (<div>infoVIS term project team-A</div>);
};

export default Explorer;