import React, {useEffect} from 'react';
import {AgGridReact} from 'ag-grid-react';
import FilterFeatures from './FilterFeatures';
import GroupingSelections from './GroupingSelections';
import RenderGSEATable from './renderPlots/RenderGSEATable';
import BoxViolinPlot from './renderPlots/BoxViolinPlot';
import Correlation from './renderPlots/Correlation';
import KaplanMeier from './renderPlots/KaplanMeier';
import routes from '../resources/json/routes.json';
import HttpService from '../services/HttpService';
import AgGridDataService from '../services/AgGridDataService';
import ValidationService from '../services/ValidationService';
import sessionj from '../resources/json/session.json';

function Home() {

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

    // eslint-disable-next-line 
    const [gridApi, setGridApi] = React.useState(null);
     // eslint-disable-next-line 
    const [gridColumnApi, setGridColumnApi] = React.useState(null);
    const [rowData, setRowData] = React.useState();
    const [columnDefs, setColumnDefs] = React.useState();

    useEffect(() => {
        HttpService.get(routes.server.root + routes.server.datasetsGet)
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
    }, []);

    useEffect(() => {     
        if (selectedDataset) {
            const url = routes.server.root + routes.server.datasetGenesGet;
            HttpService.post(url, { dataset: selectedDataset })
                .then(res => {
                    setGeneList(res.data.geneList);
                });
        }
    }, [selectedDataset]);

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

        }, 2500);
        
    };

    const onGridRowSelect = e => {
        if (gridApi.getSelectedRows()[0]) {
            setSelectedDataset(gridApi.getSelectedRows()[0].cohort);
            setDatasetRowSelected(!datasetRowSelected);
        } else {
            setSelectedDataset();
            setDatasetRowSelected();
        }
    };

    const onSubmit = () => {
        setShowPlot(false);
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
            gseaGeneset: sessionStorage.getItem(sessionj.gseaGeneset)
        };
        
        let parameters = { ...tUserParameters, dataset: selectedDataset };
        const validRes = ValidationService.validate(parameters);
        setErrorResponse(null);
        setUserParameters(tUserParameters);

        if (!validRes.err) {
            setValidationError();
            let transformedUserParameters = ValidationService.transformFilterFieldsForServer(parameters);
            transformedUserParameters = ValidationService.transformGroupingFieldForServer(transformedUserParameters);

            HttpService.post(routes.server.root + routes.server.submitJob, transformedUserParameters)
                .then(res => {

                    if (res.data.job && res.data.job.err) {
                        setErrorResponse(res.data.job.message);
                    
                    } else if (res.data.job && res.data.job.results && res.data.job.results.error) {
                        setErrorResponse(res.data.job.results.message);
                    
                    } else {
                        if (tPlotSelection === 'gsea') {
                            setJobId(res.data.job.results.jobId);
                        } else {
                            setPlotData(res.data.job);
                            setShowPlot(true);
                        }
                    }
                });

        } else {
            setValidationError(validRes);
        }

    };

    return (
        <React.Fragment>
            <p/>
            <div className="row">
                <div className="boldFieldHeader" id="datasetSelectAgGridHeader">
                    Select Dataset:
                </div>
            </div>
            <div className="row">
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
                    <GroupingSelections dataset={selectedDataset} geneList={geneList} datasetRowSelected={datasetRowSelected}/>
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
                <div className="col-2 submitButton" onClick={onSubmit}>
                    Submit
                </div>
            </div>
            <p/>
            <div className="offset-1">
                {plotSelection === 'gsea' && jobId &&
                    <React.Fragment>
                        <RenderGSEATable jobId={jobId} geneset={userParameters.gseaGeneset} isGseaLookup={true}/>
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
            {showPlot && (plotSelection === 'boxplot' || plotSelection === 'violin') &&
                <BoxViolinPlot data={plotData} jobId={jobId} plotSelection={plotSelection}/>
            }
            {showPlot && plotSelection === 'correlation' &&
                <Correlation data={plotData} jobId={jobId}/>
            }
            {showPlot && plotSelection === 'km' &&
                <KaplanMeier data={plotData} userParameters={userParameters}/>
            }
        </React.Fragment>
    )
}

export default Home
