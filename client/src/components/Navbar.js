import React from 'react'
import {Link} from 'react-router-dom';
import routes from '../resources/json/routes.json';
import CoraleSVG from '../resources/svg/corale.svg';

function Navbar() {

    const [showAnalysesDropbox, setShowAnalysesDropbox] = React.useState(false);

    window.onclick = e => {
        if (!e.target.matches('.analysesNavbarLink') && !e.target.matches('.analysesDropdownLinks') && showAnalysesDropbox) {
            setShowAnalysesDropbox(false);
        }
    };

    const onClickAnalyses = () => {
        setShowAnalysesDropbox(!showAnalysesDropbox);
    };

    const onClickPageSelect = () => {
        setShowAnalysesDropbox(false);
    };

    return (
        <React.Fragment>
            <div className="row justify-content-center">
                <div className="col-2">
                    <img src={CoraleSVG}  style={{marginRight: '0.5em', paddingTop: '0.25em'}} alt="corale.svg"/>
                </div>
                <div className="navbarCstm col-10">
                    <p/>
                    <div className="col-12" style={{textAlign: 'center'}}>
                        <h1>CORALE</h1>
                    </div>
                    <div className="col-12" style={{textAlign: 'center'}}>
                        <span className="titleSubtext">Comprehensive Oral Cancer Explorer: A user-friendly web-based oral cancer data analysis portal</span>
                    </div>
                    <div className="spacerSm"/>
                    <div className="row col-12">
                        <div className="col-2 offset-2 navbarLinkDiv">
                            <Link className="navbarLink" to="/">Home</Link>
                        </div>
                        <div className="col-2 navbarLinkDiv">
                            <span className="navbarLink analysesNavbarLink" onClick={onClickAnalyses}>Analyses</span>
                        </div>
                        <div className="col-2 navbarLinkDiv">
                            <Link className="navbarLink" to="/datasetsinfo">Download</Link>
                        </div>
                        <div className="col-2 navbarLinkDiv">
                            <Link className="navbarLink" to="/tutorial">Tutorial</Link>
                        </div>
                        <div className="col-2 navbarLinkDiv">
                            <Link className="navbarLink" to="/about">About</Link>
                        </div>
                    </div>
                </div>
            </div>
            {showAnalysesDropbox &&
                <div className="row justify-content-center">
                    <div className="col-2"/>
                    <div className="row col-10">
                        <div className="row col-12">
                            <div className="col-2 offset-2"/>
                            <div className="col-2">
                                <div id="analysesDropdown" className="dropdown-content">
                                    <div className="row" onClick={onClickPageSelect}>
                                        <Link className="col-12 analysesDropdownLinks" to={routes.client.mainSurvival}>
                                            <div>
                                                Survival Analysis
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="row" onClick={onClickPageSelect}>
                                        <Link className="col-12 analysesDropdownLinks" to={routes.client.mainBoxViolin}>
                                            <div>
                                                Comparative Analysis
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="row" onClick={onClickPageSelect}>
                                        <Link className="col-12 analysesDropdownLinks" to={routes.client.mainHeatmap}>
                                            <div>
                                                Clustering Analysis
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="row" onClick={onClickPageSelect}>
                                        <Link className="col-12 analysesDropdownLinks" to={routes.client.mainCorrelation}>
                                            <div>
                                                Correlation Analysis
                                            </div>
                                        </Link>
                                    </div>
                                    <div className="row" onClick={onClickPageSelect}>
                                        <Link className="col-12 analysesDropdownLinks" to={routes.client.mainGsea}>
                                            <div>
                                                Geneset Analysis
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            <div className="col-2"/>
                            <div className="col-2"/>
                            <div className="col-2"/>
                        </div>
                    </div>
                </div>
            }
            <div className="spacer"/>
        </React.Fragment>
    )
}

export default Navbar
