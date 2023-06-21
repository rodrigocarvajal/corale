import React, { useEffect, useCallback } from 'react';
import {plotSelections} from '../resources/json/plotSelections.json';
import {BehaviorSubject} from 'rxjs';
import HttpService from '../services/HttpService';
import ShareDataSelections from './ShareDataSelections';
import ResetButton from './ResetButton';
import sessionj from '../resources/json/session.json';
import routes from '../resources/json/routes.json';

function MainHeatmap() {

    const ACCEPTED_FILETYPES = '.txt,.tsv,.csv';
    const INIT_PLOT_TYPE = plotSelections.heatmap;
    const DATA_TYPES = { gene: 'gene', tme: 'tme', tmeOne: 'tmeOne', tmeAll: 'tmeAll' };
    const CLUSTER_METRICS = [ 'correlation', 'cosine', 'euclidean', 'jaccard' ];
    const CLUSTER_LINKAGES = ['average', 'single', 'complete', 'weighted', 'centroid', 'median', 'ward'];

    const [selectedDataset, setSelectedDataset] = React.useState();
    const [tmeMethods, setTmeMethods] = React.useState();
    const [tmeData, setTmeData] = React.useState();
    const [plotSelection] = React.useState(INIT_PLOT_TYPE);
    const [geneList, setGeneList] = React.useState();
    const [geneExprOrTme, setGeneExprOrTme] = React.useState(DATA_TYPES.gene);
    const [selectedClusterMetric, setSelectedClusterMetric] = React.useState(CLUSTER_METRICS[0]);
    const [selectedClusterLinkage, setSelecteedClusterLinkage] = React.useState(CLUSTER_LINKAGES[0]);
    const [showAllOrOneTmeFeatures, setShowAllOrOneTmeFeatures] = React.useState(false);
    const [selectOneOrAllTmeFeatures, setSelectOneOrAllTmeFeatures] = React.useState(DATA_TYPES.tmeOne);
    const [showManualGeneEntry, setShowManualGeneEntry] = React.useState(false);

    const fileUploadLabelRef = React.createRef();

    const [datasetSubscription] = React.useState(new BehaviorSubject());
    const [tmeCellLineMethodArraySubscription] = React.useState(new BehaviorSubject());

    const _createTmeSelectionArray = useCallback((tmeMethod) => {

        const tmeSelection = tmeData.filter(obj => {
            return obj.method === tmeMethod
        })

        const formattedTmeCellineMethods = [];
        tmeSelection[0].cellLines.forEach(cellLine => {
            formattedTmeCellineMethods.push(cellLine + '|' + tmeMethod);
        });

        tmeCellLineMethodArraySubscription.next(formattedTmeCellineMethods);
    }, [tmeCellLineMethodArraySubscription, tmeData]);

    useEffect(() => {
        datasetSubscription.subscribe(res => {
            if (res) {
                if (document.getElementById('tmeMethodCluster')) {
                    document.getElementById('tmeMethodCluster').selectedIndex = 0;
                }
                setSelectedDataset(res);
            }
        });

        return () => {
            datasetSubscription.unsubscribe();
        }
    },[datasetSubscription]);

    useEffect(() => {
        if (selectedDataset) {
            HttpService.post(routes.server.root + routes.server.datasetTme, { dataset: selectedDataset })
                .then(res => {
                    const methods = [];
                    res.data.tme.forEach(obj => {
                        if (obj.method !== 'default') {
                            methods.push(obj.method);
                        }
                    });
                    methods.sort();
                    setTmeData(res.data.tme);
                    setTmeMethods(methods);
                });
        }
    }, [selectedDataset]);

    useEffect(() => {
        if (tmeData && tmeMethods && showAllOrOneTmeFeatures && selectOneOrAllTmeFeatures === DATA_TYPES.tmeOne) {
            _createTmeSelectionArray(tmeMethods[0]);
        }
    }, [tmeData, tmeMethods, showAllOrOneTmeFeatures, DATA_TYPES.tmeOne, selectOneOrAllTmeFeatures, _createTmeSelectionArray])

    useEffect(() => {
        sessionStorage.setItem(sessionj.plotSelection, INIT_PLOT_TYPE);
        sessionStorage.setItem(sessionj.gseaGeneset, '');
    }, [INIT_PLOT_TYPE]);

    const onChangeFileUpload = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
            fileUploadLabelRef.current.innerHTML = file.name;
            let tgeneList = e.target.result.split('\n');
            tgeneList = tgeneList.map(gene => {
                if (gene !== '' && gene !== null && gene !== undefined) {
                    return gene.toUpperCase().replace('\r','');
                }
                return null;
            });
            tgeneList = tgeneList.filter(gene => gene !== null);
            setGeneList(tgeneList);
        };

        reader.readAsText(file);
    };

    const onChangeDataType = e => {
        if (e.target.value === DATA_TYPES.tme) {
            setShowAllOrOneTmeFeatures(true);
            setSelectOneOrAllTmeFeatures(DATA_TYPES.tmeOne);
        } else {
            setShowAllOrOneTmeFeatures(false);
            setSelectOneOrAllTmeFeatures();
        }
        setGeneExprOrTme(e.target.value);
    };

    const onChangeClusterMetric = e => {
        setSelectedClusterMetric(e.target.value);
    };

    const onChangeClusterLinkage = e => {
        setSelecteedClusterLinkage(e.target.value);
    };

    const onChangeOneOrAllTme = e => {
        setSelectOneOrAllTmeFeatures(e.target.value);
    };

    const onChangeGeneEntry = e => {
        if (e.target.value === 'upload') {
            setShowManualGeneEntry(false);
        } else {
            setShowManualGeneEntry(true);
        }
    };

    const onChangeManualGeneEntry = e => {
        const delimitedList = e.target.value.replace(/\s+/g, '');
        let geneListAry = delimitedList.split(';');
        geneListAry = geneListAry.map(gene => gene.toUpperCase());
        setGeneList(geneListAry);
    };

    const onChangeTmeGroupingMethod = e => {
        _createTmeSelectionArray(e.target.value);
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-11 offset-1">
                    <h3>Clustering Analysis</h3>
                </div>
            </div>
            <p/>
            <div className="row">
                <div className="col-11 offset-1">
                    Perform clustering of selected genes or tumor immune cell types with clinical features. 
                    This analysis is based on Pearson’s correlation method.
                </div>
            </div>
            <div className="spacer"/>
            <React.Fragment>
                <div className="row">
                    <label className="col-1 offset-1 boldFieldHeader">Gene Entry:</label>
                    <input type="radio" className="radioLeftMargin" id="uploadGeneList" name="geneEntry" value="upload" defaultChecked onChange={onChangeGeneEntry}/>
                    <label htmlFor="uploadGeneList">Upload</label>
                    <input type="radio" className="radioLeftMargin" id="manualGeneEntry" name="geneEntry" value="manual" onChange={onChangeGeneEntry}/>
                    <label htmlFor="manualGeneEntry">Manual Entry</label>
                </div>
                <p/>
                {!showManualGeneEntry &&
                    <React.Fragment>
                        <div className="row">
                            <div className="col-3 offset-1 boldFieldHeader">
                                Upload Gene List:
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3 offset-1">
                                <div className="custom-file">
                                    <input type="file" className="custom-file-input" id="fileUploader" accept={ACCEPTED_FILETYPES} onChange={onChangeFileUpload}/>
                                    <label className="custom-file-label" ref={fileUploadLabelRef} htmlFor="fileUploader">Choose file</label>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
                {showManualGeneEntry &&
                    <React.Fragment>
                        <div className="row">
                            <div className="col-3 offset-1 boldFieldHeader">
                                Enter Gene Names:
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3 offset-1 boldFieldHeader">
                                <span style={{fontSize: '0.8em'}}><i>Separate multiple genes with a semicolon</i></span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3 offset-1">
                                <input type="text" className="col-12" placeholder="Gene Name" onChange={onChangeManualGeneEntry}/>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </React.Fragment>
            <p/>
            <div className="row">
                <div className="col-3 offset-1 textAlignCenter">
                    <b>- And / Or -</b>
                </div>
            </div>
            <p/>
            <div className="row">
                <label className="col-3 offset-1 boldFieldHeader">Add TME Feature:</label>
                <input type="radio" className="radioLeftMargin" id="geneExpr" name="dataType" value={DATA_TYPES.gene} defaultChecked onChange={onChangeDataType}/>
                <label htmlFor="geneExpr">No</label>
                <input type="radio" className="radioLeftMargin" id="tmeScore" name="dataType" value={DATA_TYPES.tme} onChange={onChangeDataType}/>
                <label htmlFor="tmeScore">Yes</label>
            </div>
            {showAllOrOneTmeFeatures &&
                <div className="row">
                    <label className="col-3 offset-1 boldFieldHeader">Select One or All TME Features:</label>
                    <input type="radio" className="radioLeftMargin" id="oneTmeFeat" name="oneOrAllTme" value={DATA_TYPES.tmeOne} defaultChecked onChange={onChangeOneOrAllTme}/>
                    <label htmlFor="oneTmeFeat">One</label>
                    <input type="radio" className="radioLeftMargin" id="allTmeFeat" name="oneOrAllTme" value={DATA_TYPES.tmeAll} onChange={onChangeOneOrAllTme}/>
                    <label htmlFor="oneTmeFeat">All</label>
                </div>
            }
            {tmeMethods && tmeMethods.length > 0 && showAllOrOneTmeFeatures && selectOneOrAllTmeFeatures === DATA_TYPES.tmeOne &&
                <div className="row">
                    <div className="col-3 offset-1">
                        <label className="boldFieldHeader" htmlFor="tmeMethodCluster">TME Method:</label>
                        <select className="form-select tmeMenu" id="tmeMethodCluster" defaultValue={true} onChange={onChangeTmeGroupingMethod}>
                            {tmeMethods.map((method, i) => {
                                return <option key={i} value={method}>{method.replace('CIBERSORTx', 'CIBERSORT')}</option>
                            })}
                        </select>
                    </div>
                </div>
            }
            <p/>
            <div className="row">
                <div className="form-group col-3 offset-1">
                    <label className="boldFieldHeader" htmlFor="clusterMetric">Cluster Metric:</label>
                    <select className="form-control" id="clusterMetric" onChange={onChangeClusterMetric}>
                        {CLUSTER_METRICS.map((metric, i) => {
                            return <option key={i} value={metric}>{metric}</option>
                        })}
                    </select>
                </div>
            </div>
            <div className="row">
                <div className="form-group col-3 offset-1 ">
                    <label className="boldFieldHeader" htmlFor="linkageMethod">Linkage Method:</label>
                    <select className="form-control" id="linkageMethod" onChange={onChangeClusterLinkage}>
                        {CLUSTER_LINKAGES.map((linkage, i) => {
                            return <option key={i} value={linkage}>{linkage}</option>
                        })}
                    </select>
                </div>
            </div>
            <div className="spacer"/>
            <ShareDataSelections plotSelection={plotSelection} 
                                 geneList={geneList}
                                 geneExprOrTme={geneExprOrTme} 
                                 selectedClusterMetric={selectedClusterMetric} 
                                 selectedClusterLinkage={selectedClusterLinkage}
                                 selectOneOrAllTmeFeatures={selectOneOrAllTmeFeatures}
                                 datasetSubscription={datasetSubscription}
                                 tmeCellLineMethodArraySubscription={tmeCellLineMethodArraySubscription}
            />
            <ResetButton/>
        </React.Fragment>
    )
}

export default MainHeatmap
