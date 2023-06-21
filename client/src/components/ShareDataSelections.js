import React, {useEffect} from 'react';
import {AgGridReact} from 'ag-grid-react';
import FilterFeatures from './FilterFeatures';
import GroupingSelections from './GroupingSelections';
import RenderGSEATable from './renderPlots/RenderGSEATable';
import BoxViolinPlot from './renderPlots/BoxViolinPlot';
import Correlation from './renderPlots/Correlation';
import KaplanMeier from './renderPlots/KaplanMeier';
import Heatmap from './renderPlots/Heatmap';
import routes from '../resources/json/routes.json';
import HttpService from '../services/HttpService';
import AgGridDataService from '../services/AgGridDataService';
import ValidationService from '../services/ValidationService';
import TransformDataService from '../services/TransformDataService'
import sessionj from '../resources/json/session.json';
import {plotSelections} from '../resources/json/plotSelections.json';
import WheelSVG from '../resources/svg/adjust-solid.svg';
import ProcessingWheelSVG from '../resources/svg/adjust-solid-processing.svg';

function ShareDataSelections(props) {

    const CLUSTER_DATA_TYPES = { gene: 'gene', tme: 'tme', tmeOne: 'tmeOne', tmeAll: 'tmeAll' };

    const [resetKey] = React.useState('first');
    // eslint-disable-next-line 
    const [datasets, setDatasets] = React.useState();
    const [selectedDataset, setSelectedDataset] = React.useState();
    const [datasetRowSelected, setDatasetRowSelected] = React.useState(false);
    const [geneList, setGeneList] = React.useState();
    const [validationError, setValidationError] = React.useState();
    const [errorResponse, setErrorResponse] = React.useState();
    const [plotSelection, setPlotSelection] = React.useState();
    const [jobId, setJobId] = React.useState();
    const [showPlot, setShowPlot] = React.useState(false);
    const [plotData, setPlotData] = React.useState();
    const [userParameters, setUserParameters] = React.useState();
    const [jobSubmissionMessage, setJobSubmissionMessage] = React.useState();
    const [invalidClusterMessage, setInvalidClusterMessage] = React.useState();
    const [missingGenesClusterList, setMissingGenesClusterList] = React.useState();
    const [showDownloadHeatmap, setShowDownloadHeatmap] = React.useState(false);
    const [heatmapImgUrl, setHeatmapImgUrl] = React.useState();
    const [dataLoading, setDataLoading] = React.useState(true);
    const [tmeArrayHeatmap, setTmeArrayHeatmap] = React.useState();

    // eslint-disable-next-line 
    const [gridApi, setGridApi] = React.useState(null);
     // eslint-disable-next-line 
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [rowData, setRowData] = React.useState();
    const [columnDefs, setColumnDefs] = React.useState();

    const agGridRef = React.createRef();

    useEffect(() => {
        sessionStorage.setItem(sessionj.targetSelection, '');
    }, []);

    useEffect(() => {
        if (props.tmeCellLineMethodArraySubscription) {
            props.tmeCellLineMethodArraySubscription.subscribe(res => {
                setTmeArrayHeatmap(res);
            });

            return () => {
                props.tmeCellLineMethodArraySubscription.unsubscribe();
            }
        }
    }, [props.tmeCellLineMethodArraySubscription, props.plotSelection]);

    useEffect(() => {
        setDataLoading(true);
        HttpService.post(routes.server.root + routes.server.datasetsGet, { plotSelection: props.plotSelection })
            .then(res => {
                let rDatasets = res.data.datasets;

                rDatasets.sort((a, b) => {
                    const aname = a.cohort.toLowerCase();
                    const bname = b.cohort.toLowerCase();

                    if (aname < bname)
                        return -1;
                    if (aname > bname)
                        return 1;
                    return 0;
                });
                
                setDatasets(rDatasets);
                setRowData(AgGridDataService.createRowData(rDatasets));
                setColumnDefs(AgGridDataService.createMetaColumnDefs());
            })
            .catch(err => {
                console.log(err.response);
            });
    }, [props.plotSelection]);

    useEffect(() => {     
        if (selectedDataset) {
            const url = routes.server.root + routes.server.datasetGenesGet;
            HttpService.post(url, { dataset: selectedDataset })
                .then(res => {
                    setGeneList(res.data.geneList);
                });
        }
    }, [selectedDataset]);

    useEffect(() => {
        if (props.plotSelection) {
            setPlotSelection(props.plotSelection);
        }
    }, [props.plotSelection]);

    useEffect(() => {
        if (dataLoading) {
            agGridRef.current.style.visibility = 'hidden';
        } else {
            agGridRef.current.style.visibility = 'visible';
        }
    }, [dataLoading, agGridRef]);

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        
        setTimeout(() => {
            params.api.sizeColumnsToFit();   
            params.api.resetRowHeights(); 
            
            params.api.forEachNode((node, index) => {
                if (index === 0) {
                    node.setSelected(true);
                }
            });
            setDataLoading(false);
        }, 4500);
        
    };

    const onGridRowSelect = e => {
        if (gridApi.getSelectedRows()[0]) {
            setSelectedDataset(gridApi.getSelectedRows()[0].cohort);
            setDatasetRowSelected(!datasetRowSelected);

            if (props.datasetSubscription) { // BehaviorSubject from MainHeatmap.js
                props.datasetSubscription.next(gridApi.getSelectedRows()[0].cohort);
            }
        } else {
            setSelectedDataset();
            setDatasetRowSelected();
        }
    };

    const onSubmit = () => {
        let isValidCluster = true;
        let isValidGeneral = true;
        let validRes = { err: false };
        const jobSubmittedMessage = 'Job submitted.  Please wait while we prepare the results.';

        setShowPlot(false);
        setInvalidClusterMessage();
        setMissingGenesClusterList();
        const groupingSelections = JSON.parse(sessionStorage.getItem(sessionj.groupingSelections));
        const tPlotSelection = sessionStorage.getItem(sessionj.plotSelection);
        setPlotSelection(tPlotSelection);

        const tUserParameters = {
            filters: JSON.parse(sessionStorage.getItem(sessionj.filterFeatures)),
            grouping: groupingSelections.grouping,
            groupingGene: groupingSelections.groupingGene,
            groupingMutation: groupingSelections.groupingMutation,
            groupingTme: groupingSelections.groupingTme,
            targets: sessionStorage.getItem(sessionj.targetSelection),
            plot: tPlotSelection,
            gseaGeneset: sessionStorage.getItem(sessionj.gseaGeneset),
            gseaMultiClinicalFeature: JSON.parse(sessionStorage.getItem(sessionj.gseaMultiClinicalFeature))
        };
        
        let parameters = { ...tUserParameters, dataset: selectedDataset };
        setErrorResponse(null);
        setUserParameters(tUserParameters);
        if (props.plotSelection !== plotSelections.heatmap && props.geneExprOrTme !== CLUSTER_DATA_TYPES.tme && props.selectOneOrAllTmeFeatures === CLUSTER_DATA_TYPES.tmeOne) {
            validRes = ValidationService.validate(parameters);
        }

        if (props.plotSelection === plotSelections.boxplot || props.plotSelection === plotSelections.violin) {
            if (tUserParameters.targets === '' || tUserParameters.targets === null || tUserParameters.targets === undefined) {
                setInvalidClusterMessage('Please provide Target Feature selection');
                isValidGeneral = false;
            }
        }

        if (props.plotSelection === plotSelections.heatmap && props.geneExprOrTme === CLUSTER_DATA_TYPES.tme && props.selectOneOrAllTmeFeatures === CLUSTER_DATA_TYPES.tmeOne) {
            parameters.groupingTme = tmeArrayHeatmap;
            tUserParameters.groupingTme = tmeArrayHeatmap;
            isValidCluster = ValidationService.validateCluster(tUserParameters.groupingTme);
            if (!isValidCluster) {
                setInvalidClusterMessage('Please select TME Immune cell type');
            }
        }

        if (props.plotSelection === plotSelections.heatmap && props.geneExprOrTme === CLUSTER_DATA_TYPES.gene && (!props.geneList || props.geneList.length < 1)) {
            setInvalidClusterMessage('Please provide gene list');
            isValidCluster = false;
        }

        if (!validRes.err && isValidCluster && isValidGeneral) {
            setValidationError();
            setJobSubmissionMessage(jobSubmittedMessage);
            let transformedUserParameters = ValidationService.transformFilterFieldsForServer(parameters);
            transformedUserParameters = ValidationService.transformGroupingFieldForServer(transformedUserParameters);

            let body;
            if (plotSelection === plotSelections.heatmap) {
                body = { ...transformedUserParameters, geneList: props.geneList, geneExprOrTme: props.geneExprOrTme, selectedClusterMetric: props.selectedClusterMetric, selectedClusterLinkage: props.selectedClusterLinkage, showOneOrAllTme: props.selectOneOrAllTmeFeatures };
            } else {
                body = transformedUserParameters
            }

            HttpService.post(routes.server.root + routes.server.submitJob, body)
                .then(res => {
                    setJobSubmissionMessage();

                    if (res.data.job.missingGenesCluster && res.data.job.missingGenesCluster.length > 0) {
                        setMissingGenesClusterList(res.data.job.missingGenesCluster.sort());
                    }

                    if (res.data.job && res.data.job.err) {
                        setErrorResponse(res.data.job.message);
                    
                    } else if (res.data.job && res.data.job.results && res.data.job.results.error) {
                        setErrorResponse(res.data.job.results.message);
                    
                    } else {
                        let jobId;
                        res.data.jobId ? jobId = res.data.jobId : jobId = res.data.job.results.jobId;
                        
                        HttpService.post(routes.server.root + routes.server.jobParametersSave, { params: transformedUserParameters, jobId });

                        if (props.plotSelection === plotSelections.heatmap) {
                            setShowDownloadHeatmap(true);
                            setHeatmapImgUrl(process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + process.env.REACT_APP_FILESERVER_CORALE_JOB_PATH + '/' + res.data.job.results.jobId + '/' + res.data.job.results.filename);
                        }

                        if (tPlotSelection === plotSelections.gsea) {
                            setJobId(res.data.job.results.jobId);
                        } else {
                            const tranformedResponse = TransformDataService.tranformClinicalInfoField(res.data.job);
                            setPlotData(tranformedResponse);
                            setShowPlot(true);
                        }
                    }
                });

        } else {
            setValidationError(validRes);
        }

    };

    return (
        <React.Fragment key={resetKey}>
            <p/>
            <div className="row">
                <div className="boldFieldHeader" id="datasetSelectAgGridHeader">
                    Select Dataset:
                </div> 
            </div>
            {dataLoading &&
                <div className="row justify-content-center">
                    <div className="col-3" style={{textAlign: 'center'}}>
                        <img src={WheelSVG} className="loadingDataWheelLarge" alt="loading.svg"/>
                    </div>
                </div>
            }
            <div className="row agGridVisibility" ref={agGridRef}>
                <div className="ag-theme-balham" id="datasetSelectAgGrid">
                    <AgGridReact
                        onGridReady={onGridReady}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{ sortable: true, filter: true, resizable: true }}
                        rowSelection={'single'}
                        onSelectionChanged={onGridRowSelect}
                    >
                    </AgGridReact>
                </div>
            </div>
            <p/>
            <div className="offset-1">
                <FilterFeatures dataset={selectedDataset}/>
            </div>
            <p/>
            {geneList && geneList.length > 0 &&
                <div className="offset-1">
                    <GroupingSelections dataset={selectedDataset} geneList={geneList} datasetRowSelected={datasetRowSelected} plotSelection={props.plotSelection} geneExprOrTme={props.geneExprOrTme} selectOneOrAllTmeFeatures={props.selectOneOrAllTmeFeatures} />
                </div>
            }
            <p/>
            {validationError && validationError.err &&
                <div className="offset-1">
                    <div className="col-6 errorMessage">
                        {validationError.message}
                    </div>
                </div>
            }
            <div className="offset-1">
                <div className="col-1 submitButton" onClick={onSubmit}>
                    Submit
                </div>
            </div>
            <p/>
            <div className="lineDivide"/>
            <div className="offset-1">
                {plotSelection === 'gsea' && jobId &&
                    <React.Fragment>
                        <RenderGSEATable jobId={jobId} geneset={userParameters.gseaGeneset} isGseaLookup={false}/>
                    </React.Fragment>
                }
            </div>
            <p/>
            {errorResponse &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-4 offset-1 errorMessage">
                            {errorResponse}
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {invalidClusterMessage &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-4 offset-1 errorMessage">
                            {invalidClusterMessage}
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {jobSubmissionMessage &&
                <React.Fragment>
                    <div className="row">
                        <div className="offset-1">
                            <img src={ProcessingWheelSVG} className="loadingDataWheel" alt="processing-data.svg"/>
                        </div>
                        <div className="col-4 attentionMessage">
                            {jobSubmissionMessage}
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {missingGenesClusterList && missingGenesClusterList.length > 0 &&
                <React.Fragment>
                    <div className="row">
                        <h4 className="offset-1">Missing Genes:</h4>
                    </div>
                    <div className="col-2 offset-1 missingGenesBox">
                        {missingGenesClusterList.map((gene, i) => {
                            return (
                                <div className="row" key={i}>
                                    <div className="col-12">
                                        {gene}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <p/>
                </React.Fragment>
            }
            {showPlot && (plotSelection === plotSelections.boxplot || plotSelection === plotSelections.violin) &&
                <BoxViolinPlot data={plotData} jobId={jobId} plotSelection={plotSelection}/>
            }
            {showPlot && plotSelection === plotSelections.correlation &&
                <Correlation data={plotData} jobId={jobId}/>
            }
            {showPlot && plotSelection === plotSelections.survival &&
                <KaplanMeier data={plotData} userParameters={userParameters}/>
            }
            {showPlot && plotSelection === plotSelections.heatmap &&
                <Heatmap data={plotData} userParameters={userParameters} geneList={props.geneList} geneExprOrTme={props.geneExprOrTme} selectedClusterMetric={props.selectedClusterMetric} selectedClusterLinkage={props.selectedClusterLinkage}/>
            }
            {showDownloadHeatmap &&
                <React.Fragment>
                    <p/>
                    <div className="row">
                        <div className="col-11 offset-1">
                            <a className="downloadHeatmap" href={heatmapImgUrl} target="_blank" rel="noreferrer">Download Clustermap</a> to view full size image.
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }

        </React.Fragment>
    )
}

export default ShareDataSelections
