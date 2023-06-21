class AgGridDataService {

    createRowData = rawDatasets => {
        const rowData = [];

        rawDatasets.forEach(dataset => {
            let obj = {};
            Object.keys(dataset).forEach(key => {
                obj = { ...obj, [key.toLowerCase()]: dataset[key] }
            });
            rowData.push(obj);
        });

        return rowData;
    };

    
    createMetaColumnDefs = () => {
        return [
            { headerName: 'Cohort', field: 'cohort', filter: 'agTextColumnFilter', width: 180, suppressSizeToFit: true, checkboxSelection: true, cellStyle: { color: '#257cff' } },
            { headerName: 'N Samples', field: 'n_samples', filter: 'agNumberColumnFilter', width: 120, suppressSizeToFit: true },
            { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter', width: 180, suppressSizeToFit: false, wrapText: true, autoHeight: true }
        ];
    };

    createNesColumnDefs = () => {
        return [
            { headerName: 'term', field: 'term', filter: 'agTextColumnFilter', width: 310, cellStyle: { color: '' } },
            { headerName: 'es', field: 'es', filter: 'agNumberColumnFilter'  },
            { headerName: 'nes', field: 'nes', filter: 'agNumberColumnFilter'  },
            { headerName: 'pval', field: 'pval', filter: 'agNumberColumnFilter'  },
            { headerName: 'fdr', field: 'fdr', filter: 'agNumberColumnFilter'  },
            { headerName: 'geneset_size', field: 'geneset_size', filter: 'agNumberColumnFilter'  },
            { headerName: 'matched_size', field: 'matched_size', filter: 'agNumberColumnFilter'  },
            { headerName: 'genes', field: 'genes', filter: ''  },
            { headerName: 'ledge_genes', field: 'ledge_genes', filter: ''  }
        ];
    };

    createDetailedMetaColumnDefs = () => {

        function PubmedCellRenderer() {};

        PubmedCellRenderer.prototype.init = params => {
            this.eGui = document.createElement('span');
            let html = '';

            if (params.value) {
                let pubmedIds = params.value.split(',');

                pubmedIds.forEach((id, i) => {
                    const tid = id.trim();
                    if (i > 0) {
                        html += ', ';
                    }
                    html += `<a href="https://pubmed.ncbi.nlm.nih.gov/${tid}" target="_blank">${tid}</a>`
                });
            }

            this.eGui.innerHTML = html;
        };

        PubmedCellRenderer.prototype.getGui = () => {
            return this.eGui;
        };

        function FtpCellRenderer() {};

        FtpCellRenderer.prototype.init = params => {
            this.eGui = document.createElement('span');
            let html = '';

            if (params.value) {
                const ftpSplit = params.value.split('/');
                const gse = ftpSplit[ftpSplit.length-2];
                html += `<a href="${params.value}" target="_blank">${gse}</a>`
            }

            this.eGui.innerHTML = html;
        };

        FtpCellRenderer.prototype.getGui = () => {
            return this.eGui;
        };

        return [
            { headerName: 'Cohort', field: 'cohort', filter: 'agTextColumnFilter', width: 120, suppressSizeToFit: true },
            { headerName: 'N Samples', field: 'n_samples', filter: 'agNumberColumnFilter', width: 120, suppressSizeToFit: true },
            { headerName: 'Title', field: 'title', filter: 'agTextColumnFilter', width: 300, wrapText: true, autoHeight: true},
            { headerName: 'Pubmed', field: 'pubmed', filter: 'agTextColumnFilter', cellRenderer: PubmedCellRenderer, width: 200, wrapText: true, autoHeight: true },
            { headerName: 'Files', field: 'files', filter: 'agTextColumnFilter', cellRenderer: FtpCellRenderer, width: 140, wrapText: true, autoHeight: true },
            { headerName: 'Dataset Type', field: 'dataset_type', filter: 'agTextColumnFilter', width: 300, wrapText: true, autoHeight: true },
            { headerName: 'Platform', field: 'platform', filter: 'agTextColumnFilter', width: 400, wrapText: true, autoHeight: true },
            { headerName: 'Summary', field: 'summary', filter: 'agTextColumnFilter', width: 900, wrapText: true, autoHeight: true  },
        ];
    };

}

export default new AgGridDataService();