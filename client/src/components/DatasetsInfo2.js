import React, { useEffect } from 'react'
import {AgGridReact} from 'ag-grid-react';
import AgGridDataService from '../services/AgGridDataService';
import HttpService from '../services/HttpService';
import routes from '../resources/json/routes.json';

function DatasetsInfo() {

    // eslint-disable-next-line 
    const [gridApi, setGridApi] = React.useState(null);

     // eslint-disable-next-line 
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    // eslint-disable-next-line 
    const [datasets, setDatasets] = React.useState();
    const [rowData, setRowData] = React.useState();
    const [columnDefs, setColumnDefs] = React.useState();

    useEffect(() => {
        HttpService.get(routes.server.root + routes.server.datasetsDetailsGet)
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

                setDatasets(rDatasets)
                setRowData(AgGridDataService.createRowData(rDatasets));
                setColumnDefs(AgGridDataService.createDetailedMetaColumnDefs());
            });
    }, []);

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        
        setTimeout(() => {
            params.api.resetRowHeights(); 
        }, 1500);
        
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="ag-theme-balham" id="datasetInfoAgGrid">
                    <AgGridReact
                        onGridReady={onGridReady}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    >
                    </AgGridReact>
                </div>
            </div>
        </React.Fragment>
    )
}

export default DatasetsInfo
