import React, {useEffect} from 'react';
import ShareDataSelections from './ShareDataSelections';
import {plotSelections} from '../resources/json/plotSelections.json';
import sessionj from '../resources/json/session.json';
import ResetButton from './ResetButton';

function MainSuvivalCurve() {

    const INIT_PLOT_TYPE = plotSelections.survival;
    
    const [plotSelection] = React.useState(INIT_PLOT_TYPE);

    useEffect(() => {
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
        sessionStorage.setItem(sessionj.gseaGeneset, '');
    },[INIT_PLOT_TYPE]);
    
    return (
        <React.Fragment>
            <div className="row">
                <div className="col-11 offset-1">
                    <h3>Survival Analysis</h3>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Perform overall survival analysis of a selected gene or tumor immune cell types in a selected cohort.
                </div>
            </div>
            <div className="spacer"/>
            <ShareDataSelections plotSelection={plotSelection}/>
            <ResetButton/>
        </React.Fragment>
    )
}

export default MainSuvivalCurve
