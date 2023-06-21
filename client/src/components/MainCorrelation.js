import React, {useEffect} from 'react'
import ShareDataSelections from './ShareDataSelections';
import ResetButton from './ResetButton';
import {plotSelections} from '../resources/json/plotSelections.json';
import sessionj from '../resources/json/session.json';

function MainHeatmap() {

    const INIT_PLOT_TYPE = plotSelections.correlation;

    const [plotSelection] = React.useState(INIT_PLOT_TYPE);

    useEffect(() => {
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
        sessionStorage.setItem(sessionj.gseaGeneset, '');
    },[INIT_PLOT_TYPE]);

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-11 offset-1">
                    <h3>Correlation Analysis</h3>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Visualize the correlation between selected gene expression / TME value.
                </div>
            </div>
            <div className="spacer"/>
            <ShareDataSelections plotSelection={plotSelection}/>
            <ResetButton/>
        </React.Fragment>
    )
}

export default MainHeatmap
