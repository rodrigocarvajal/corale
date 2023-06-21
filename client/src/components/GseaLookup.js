import React from 'react';
import RenderGSEATable from './renderPlots/RenderGSEATable';

function GseaLookup() {

    const [jobId, setJobId] = React.useState();
    const [geneset, setGeneset] = React.useState();

    const onChangeJobId = e => {
        setJobId(e.target.value);
    };

    const onChangeGeneSet = e => {
        setGeneset(e.target.value);
    };

    return (
        <div className="offset-1">
            <div className="row">
                <div className="col-5">
                    <h4>GSEA Job ID Search</h4>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-5">
                    Please enter the Job ID to review previously submitted GSEA data queries
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-4">
                    <label className="boldFieldHeader" htmlFor="geneset">Geneset:</label>
                    <input type="radio" className="offset-1" id="genesetHallmark" value="hallmark" name="gseaSelect" onChange={onChangeGeneSet}/>
                    <label className="radioLeftMargin" htmlFor="genesetHallmark">Hallmark</label>
                    <input type="radio" className="offset-1" id="genesetKegg" value="kegg" name="gseaSelect" onChange={onChangeGeneSet}/>
                    <label className="radioLeftMargin" htmlFor="genesetHallmark">KEGG</label>
                </div>
            </div>
            <div className="row">
                <div className="col-4">
                    <label className="boldFieldHeader" htmlFor="jobIdInput">Job ID:</label>
                    <input type="text" className="offset-1" id="jobIdInput" onChange={onChangeJobId}/>
                </div>
            </div>
            {jobId && geneset &&
                <RenderGSEATable jobId={jobId} geneset={geneset} isGseaLookup={true}/>
            }
        </div>
    )
}

export default GseaLookup
