import React, {useEffect} from 'react';
import ShareDataSelections from './ShareDataSelections';
import ResetButton from './ResetButton';
import {plotSelections} from '../resources/json/plotSelections.json';
import sessionj from '../resources/json/session.json';

function MainBoxViolin() {

    const INIT_PLOT_TYPE = plotSelections.boxplot;
    
    const [plotSelection, setPlotSelection] = React.useState(INIT_PLOT_TYPE);

    useEffect(() => {
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
        sessionStorage.setItem(sessionj.gseaGeneset, '');
    },[INIT_PLOT_TYPE]);

    const onChangePlotSelect = e => {
        setPlotSelection(e.target.value);
        sessionStorage.setItem(sessionj.plotSelection, e.target.value);
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-11 offset-1">
                    <h3>Comparative Analysis</h3>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Comparing gene expression / TME value for selected group of cohort.
                </div>
            </div>
            <div className="spacer"/>
            <ShareDataSelections plotSelection={plotSelection}/>
            <div className="row">
                <label className="col-1 offset-1 boldFieldHeader">Plot Type:</label>
                <input type="radio" className="radioLeftMargin" id="boxplot" name="plotType" value={INIT_PLOT_TYPE} defaultChecked onChange={onChangePlotSelect}/>
                <label htmlFor="boxplot">Boxplot</label>
                <input type="radio" className="radioLeftMargin" id="violin" name="plotType" value={plotSelections.violin} onChange={onChangePlotSelect}/>
                <label htmlFor="violin">Violin</label>
            </div>
            <p/>
            <ResetButton/>
        </React.Fragment>
    )
}

export default MainBoxViolin
