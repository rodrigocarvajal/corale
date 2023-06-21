import React, { useEffect } from 'react';
import Plotly from 'plotly.js-dist';

function KaplanMeier(props) {

    useEffect(() => {

        const _getGroupingFeature = () => {
            const GROUP = 'group';
            if (props.userParameters.grouping) {
                return props.userParameters.grouping;
            } else if (props.userParameters.groupingGene) {
                //return props.userParameters.groupingGene;
                return GROUP;
            } else if (props.userParameters.groupingMutation) {
                return props.userParameters.groupingMutation;
            } else { // props.userParameters.groupingTme
                //return props.userParameters.groupingTme;
                return GROUP;
            }
        };

        if (props.data.results.processed_data && props.data.results.feat_list && props.data.results.pval && props.data.results.title) {

            const GENERIC_GROUP_TITLE = 'group';
            const data = props.data.results.processed_data;
            const featList = props.data.results.feat_list;
            const pval = props.data.results.pval;
            let title = props.data.results.title;
            
            const propsDataKeys = [];
            Object.keys(data).forEach(key => { propsDataKeys.push(key) });
            if (propsDataKeys.includes(GENERIC_GROUP_TITLE)) {
                title = GENERIC_GROUP_TITLE;
            }
            const groupNumberSamples = _getNumberOfSamples(data[title], featList);

            const layout = {
                title,
                xaxis: {
                    title: { text: 'Months' }
                },
                yaxis: {
                    title: { text: 'Overall Survival' },
                    range: [0,1]
                },
                legend: {
                    title: { text: 'Log-rank p-value: ' + Number(pval).toFixed(4) }
                },
            };
            
            const groupingFeature = _getGroupingFeature();
            const samplesByFeat = [];
            const osStatusByFeat = [];
            const osMonthByFeat = [];
            const preTraces = [];

            featList.forEach(feat => {
                const tAry = [];
                Object.keys(data[groupingFeature]).forEach(key => {
                    if (data[groupingFeature][key] === feat) {
                        tAry.push(key);
                    }
                });
                samplesByFeat.push(tAry);
            });

            samplesByFeat.forEach(grp => {
                const tOsMonth = [];
                const tOsStatus = [];
                grp.forEach(sample => {
                    tOsMonth.push(Number(data.os_month[sample]));
                    tOsStatus.push(data.os_status[sample]);
                });            
                osMonthByFeat.push(tOsMonth);
                osStatusByFeat.push(tOsStatus);
            });        

            samplesByFeat.forEach((grp, i) => {
                const period = [];
                for (let m = 0; m <= Math.max(...osMonthByFeat[i]); m++) {
                    period.push(m);
                }

                const censored = new Array(period.length).fill(0);
                const event = new Array(period.length).fill(0);

                osMonthByFeat[i].forEach((month, j) => {
                    if (osStatusByFeat[i][j] === 'alive') {
                        censored[Math.ceil(month)]++;
                    } else {
                        event[Math.ceil(month)]++;
                    }
                });

                preTraces.push({ samples: grp, period, censored, event, feature: featList[i] });
            });

            preTraces.forEach((trace, i) => {
                const risk = [trace.samples.length];
                const survived = [];
                const km = [];

                trace.censored.forEach((censor, j) => {
                    if (j === 0) {
                        survived.push(risk[j] - censor - trace.event[j]);
                        km.push(survived[j] / risk[j]);
                    } else {
                        risk.push(survived[j-1] - censor);
                        survived.push(risk[j] - trace.event[j]);
                        km.push(km[j-1] * ( survived[j] / risk[j] ));
                    }
                });
                preTraces[i] = { ...preTraces[i], risk, survived, km };
            });

            const traces = [];
            preTraces.forEach(trace => {
                const {x, y} = _smoothKmCurve(trace.period, trace.km);
                traces.push({
                    x,
                    y,
                    mode: 'lines',
                    type: 'scatter',
                    name: trace.feature + ', n=' + groupNumberSamples[trace.feature]
                });
            });

            Plotly.newPlot('kmPlot', traces, layout);

        }
    }, [props]);

    const _smoothKmCurve = (x, y) => {
        
        const sanitizedY = [];
        const tx = [];
        const ty = [];
        
        let previous = y[0];
        
        x.forEach(val => { tx.push(val) });
        y.forEach(val => { 
            if (val !== null && val !== undefined && !Number.isNaN(val) && val !=='NaN') {
                ty.push(val);
                sanitizedY.push(val);
            } else {
                tx.pop();
            }
        });

        sanitizedY.forEach((current, i) => {
            if (current !== previous) {
                tx.splice(i, 0, x[i-1]+0.0001);
                ty.splice(i, 0, sanitizedY[i]);
            }
            previous = current;
        });

        tx.sort((a,b) => a-b);
        ty.sort((a,b) => b-a);

        return { x: tx, y: ty }
    };

    const _getNumberOfSamples = (groupData, features) => {
        let counts = {};
        features.forEach(feature => {
            let featureCount = 0;
            Object.keys(groupData).forEach(key => {
                if (groupData[key] && groupData[key].toLowerCase() === feature.toLowerCase()) {
                    featureCount++;
                }
            });
            counts = { ...counts, [feature]: featureCount };
        });

        return counts;
    };

    return (
        <div className="row justify-content-center">
            <div className="col-10">
                <div id="kmPlot"/>
            </div>
        </div>
    )
}

export default KaplanMeier
