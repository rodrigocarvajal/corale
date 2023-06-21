import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';
import ShareDataSelections from './ShareDataSelections';
import ResetButton from './ResetButton';
import {plotSelections} from '../resources/json/plotSelections.json';
import sessionj from '../resources/json/session.json';
import MagnifyingGlassSVG from '../resources/svg/search-solid.svg';

function MainGsea() {

    const INIT_PLOT_TYPE = plotSelections.gsea;

    const [plotSelection] = React.useState(INIT_PLOT_TYPE);

    useEffect(() => {
        const GENESETS = { hallmark: 'hallmark', kegg: 'kegg' };
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
        sessionStorage.setItem(sessionj.gseaGeneset, GENESETS.hallmark);
    },[INIT_PLOT_TYPE]);

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-4 offset-1">
                    <h3>Geneset Analysis</h3>
                </div>
                <div className="col-6" style={{textAlign: 'end'}}>
                    <Link className="navLink" to="/gsealookup">
                        <img src={MagnifyingGlassSVG} style={{width: '1em'}}alt="search-solid.svg"/>
                        GSEA Results Lookup
                    </Link>
                </div>
                <div className="col-1"/>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Perform Gene Set Enrichment Analysis for selected cohort.
                </div>
            </div>
            <div className="spacer"/>
            <ShareDataSelections plotSelection={plotSelection}/>
            <ResetButton/>
        </React.Fragment>
    )
}

export default MainGsea
