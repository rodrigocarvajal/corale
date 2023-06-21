import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';
import {clinicalDataKeys} from '../../resources/util/clinicalDataKeys';

function BoxViolinPlot(props) {

    useEffect(() => {
        if (props.data.results.processed_data && props.data.results.feat_list && props.data.results.x_label && props.data.results.pval) {
            const data = props.data.results.processed_data;
            const featList = props.data.results.feat_list;
            let xLabel = props.data.results.x_label;
            let yLabel = props.data.results.y_label;
            const pval = props.data.results.pval;
            const traces = [];
            let title;

            if (xLabel.includes('CIBERSORTx')) xLabel = xLabel.replace('CIBERSORTx', 'CIBERSORT')
            if (yLabel.includes('CIBERSORTx')) yLabel = yLabel.replace('CIBERSORTx', 'CIBERSORT')

            clinicalDataKeys[xLabel] ? title = clinicalDataKeys[xLabel].title : title = xLabel;

            const layout = {
                title,
                height: 600,
                legend: {
                    title: { text: 'pval: ' + pval.toFixed(4) }
                },
                yaxis: { title: yLabel }
            };

            if (data) {

                featList.forEach(feature => {
                    const y = [];
                    Object.keys(data.group).forEach((sampleid, i) => {
                        if (feature === data.group[sampleid]) {
                            y.push(data.y_axis[sampleid]);
                        }
                    });
                    props.plotSelection === 'violin' ?
                        traces.push({y, name: feature + ', n=' + y.length, type: 'violin', box: {visible: true}, meanline: {visible: true}} ) :
                        traces.push({y, name: feature + ', n=' + y.length, type: 'box'});
                });

                Plotly.newPlot('renderedPlot', traces, layout);
            }
        }
    }, [props]);

    return (
        <div className="row justify-content-center">
            <div className="col-10">
                <div id="renderedPlot"/>
            </div>
        </div>
    )
}

export default BoxViolinPlot
