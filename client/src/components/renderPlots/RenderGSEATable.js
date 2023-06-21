import React, { useEffect } from 'react';
import {AgGridReact} from 'ag-grid-react';
import HttpService from '../../services/HttpService';
import AgGridDataService from '../../services/AgGridDataService';
import routes from '../../resources/json/routes.json';

function RenderGSEATable(props) {

    const [rowDataNegativeNes, setRowDataNegativeNes] = React.useState();
    const [rowDataPositiveNes, setRowDataPositiveNes] = React.useState();
    const [selectedGseaPlot, setSelectedGseaPlot] = React.useState();
    const [jobId, setJobId] = React.useState();
    const [files, setFiles] = React.useState();
    const [httpError, setHttpError] = React.useState();
    const [httpErrMessage, setHttpErrMessage] = React.useState();
    const [httpPercentComplete, setHttpPercentComplete] = React.useState();
    const [httpWarning, setHttpWarning] = React.useState();
    const [httpWarningMessage, setHttpWarningMessage] = React.useState();
    const [jobParams, setJobParams] = React.useState();
    const [gseaPositiveClass, setGseaPositiveClass] = React.useState();
    const [gseaNegativeClass, setGseaNegativeClass] = React.useState();
    const [showDownloadZipArchive, setShowDownloadZipArchive] = React.useState(false);
    const [gseaZipArchiveUrl, setGseaZipArchiveUrl] = React.useState();

    // eslint-disable-next-line 
    const [gridApi, setGridApi] = React.useState(null);
    // eslint-disable-next-line 
    const [gridApi2, setGridApi2] = React.useState(null);
     // eslint-disable-next-line 
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    // eslint-disable-next-line 
    const [gridColumnApi2, setGridColumnApi2] = React.useState(null);
    const [columnDefs, setColumnDefs] = React.useState();

    useEffect(() => {
        if (props.geneset) {
            setFiles();
            setHttpError();
            setHttpErrMessage();
            setHttpPercentComplete();
        }
    }, [props.geneset]);

    useEffect(() => {
        getGseaFileList(props.jobId, props.geneset);
        setJobId(props.jobId);
    }, [props]);

    useEffect(() => {

        const FORMATTED_NES_FIELDS = ['es', 'nes', 'pval', 'fdr'];

        const _createNes = (data, isPositiveNes) => {
            let filterSortedNes;
            if (isPositiveNes) {
                filterSortedNes = data.filter(obj => obj.nes >= 0);
                filterSortedNes.sort((a, b) => b.nes - a.nes);
            } else {
                filterSortedNes = data.filter(obj => obj.nes < 0);
                filterSortedNes.sort((a, b) => a.nes - b.nes);
            }
    
            const fFilterSortedNes = [];
            filterSortedNes.forEach(obj => {
                let tobj = {};
                Object.keys(obj).forEach(key => {
                    if (FORMATTED_NES_FIELDS.includes(key)) {
                        tobj = { ...tobj, [key]: obj[key].toFixed(4) };
                    } else {
                        tobj = { ...tobj, [key]: obj[key] };
                    }
                });
                fFilterSortedNes.push(tobj);
            });
            return fFilterSortedNes;
        };

        if (files && files.length > 0) {
            HttpService.post(routes.server.root + routes.server.gseaGenesetReportPost, { jobId: props.jobId })
                .then(res => {
                    const archiveUrl = process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + process.env.REACT_APP_FILESERVER_CORALE_JOB_PATH + '/' + props.jobId + '/gsea_archive_' + props.jobId + '.zip';
                    setShowDownloadZipArchive(true);
                    setGseaZipArchiveUrl(archiveUrl);
                    let isPositiveNes = false;
                    setRowDataNegativeNes(_createNes(res.data.report, isPositiveNes))
                    isPositiveNes = true;
                    setRowDataPositiveNes(_createNes(res.data.report, isPositiveNes))

                    setColumnDefs(AgGridDataService.createNesColumnDefs());
                    HttpService.post(routes.server.root + routes.server.jobParametersGet, { jobId: props.jobId })
                        .then(res2 => {
                            setJobParams(res2.data);
                            if (res2.data.pos_class) {
                                setGseaPositiveClass(res2.data.pos_class);
                            }
                            if (res2.data.neg_class) {
                                setGseaNegativeClass(res2.data.neg_class);
                            }
                        });
                });
        }
    }, [files, props.jobId, props.isGseaLookup]);

    const getGseaFileList = (tJobId, geneset) => {
        setHttpError(null);
        setHttpErrMessage(null);
        setHttpPercentComplete();

        HttpService.post(routes.server.root + routes.server.jobParametersGet, { jobId: tJobId })
            .then(resJobParams => {
                if (!resJobParams.data.error) {
                    HttpService.post(routes.server.root + routes.server.gseaFileListGet, { jobId: tJobId, geneset })
                    .then(res => {
                        if (!res.data.err) {
                            const orderedFiles = res.data.files;
                            orderedFiles.sort().reverse();
                            setFiles(orderedFiles);
                            setHttpWarning(null);
                            setHttpWarningMessage(null);
                        } else {
                            setFiles(null);
                            setHttpWarning(res.data.err);
                            setHttpWarningMessage(res.data.message);
                            setHttpPercentComplete(res.data.percentComplete);
                        }
                    })
                    .catch(err => {
                        // console.log(err.response);
                    });
                } else {
                    setHttpError(true);
                    setHttpErrMessage(resJobParams.data.errorMsg);
                }
            });
    };

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    };

    const onGridReady2 = params => {
        setGridApi2(params.api);
        setGridColumnApi2(params.columnApi);    
    };

    const onGridRowSelect = e => {
        if (gridApi.getSelectedRows()[0]) {
            setSelectedGseaPlot(gridApi.getSelectedRows()[0].term);
        }
    };

    const onGridRowSelect2 = e => {
        if (gridApi2.getSelectedRows()[0]) {
            setSelectedGseaPlot(gridApi2.getSelectedRows()[0].term);
        }
    };

    const onClickRefresh = () => {
        if (jobId) {
            getGseaFileList(jobId, props.geneset);
        } else {
            getGseaFileList(props.jobId, props.geneset);
        }
    };

    const onChangeJobId = e => {
        setJobId(e.target.value);
    };

    const formatGseaGroupingPrarms = () => {
        let innerhtml;
        if (jobParams.grouping !== '' && jobParams.grouping !== null) {
            innerhtml = <div className="col-12"><span className="boldFieldHeader">Grouping Clinical Feature:</span> {jobParams.grouping}</div>
        } else if (jobParams.groupingGene !== '' && jobParams.groupingGene !== null) {
            innerhtml = <div className="col-12"><span className="boldFieldHeader">Grouping Gene:</span> {jobParams.groupingGene}</div>
        } else if (jobParams.groupingMutation !== '' && jobParams.groupingMutation !== null) {
            innerhtml = <div className="col-12"><span className="boldFieldHeader">Grouping Mutation:</span> {jobParams.groupingMutation}</div>
        } else if (jobParams.groupingTme !== '' && jobParams.groupingTme !== null) {
            innerhtml = <div className="col-12"><span className="boldFieldHeader">Grouping TME:</span> {jobParams.groupingTme.replace('CIBERSORTx', 'CIBERSORT')}</div>
        } else {
            innerhtml = <div className="col-12"><span className="boldFieldHeader">Grouping Feature:</span> None Selected</div>
        }
        return (
            <div className="row">
                {innerhtml}
            </div>
        )
    };

    return (
        <React.Fragment key={new Date()}>
            <div className="col-10 spacer"/>
            {showDownloadZipArchive &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-12">
                            <a href={gseaZipArchiveUrl} className="downloadGseaArchive">Download GSEA Archive</a>
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {props.isGseaLookup && jobParams &&
                <React.Fragment>
                    <div className="col-11 gseaUserParams">
                        <div className="col-12" style={{textAlign: 'center'}}>
                            <h5>User Parameters</h5>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <span className="boldFieldHeader">Dataset:</span> {jobParams.dataset}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <span className="boldFieldHeader">Filters:</span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-11" style={{marginLeft: '1em'}}>
                                <pre>{JSON.stringify(jobParams.filters, null, 2)}</pre>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-11">
                                {formatGseaGroupingPrarms()}
                            </div>
                        </div>
                    </div>
                    <div className="spacer"/>
                </React.Fragment>
            }
            {gseaPositiveClass &&
                <React.Fragment>
                    <div className="col-11 gseaUserParams">
                        <div className="col-12" style={{textAlign: 'center'}}>
                            <h5>Feature Positive Class</h5>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <span className="boldFieldHeader">Class: </span> 
                                {Array.isArray(gseaPositiveClass) &&
                                    gseaPositiveClass.map((val, i) => {
                                        if (i < gseaPositiveClass.length-1)
                                            return val + ', ';
                                        else
                                            return val;
                                    })
                                }
                                {!Array.isArray(gseaPositiveClass) &&
                                    gseaPositiveClass
                                }
                            </div>
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            <p/>
            {gseaNegativeClass &&
                <React.Fragment>
                    <div className="col-11 gseaUserParams">
                        <div className="col-12" style={{textAlign: 'center'}}>
                            <h5>Feature Negative Class</h5>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                <span className="boldFieldHeader">Class: </span>
                                {Array.isArray(gseaNegativeClass) &&
                                    gseaNegativeClass.map((val, i) => {
                                        if (i < gseaNegativeClass.length-1)
                                            return val + ', ';
                                        else
                                            return val;
                                    })
                                }
                                {!Array.isArray(gseaNegativeClass) &&
                                    gseaNegativeClass
                                }
                            </div>
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {files &&
                <React.Fragment>
                    <div>Positive NES:</div>
                    <div className="row">
                        <div className="ag-theme-balham" id="agGridPositiveNes">
                            <AgGridReact
                                onGridReady={onGridReady2}
                                rowData={rowDataPositiveNes}
                                columnDefs={columnDefs}
                                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                                rowSelection={'single'}
                                onSelectionChanged={onGridRowSelect2}
                            >
                            </AgGridReact>
                        </div>
                    </div>
                    <p/>
                    <div>Negative NES:</div>
                    <div className="row">
                        <div className="ag-theme-balham" id="agGridNegativeNes">
                            <AgGridReact
                                onGridReady={onGridReady}
                                rowData={rowDataNegativeNes}
                                columnDefs={columnDefs}
                                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                                rowSelection={'single'}
                                onSelectionChanged={onGridRowSelect}
                            >
                            </AgGridReact>
                        </div>
                    </div>
                    <p/>
                    {selectedGseaPlot &&
                        <div className="row">
                            <div className="col-6">
                                <img className="col-12" src={process.env.REACT_APP_FLASK_HOST + ':' + process.env.REACT_APP_FLASK_PORT + process.env.REACT_APP_FLASK_PROXY_URL_PREFIX + routes.server.root + routes.server.gseaImgGet + '?jobId=' + props.jobId + '&img=' + selectedGseaPlot + '.gsea.jpg'} alt={selectedGseaPlot}/>
                            </div>
                        </div>
                    }
                </React.Fragment>
            }
            {(httpError || httpWarning) && props.jobId &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-6 attentionMessage">
                            GSEA Analysis may take 10 minutes or longer to complete.
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 attentionMessage">
                            {httpWarningMessage}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 errorMessage">
                            {httpErrMessage}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6 attentionMessage">
                            Job completion: {httpPercentComplete}%
                        </div>
                    </div>
                    {!props.isGseaLookup &&
                        <div className="row">
                            <div className="col-6 attentionMessage">
                                <input type="text" placeholder={props.jobId} value={jobId} onChange={onChangeJobId}/>
                            </div>
                        </div>
                    }
                    <p/>
                    <div className="col-2 submitButton" onClick={onClickRefresh}>
                        Refresh
                    </div>
                </React.Fragment>
            }
        </React.Fragment>
    )
}

export default RenderGSEATable
