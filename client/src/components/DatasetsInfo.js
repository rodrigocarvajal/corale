import React, { useEffect } from 'react';
import {AgGridReact} from 'ag-grid-react';
import HttpService from '../services/HttpService';
import routes from '../resources/json/routes.json';

function DatasetInfo() {

    const DOWNLOAD_FIELD = 'downloadCoraleData';

    const [columnDefs, setColumnDefs] = React.useState();
    const [rowData, setRowData] = React.useState();

    // eslint-disable-next-line 
    const [gridApi, setGridApi] = React.useState(null);

     // eslint-disable-next-line 
    const [gridColumnApi, setGridColumnApi] = React.useState(null);

    // eslint-disable-next-line 
    const [datasets, setDatasets] = React.useState();

    useEffect(() => {
        HttpService.get(routes.server.root + routes.server.summaryGet)
            .then(res => {

                let rDatasets = res.data.summary;

                rDatasets.sort((a, b) => {
                    const aname = a.Dataset.toLowerCase();
                    const bname = b.Dataset.toLowerCase();

                    if (aname < bname)
                        return -1;
                    if (aname > bname)
                        return 1;
                    return 0;
                });

                setColumnDefs(_create_column_defs());
                setRowData(_create_row_data(rDatasets));
            });;
    }, []);

    const onGridReady = params => {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
        
        setTimeout(() => {
            params.api.resetRowHeights(); 
        }, 1500);
        
    };

    const _create_column_defs = () => {

        const WebsiteCellRenderer = params => {
            return `<a href="${params.value}" target="_blank">${params.value}</a>`
        };

        const DownloadCoraleDataRenderer = params => {
            if (params.value === 'GSE51010_corale.txt') {
                params.value = 'GSE51010-hgfocus_corale.txt';
            }
            const url = process.env.REACT_APP_FILESERVER_HOST + ':' + process.env.REACT_APP_FILESERVER_PORT + process.env.REACT_APP_FILESERVER_CORALE_TXT_PATH + '/' + params.value;
            return `<a href=${url}>Download</span>`
        };

        const PubmedRenderer = params => {
            if (params.value === "" || params.value === null || params.value === undefined) {
                return '';
            } else {
                const PUBMED_URL = 'https://pubmed.ncbi.nlm.nih.gov/';
                const pubmedIds = params.value.split(';');
                
                if (pubmedIds.length > 1) {
                    let output = '';
                    let id = '';
                    for (let i = 0; i < pubmedIds.length; i++) {
                        id = pubmedIds[i].replace(' ', '');
                        if (i === pubmedIds.length - 1)
                            output += `<a href=${PUBMED_URL + id} target="_blank">${id}</a>`;
                        else 
                            output += `<a href=${PUBMED_URL + id} target="_blank">${id}</a>,<br> `;

                    }
                    return output;
                }
                return `<a href=${PUBMED_URL + params.value} target="_blank">${params.value}</a>`
            }
        };

        const RemoveSemicolonRenderer = params => {
            return `<span>${params.value.replace(';', '')}</span>`;
        };

        return [
            { headerName: 'Dataset', field: 'Dataset', filter: 'agTextColumnFilter', width: 120, suppressSizeToFit: false },
            { headerName: 'Download Corale Data', field: DOWNLOAD_FIELD, width: 180, cellRenderer: (params)=>DownloadCoraleDataRenderer(params) },
            { headerName: 'Platform', field: 'PLATFORM', filter: 'agTextColumnFilter', width: 300, suppressSizeToFit: false, wrapText: true, autoHeight: true, cellRenderer: (params)=> RemoveSemicolonRenderer(params) },
            { headerName: 'Title', field: 'TITLE', filter: 'agTextColumnFilter', width: 300, suppressSizeToFit: false, wrapText: true, autoHeight: true, cellRenderer: (params)=> RemoveSemicolonRenderer(params) },
            { headerName: 'Dataset Type', field: 'DATASET_TYPE', filter: 'agTextColumnFilter', width: 130, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Pubmed', field: 'PUBMED', filter: 'agNumberColumnFilter', width: 120, suppressSizeToFit: false, wrapText: true, autoHeight: true, cellRenderer: (params)=>PubmedRenderer(params) },
            { headerName: 'Website', field: 'Website', filter: 'agTextColumnFilter', width: 440, cellRenderer: (params)=>WebsiteCellRenderer(params), suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Sample Number', field: 'Sample Number', filter: 'agNumberColumnFilter', width: 150, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Age', field: 'AGE', filter: '', width: 60, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Alcohol', field: 'ALCOHOL', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Recurrent', field: 'RECURRENT', filter: 'agTextColumnFilter', width: 110, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'OS', field: 'OS', filter: 'agTextColumnFilter', width: 80, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Grade', field: 'Grade', filter: 'agTextColumnFilter', width: 90, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'HPV+', field: 'HPV+', filter: 'agTextColumnFilter', width: 80, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'HPV-', field: 'HPV-', filter: 'agTextColumnFilter', width: 80, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Race', field: 'Race', filter: 'agTextColumnFilter', width: 70, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Gender', field: 'Gender', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Smoking', field: 'Smoking', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Stage M', field: 'Stage M', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Stage N', field: 'Stage N', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Stage T', field: 'Stage T', filter: 'agTextColumnFilter', width: 100, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Tumor Site | Hypopharynx', field: 'TUMOR_SITE|HYPOPHARYNX', filter: 'agTextColumnFilter', width: 210, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Tumor Site | Larynx', field: 'TUMOR_SITE|LARYNX', filter: 'agTextColumnFilter', width: 200, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Tumor Site | Oral Cavity', field: 'TUMOR_SITE|ORAL CAVITY', filter: 'agTextColumnFilter', width: 200, suppressSizeToFit: false, wrapText: true, autoHeight: true },
            { headerName: 'Tumor Site | Oropharynx', field: 'TUMOR_SITE|OROPHARYNX', filter: 'agTextColumnFilter', width: 200, suppressSizeToFit: false, wrapText: true, autoHeight: true }
        ];
    };

    const _create_row_data = data => {
        const tRowData = [];
        data.forEach(obj => {
            let row = {};
            Object.keys(obj).forEach(key => {
                row = { ...row, [key]: obj[key] };
            });
            row = { ...row, [DOWNLOAD_FIELD]: obj.Dataset + '_corale.txt' };
            tRowData.push(row);
        });
        return tRowData;
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-11 offset-1">
                    <h3>Download Datasets</h3>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Download normalized/harmonized datasets.
                </div>
            </div>
            <div className="spacer"/>
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

export default DatasetInfo
