import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';

function Correlation(props) {

    useEffect(() => {

        const data = props.data.results.processed_data;
        let xLabel = props.data.results.x_label;
        let yLabel = props.data.results.y_label
        const regressionYIntercept = props.data.results.intercept;
        const regressionSlope = props.data.results.slope;
        //const featList = props.data.results.feat_list;
        //const corrCoef = props.data.results.corr;

        const x = [];
        const y = [];

        if (xLabel.includes('CIBERSORTx')) xLabel = xLabel.replace('CIBERSORTx', 'CIBERSORT')
        if (yLabel.includes('CIBERSORTx')) yLabel = yLabel.replace('CIBERSORTx', 'CIBERSORT')

        const title = '<b>p-value</b>: ' + props.data.results.pval.toFixed(4) + '<br><b>r</b>: ' + props.data.results.rval.toFixed(4);

        const layout = {
            height: 600,
            width: 600,
            title: { 
                text: title,
                font: {
                    size: 12
                }
            },
            xaxis: {
                title: { text: xLabel }
            },
            yaxis: {
                title: { text: yLabel }
            }
        };

        Object.keys(data.x_axis).forEach(key => {
            x.push(data.x_axis[key]);
            y.push(data.y_axis[key]);
        });

        const trace = {
            x,
            y,
            name: 'sample, n=' + x.length,
            mode: 'markers',
            type: 'scatter'
        };

        const regression = _createRegressionLine(x, regressionSlope, regressionYIntercept);
        const trace2 = {
            x: regression.x,
            y: regression.y,
            name: '',
            showlegend: false,
            mode: 'lines',
            type: 'scatter'
        };

        Plotly.newPlot('scatterPlot', [trace, trace2], layout);

    }, [props]);

    const _createRegressionLine = (x, slope, yint) => {
        
        const ypoint = tx => {
            return slope * tx + yint;
        };

        const minx = Math.min(...x);
        const maxx = Math.max(...x);
        const miny = ypoint(minx);
        const maxy = ypoint(maxx);

        return { x: [ minx, maxx ], y: [ miny, maxy ] };
    };

    return (
        <div className="row justify-content-center">
            <div className="col-10">
                <div id="scatterPlot"/>
            </div>
        </div>
    )
}

export default Correlation
