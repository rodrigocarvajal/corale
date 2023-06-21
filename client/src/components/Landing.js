import React from 'react'
import {Link} from 'react-router-dom';
import routes from '../resources/json/routes.json';
import DataSummaryJPG from '../resources/jpg/DataSummary.jpg';

function Landing() {

    return (
        <React.Fragment>
            <div className="spacerLg"/>
            <div className="col-10 offset-1">
                <span id="coraleIntroductionStatement">Comprehensive ORAL cancer Explore (CORALE) is a harmonized multi-omics and 
                            clinicopathological data web portal, to facilitate the maximum use of public 
                            datasets in oral cancer research community. CORALE consists of 5087 oral cancer 
                            patient samples across 69 datasets.  CORALE provides a user-friendly interface 
                            for data analyses such as overall survival, tumor-immune microenvironment 
                            deconvolution, differentially expressed gene and gene set enrichment analysis.
                </span>
            </div>
            <div className="spacer"/>
            <div className="row justify-content-center">
                <div className="col-10 divider"/>
            </div>
            <p/>
            <div className="row justify-content-center">
                <img src={DataSummaryJPG} className="col-9" alt="data_summary.jpg"/>
            </div>
            <div className="spacer"/>
            <div className="col-12">
                <div className="row justify-content-center">
                    <Link className="col-3 pageSelectBox" to={routes.client.mainSurvival}>
                        <div>
                            <dfn data-info="Perform overall survival analysis of a selected gene or tumor immune cell types in a selected cohort">
                                Survival Analysis
                            </dfn>
                        </div>
                    </Link>
                    <Link className="col-3 pageSelectBox" to={routes.client.mainBoxViolin}>
                        <div>
                            <dfn data-info="Comparing gene expression / TME value for selected group of cohort">
                                Comparative Analysis
                            </dfn>
                        </div>
                    </Link>
                    <Link className="col-3 pageSelectBox" to={routes.client.mainHeatmap}>
                        <div>
                            <dfn data-info="Perform clustering of selected genes or tumor immune cell types with clinical features">
                                Clustering Analysis
                            </dfn>
                        </div>
                    </Link>
                </div>
                <div className="row justify-content-center">
                    <Link className="col-3 pageSelectBox" to={routes.client.mainCorrelation}>
                        <div>
                            <dfn data-info="Visualize the correlation between selected gene expression">
                                Correlation Analysis
                            </dfn>
                        </div>
                    </Link>
                    <Link className="col-3 pageSelectBox" to={routes.client.mainGsea}>
                        <div>
                            <dfn data-info="Perform Gene Set Enrichment Analysis for selected cohort">
                                Gene Set Analysis
                            </dfn>
                        </div>
                    </Link>
                    <Link className="col-3 pageSelectBox" to={routes.client.datasetsInfo}>
                        <div>
                            <dfn data-info="Download normalized/harmonized datasets">
                                Download
                            </dfn>
                        </div>
                    </Link>
                </div>
            </div>
            <p/>
        </React.Fragment>
    )
}

export default Landing
