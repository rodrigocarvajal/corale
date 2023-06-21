import React, {useEffect, useCallback} from 'react';
import HttpService from '../services/HttpService';
import routes from '../resources/json/routes.json';
import sessionj from '../resources/json/session.json';
import {clinicalDataKeys} from '../resources/util/clinicalDataKeys';
import {plotSelections} from '../resources/json/plotSelections.json';
import ExpandSVG from '../resources/svg/angle-down-solid.svg';
import CollapseSVG from '../resources/svg/angle-up-solid.svg';

function GroupingSelections(props) {

    const MUTATION_SELECT_FORM_ID = 'mutation';
    const GROUPING_SELECT = 'grouping';
    const TARGET_SELECT = 'target'
    const CLUSTER_DATA_TYPES = { gene: 'gene', tme: 'tme', tmeOne: 'tmeOne', tmeAll: 'tmeAll' };
    const GENESETS = { hallmark: 'hallmark', kegg: 'kegg' };
    const DISABLE_GROUPING_SELECTION_IF_PLOT_IN = [ plotSelections.correlation ];
    const DISABLE_GENE_GROUPING_IF_PLOT_IN = [ plotSelections.heatmap ]
    const GSEA_POS_NEG_UTILITY = {
        rowSuffix: 'GseaPosNegRow',
        visibleClass: 'visibleMultiClinicalRadio',
        hiddenClass: 'hiddenMultiClinicalRadio',
        posValue: 'pos',
        negValue: 'neg',
        emptyValue: { pos: [], neg: [] }
    }

    // Grouping Selections
    const [showClinicalFeatures, setShowClinicalFeatures] = React.useState();
    const [clinicalData, setClinicalData] = React.useState();
    const [mutationList, setMutationList] = React.useState();
    const [gseaPosNegPreviousFeature, setGseaPosNegPreviousFeature] = React.useState();
    const [gseaPosNegSelections, setGseaPosNegSelections] = React.useState();
    const [groupingSelections, setGroupingSelections] = React.useState({
        grouping: null,
        groupingGene: null,
        groupingMutation: null,
        groupingTme: null,
        groupingAges: null
    });
    
    // TME Grouping 
    const [tmeData, setTmeData] = React.useState();
    const [tmeGroupingMethodSelected, setTmeGroupingMethodSelected] = React.useState();
    const [tmeGroupingCellLines, setTmeGroupingCellLines] = React.useState();
    
    // Grouping Gene
    const [groupingGeneSearchValue, setGroupingGeneSearchValue] = React.useState('');
    const [groupingGeneFilteredGenes, setGroupingGeneFilteredGenes] = React.useState();

    // Target Select
    const [targetFeatureToggle, setTargetFeatureToggle] = React.useState(true);
    const [showTargetFeatures, setShowTargetFeatures] = React.useState(false);
    const [targetGeneSearchValue, setTargetGeneSearchValue] = React.useState('');
    const [targetGeneFilteredGenes, setTargetGeneFilteredGenes] = React.useState();
    const [tmeTargetMethodSelected, setTmeTargetMethodSelected] = React.useState();
    const [tmeTargetCellLines, setTmeTargetCellLines] = React.useState();

    // Toggles
    const [clinicalFeatureToggle, setClinicalFeatureToggle] = React.useState(true);

    const tmeTargetCellLinesRef = React.createRef();
    const tmeGroupingCellLinesRef = React.createRef();

    useEffect(() => {
        sessionStorage.setItem(sessionj.gseaMultiClinicalFeature, JSON.stringify(GSEA_POS_NEG_UTILITY.emptyValue));
    }, [GSEA_POS_NEG_UTILITY.emptyValue]);

    useEffect(() => {
        if (props.plotSelection) {
            const DISABLE_TARGET_FEATS_IF_PLOT_IN = [plotSelections.survival, plotSelections.gsea, plotSelections.heatmap];
            
            if (DISABLE_TARGET_FEATS_IF_PLOT_IN.includes(props.plotSelection)) {
                setShowTargetFeatures(false);
                sessionStorage.setItem(sessionj.targetSelection, '');
            } else {
                setShowTargetFeatures(true);
            }
        }
    }, [props.plotSelection]);

   useEffect(() => {

        sessionStorage.setItem(sessionj.gseaMultiClinicalFeature, JSON.stringify({ pos: [], neg: [] }));
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify({
            grouping: null,
            groupingGene: null,
            groupingMutation: null,
            groupingTme: null,
            groupingAges: null
        }));

        if (props.dataset) {
            HttpService.post(routes.server.root + routes.server.datasetClinical, { dataset: props.dataset })
                .then(res => {
                    setClinicalData(res.data.clinical);                    
                    resetGroupingRadioButtons();
                });

            HttpService.post(routes.server.root + routes.server.datasetMutation, { dataset: props.dataset })
                .then(res => {
                    setMutationList(res.data.mutation);
                });

            HttpService.post(routes.server.root + routes.server.datasetTme, { dataset: props.dataset })
                .then(res => {
                    let tmeDataSorted = res.data.tme.sort((a,b) => {
                        if (a.method.toLowerCase() < b.method.toLowerCase())
                            return -1;
                        if (a.method.toLowerCase() > b.method.toLowerCase())
                            return 1;
                        return 0;
                    });

                    tmeDataSorted = tmeDataSorted.filter(obj => obj.method !== 'default' );
                    setTmeData(tmeDataSorted);
                });

        }
    }, [props.dataset]);

    useEffect(() => {
        if (groupingGeneSearchValue === ''){
            const tGroupingSelections = groupingSelections;
            tGroupingSelections.groupingGene = '';
            setGroupingSelections(tGroupingSelections);
            sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));
        } 
    }, [groupingGeneSearchValue, groupingSelections]);

    const debounce = (callback, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => callback(...args), delay);
        };
    };

    const debounceFilter = useCallback( // eslint-disable-line react-hooks/exhaustive-deps
        debounce((text, groupingOrTarget) => {
            if (props.geneList) {
                const tFilteredGenes = props.geneList.filter(gene => {
                    return gene.toLowerCase().includes(text.toLowerCase());
                });
                if (groupingOrTarget === GROUPING_SELECT) {
                    setGroupingGeneFilteredGenes(tFilteredGenes);
                } else {
                    setTargetGeneFilteredGenes(tFilteredGenes);
                }
            }
        }, 500),[] 
    ); 

    const resetGroupingRadioButtons = () => {
        const inputElements = document.getElementsByClassName('group');
        const inputList = Array.prototype.slice.call(inputElements);
        inputList.forEach(el => {
            el.checked = 'false';
        });
    };

    const resetGseaPosNegRadioButtons = () => {
        if (props.plotSelection === plotSelections.gsea && gseaPosNegPreviousFeature) {
            document.getElementById(gseaPosNegPreviousFeature + GSEA_POS_NEG_UTILITY.rowSuffix).className = GSEA_POS_NEG_UTILITY.hiddenClass;
            sessionStorage.setItem(sessionj.gseaMultiClinicalFeature, JSON.stringify(GSEA_POS_NEG_UTILITY.emptyValue));
        }
    };

    const onChangeRadio = e => {
        setGroupingGeneSearchValue('');
        resetGroupingRadioButtons();

        document.getElementById(e.target.name + 'Yes').checked = true;
        let tGroupingSelections = groupingSelections;
        tGroupingSelections.grouping = e.target.name;
        tGroupingSelections.groupingGene = '';
        tGroupingSelections.groupingMutation = '';

        if (props.plotSelection !== plotSelections.heatmap) {
            resetTmeGroupingDropdowns();
            tGroupingSelections.groupingTme = '';
        }

        setGroupingSelections(tGroupingSelections);
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));

        if (document.getElementById(MUTATION_SELECT_FORM_ID)) {
            document.getElementById(MUTATION_SELECT_FORM_ID).selectedIndex = 0;
        }

        if (props.plotSelection === plotSelections.gsea) {
            if (gseaPosNegPreviousFeature) {
                document.getElementById(gseaPosNegPreviousFeature + GSEA_POS_NEG_UTILITY.rowSuffix).className = GSEA_POS_NEG_UTILITY.hiddenClass;
            }

            document.getElementById(e.target.name + GSEA_POS_NEG_UTILITY.rowSuffix).className === GSEA_POS_NEG_UTILITY.hiddenClass ?
                document.getElementById(e.target.name + GSEA_POS_NEG_UTILITY.rowSuffix).className = GSEA_POS_NEG_UTILITY.visibleClass :
                document.getElementById(e.target.name + GSEA_POS_NEG_UTILITY.rowSuffix).className = GSEA_POS_NEG_UTILITY.hiddenClass

            setGseaPosNegPreviousFeature(e.target.name);
            if (document.getElementById(e.target.name + '-' + clinicalData[e.target.name][1] + '-GseaPos')) {
                document.getElementById(e.target.name + '-' + clinicalData[e.target.name][1] + '-GseaPos').checked = true;
            }

            const gseaSessionStorageData = GSEA_POS_NEG_UTILITY.emptyValue;
            clinicalData[e.target.name].forEach((val, i) => {
                if (val !== 'All') {
                    if (i === 1) {
                        gseaSessionStorageData.pos.push(val);
                    } else {
                        gseaSessionStorageData.neg.push(val);
                    }
                }
            });

            setGseaPosNegSelections(gseaSessionStorageData);
            sessionStorage.setItem(sessionj.gseaMultiClinicalFeature, JSON.stringify(gseaSessionStorageData));
        }
    };

    const onChangeRadioGseaPosNeg = e => {
        const category = e.target.name.split('-')[1];

        const tgseaPosNegSelections = gseaPosNegSelections;

        if (e.target.value === GSEA_POS_NEG_UTILITY.posValue) {
            const index = tgseaPosNegSelections.neg.indexOf(category)
            if (index > -1) {
                tgseaPosNegSelections.neg.splice(index, 1);
            }
            tgseaPosNegSelections.pos.push(category);
        } else { // e.target.value === GSEA_POS_NEG_UTILITY.negValue
            const index = tgseaPosNegSelections.pos.indexOf(category);
            if (index > -1) {
                tgseaPosNegSelections.pos.splice(index, 1);
            }
            tgseaPosNegSelections.neg.push(category);
        }

        setGseaPosNegSelections(tgseaPosNegSelections);
        sessionStorage.setItem(sessionj.gseaMultiClinicalFeature, JSON.stringify(tgseaPosNegSelections));
    };

   const createRadioButton = (key, i) => {
        return (
            <React.Fragment key={i}>
                <div className="row">
                    <div className="col-11">
                        <label className="col-2 boldFieldHeader" htmlFor={key + 'Select'}>{clinicalDataKeys[key].title}: </label>
                        <input type="radio" className="radioLeftMargin group" id={key + 'Yes'} name={key} value="Yes" onChange={onChangeRadio} />
                        <label htmlFor={key}>Yes</label>
                        <input type="radio" className="radioLeftMargin group" id={key + 'No'} name={key} value="No" onChange={onChangeRadio} defaultChecked/>
                        <label htmlFor={key}>No</label>
                    </div>
                </div>
                {props.plotSelection === plotSelections.gsea &&
                    <div className="hiddenMultiClinicalRadio" id={key + GSEA_POS_NEG_UTILITY.rowSuffix} key={'g' + i}>
                        <div className="row">
                            <div className="col-11 offset- gseaFeatureValuesDiv">
                                {clinicalData[key].length > 3 && clinicalData[key].map((value, j) => {
                                    if (value !== 'All') {
                                        return (
                                            <div className="row" key={'j' + j}>
                                                <label className="col-1 boldFieldHeader gseaDecoration" htmlFor={key + 'GseaPosNegSelect'}>{value}: </label>
                                                <input type="radio" className="radioLeftMargin group gseaPosInput" id={key + '-' + value + '-GseaPos'} name={key + '-' + value + '-GseaPosNeg'} value={GSEA_POS_NEG_UTILITY.posValue} onChange={onChangeRadioGseaPosNeg}/>
                                                <label htmlFor={value + 'GseaPos'} className="gseaDecoration">Pos</label> 
                                                <input type="radio" className="radioLeftMargin group" id={key + '-' + value + '-GseaNeg'} name={key + '-' + value + '-GseaPosNeg'} value={GSEA_POS_NEG_UTILITY.negValue} onChange={onChangeRadioGseaPosNeg} defaultChecked/>
                                                <label htmlFor={value + 'GseaNeg'} className="gseaDecoration">Neg</label> 
                                            </div>
                                        )
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    </div>
                }
            </React.Fragment>
        );
    };

   const onChangeMutation = e => {
        const tGroupingSelections = groupingSelections;
        tGroupingSelections.groupingMutation = e.target.value;
        tGroupingSelections.grouping = '';
        tGroupingSelections.groupingGene = '';
        tGroupingSelections.groupingTme = '';
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));
        resetGroupingRadioButtons();
        resetTmeGroupingDropdowns();
        setGroupingGeneSearchValue('');
        resetGseaPosNegRadioButtons();
    };

    const resetTmeGroupingDropdowns = () => {
        setTmeGroupingMethodSelected();
        setTmeGroupingCellLines();
        const tGroupingSelections = groupingSelections;
        tGroupingSelections.groupingTme = '';
        setGroupingSelections(tGroupingSelections);
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));

        if (document.getElementById('groupingTmeMethodGroup')) {
            document.getElementById('groupingTmeMethodGroup').selectedIndex = 0;
        }
    };

    const onChangeTmeGroupingMethod = e => {
        resetGseaPosNegRadioButtons();
        setGroupingGeneSearchValue('');
        setTmeGroupingMethodSelected(e.target.value);
        const selectedTmeData = tmeData.filter(obj => {
            return obj.method === e.target.value;
        });

        setTmeGroupingCellLines(selectedTmeData[0].cellLines);

        const tGroupingSelections = groupingSelections;
        tGroupingSelections.groupingTme = selectedTmeData[0].cellLines[0] + '|' + e.target.value;

        if (tmeGroupingCellLinesRef && tmeGroupingCellLinesRef.current) {
            tmeGroupingCellLinesRef.current.value = selectedTmeData[0].cellLines[0] + '|' + e.target.value;
        }

        if (props.plotSelection !== plotSelections.heatmap) {
            resetGroupingRadioButtons();
            tGroupingSelections.grouping = '';

            tGroupingSelections.groupingGene = '';
            tGroupingSelections.groupingMutation = '';
            setGroupingSelections(tGroupingSelections);
        }
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));
    };

    const onChangeTmeGroupingCellLine = e => {
        const tGroupingSelections = groupingSelections;
        tGroupingSelections.groupingTme = e.target.value + '|' + tmeGroupingMethodSelected;

        if (props.plotSelection !== plotSelections.heatmap) {
            tGroupingSelections.grouping = '';
        }

        resetGseaPosNegRadioButtons();
        tGroupingSelections.groupingGene = '';
        tGroupingSelections.groupingMutation = '';
        setGroupingSelections(tGroupingSelections);
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));
    };

    const onChangeTmeTargetCellLine = e => {
        sessionStorage.setItem(sessionj.targetSelection, e.target.value + '|' + tmeTargetMethodSelected);
    };

    const onChangeTmeTargetMethod = e => {
        setTmeTargetMethodSelected(e.target.value)
        const selectedTmeData = tmeData.filter(obj => {
            return obj.method === e.target.value;
        });

        setTmeTargetCellLines(selectedTmeData[0].cellLines);
        if (tmeTargetCellLinesRef && tmeTargetCellLinesRef.current) {
            tmeTargetCellLinesRef.current.value = selectedTmeData[0].cellLines[0];
        }
        sessionStorage.setItem(sessionj.targetSelection, selectedTmeData[0].cellLines[0] + '|' + e.target.value);
    };

    const onChangeGroupingGeneSearch = e => {
        setGroupingGeneSearchValue(e.target.value);
        debounceFilter(e.target.value, GROUPING_SELECT);
        resetGseaPosNegRadioButtons();
    };

    const onChangeTargetGeneSearch = e => {
        setTargetGeneSearchValue(e.target.value);
        debounceFilter(e.target.value, TARGET_SELECT);
    };

    const onClickGroupingGeneSelect = gene => {
        resetGroupingRadioButtons();
        resetTmeGroupingDropdowns();
        setGroupingGeneSearchValue(gene);
        const tGroupingSelections = groupingSelections;
        tGroupingSelections.groupingGene = gene;
        tGroupingSelections.grouping = '';
        tGroupingSelections.groupingMutation = '';
        tGroupingSelections.groupingTme = '';
        setGroupingSelections(tGroupingSelections);
        sessionStorage.setItem(sessionj.groupingSelections, JSON.stringify(tGroupingSelections));
    };

    const onClickTargetGeneSelect = gene => {
        setTargetGeneSearchValue(gene);
        sessionStorage.setItem(sessionj.targetSelection, gene);
    };

    const onChangeTargetFeatureToggle = e => {
        setTargetGeneSearchValue('');
        setTmeTargetMethodSelected('');
        setTmeTargetCellLines('');
        setTargetFeatureToggle(!targetFeatureToggle);
    };

    const onChangeGseaGeneset = e => {
        sessionStorage.setItem(sessionj.gseaGeneset, e.target.value);
    };

    const onClickClinicalFeatures = () => {
        resetGroupingRadioButtons();
        setClinicalFeatureToggle(!clinicalFeatureToggle);
        setShowClinicalFeatures(!showClinicalFeatures);
    };

    return (
        <React.Fragment>
            {!DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) && props.plotSelection !== plotSelections.heatmap &&
                <div className="row">
                    <h4>Grouping Features:</h4>
                </div>
            }
            {DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) && props.plotSelection === plotSelections.correlation &&
                <div className="row">
                    <h4>X-Axis Feature:</h4>
                </div>
            }
            {props.plotSelection === plotSelections.heatmap &&
                <div className="row">
                    <div className="col-12">
                        <label className="boldFieldHeader" htmlFor="groupingTmeMethodGroup" style={{marginRight: '1em'}}>Display additional clinical feature:</label>
                        {clinicalFeatureToggle && 
                            <span className="pointer" onClick={onClickClinicalFeatures}>
                                <i>Expand Selections</i>
                                <img src={ExpandSVG} className="" style={{width: '0.7em', marginLeft: '1em'}} alt=""/>
                            </span>
                        }
                        {!clinicalFeatureToggle &&
                            <span className="pointer" onClick={onClickClinicalFeatures}>
                                <i>Collapse Selections</i>
                                <img src={CollapseSVG} className="" style={{width: '0.7em', marginLeft: '0.5em'}} alt=""/>
                            </span>
                        }
                    </div>
                </div>   
            }
            <p/>
            {!DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) && props.plotSelection !== plotSelections.heatmap && 
                <div className="row">
                    <div className="col-12">
                        <label className="boldFieldHeader" htmlFor="groupingTmeMethodGroup" style={{marginRight: '1em'}}>Clinical Features:</label>
                        {clinicalFeatureToggle && 
                            <span className="pointer" onClick={onClickClinicalFeatures}>
                                <i>Expand Selections</i>
                                <img src={ExpandSVG} className="" style={{width: '0.7em', marginLeft: '1em'}} alt=""/>
                            </span>
                        }
                        {!clinicalFeatureToggle &&
                            <span className="pointer" onClick={onClickClinicalFeatures}>
                                <i>Collapse Selections</i>
                                <img src={CollapseSVG} className="" style={{width: '0.7em', marginLeft: '0.5em'}} alt=""/>
                            </span>
                        }
                    </div>
                </div>                    
            }
            <p/>
            {!DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) && showClinicalFeatures && clinicalData && Object.keys(clinicalData).map((key, i) => {

                if (key !== clinicalDataKeys.ages.field && typeof(clinicalData[key]) === 'object' && clinicalData[key].length > 2) {
                    return createRadioButton(key, i)
                }

                if (key !== clinicalDataKeys.ages.field && typeof(clinicalData[key]) === 'string' && clinicalData[key]) {
                    return createRadioButton(key, i)
                }

                return null;

            })}
            {props.plotSelection !== plotSelections.heatmap && props.plotSelection !== plotSelections.correlation &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-3 textAlignCenter">
                            <b>- Or -</b>
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {props.dataset && !DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) && !DISABLE_GENE_GROUPING_IF_PLOT_IN.includes(props.plotSelection) && mutationList && mutationList.length > 0 &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-12">
                            <label className="boldFieldHeader" htmlFor={MUTATION_SELECT_FORM_ID}>Mutation:</label>
                            <select className="form-select tmeMenu" id={MUTATION_SELECT_FORM_ID} defaultValue={true} onChange={onChangeMutation}>
                                <option id="mutationDefSel" value={true} disabled>Choose mutation</option>
                                {mutationList.map((mutation, i) => {
                                    return <option value={mutation} key={i}>{mutation.split('_mut')[0]}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    {props.plotSelection !== plotSelections.heatmap &&
                        <React.Fragment>
                            <div className="row">
                                <div className="col-3 textAlignCenter">
                                <b>- Or -</b>
                                </div>
                            </div>
                            <p/>
                        </React.Fragment>
                    }
                </React.Fragment>
            }
            {props.geneList && props.dataset && !DISABLE_GENE_GROUPING_IF_PLOT_IN.includes(props.plotSelection) &&
                <React.Fragment>
                    <div id="col-12">
                        <label htmlFor="groupingGeneListSearch"><span className="boldFieldHeader">Select Gene: </span></label>
                        <input className="col-2" type="text" id="groupingGeneListSearch" value={groupingGeneSearchValue} onChange={onChangeGroupingGeneSearch}/>
                    </div>
                    <p/>
                    {groupingGeneFilteredGenes && groupingGeneFilteredGenes.length > 0 && groupingGeneSearchValue !== '' &&
                        <div className="offset-1 col-2" id="groupingGeneSearchBarSuggestions">
                            {groupingGeneFilteredGenes.map((gene, i) => {
                                return (
                                    <div className="geneSelect" key={i} onClick={() => onClickGroupingGeneSelect(gene)}>{gene}</div>
                                )
                            })}
                        </div>
                    }
                    <p/>
                </React.Fragment>
            }
            {props.plotSelection !== plotSelections.heatmap &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-3 textAlignCenter">
                            <b>- Or -</b>
                        </div>
                    </div>
                    <p/>
                </React.Fragment>
            }
            {tmeData && props.plotSelection !== plotSelections.heatmap &&
                <div className="row">
                    <div className="col-12">
                        <label className="boldFieldHeader" htmlFor="groupingTmeMethodGroup">TME Method:</label>
                        <select className="form-select tmeMenu" id="groupingTmeMethodGroup" defaultValue={true} onChange={onChangeTmeGroupingMethod}>
                            <option value={true} disabled>Choose TME method</option>
                            {tmeData.map((obj, i) => {
                                return <option key={i} value={obj.method}>{obj.method.replace('CIBERSORTx', 'CIBERSORT')}</option>
                            })}
                        </select>
                    </div>
                </div>
            }
            {(tmeGroupingCellLines && tmeGroupingCellLines.length > 0) && ((tmeData && props.plotSelection !== plotSelections.heatmap) || ((tmeData && props.plotSelection === plotSelections.heatmap && props.geneExprOrTme === CLUSTER_DATA_TYPES.tme) && props.selectOneOrAllTmeFeatures === CLUSTER_DATA_TYPES.tmeOne)) &&
                <React.Fragment>
                    <div className="row">
                        <div className="col-12">
                            <label className="boldFieldHeader" htmlFor="groupingTmeCellLines">Immune Cell Types:</label>
                            <select className="form-select tmeMenu" id="groupingTmeCellLines" ref={tmeGroupingCellLinesRef} onChange={onChangeTmeGroupingCellLine}>
                                {tmeGroupingCellLines.map((cellLine, i) => {
                                    return <option key={i} value={cellLine}>{cellLine}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    {props.plotSelection !== plotSelections.correlation &&
                        <div className="row">
                            <div className="col-12">
                                <span className="attentionMessage"><i>The samples with zero-values are removed in this result.</i></span>
                            </div>
                        </div>
                    }
                </React.Fragment>
            }
            {props.plotSelection === plotSelections.survival && ((tmeGroupingMethodSelected !== '' && tmeGroupingMethodSelected !== null && tmeGroupingMethodSelected !== undefined) || (groupingGeneSearchValue !== '' && groupingGeneSearchValue !== null && groupingGeneSearchValue !== undefined)) &&
                <div className="row">
                    <div className="col-12">
                        <span className="attentionMessage"><i>Some of the samples might be removed because the essential values for this analysis are missing.</i></span>
                    </div>
                </div>
            }
            {showTargetFeatures &&
                <React.Fragment>
                    {!DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) &&
                        <div className="row">
                            <h4>Target Features:</h4>
                        </div>
                    }
                    {DISABLE_GROUPING_SELECTION_IF_PLOT_IN.includes(props.plotSelection) &&
                        <div className="row">
                            <h4>Y-Axis Feature:</h4>
                        </div>
                    }
                    <p/>
                    <div className="row">
                        <div className="col-11">
                            <input type="radio" className="radioLeftMargin" id="targetFeatGeneExp" name="targetFeat" onChange={onChangeTargetFeatureToggle} defaultChecked/>
                            <label htmlFor="targetFeat">Gene Expression</label>
                            <input type="radio" className="radioLeftMargin" id="targetFeatTME" name="targetFeat" onChange={onChangeTargetFeatureToggle} />
                            <label htmlFor="targetFeat">TME</label>
                        </div>
                    </div>
                    {targetFeatureToggle &&
                        <React.Fragment>
                            <div id="col-12">
                                <label htmlFor="targetGeneListSearch"><span className="boldFieldHeader">Select Gene: </span></label>
                                <input className="col-2" type="text" id="targetGeneListSearch" value={targetGeneSearchValue} onChange={onChangeTargetGeneSearch}/>
                            </div>
                            <p/>
                            {targetGeneFilteredGenes && targetGeneFilteredGenes.length > 0 && targetGeneSearchValue !== '' &&
                                <div className="offset-1 col-2" id="targetGeneSearchBarSuggestions">
                                    {targetGeneFilteredGenes.map((gene, i) => {
                                        return (
                                            <div className="geneSelect" key={i} onClick={() => onClickTargetGeneSelect(gene)}>{gene}</div>
                                        )
                                    })}
                                </div>
                            }
                            <p/>
                        </React.Fragment>
                    }
                    {!targetFeatureToggle && props.dataset &&
                        <React.Fragment>
                            {tmeData &&
                                <div className="row">
                                    <div className="col-12">
                                        <label className="boldFieldHeader" htmlFor="tmeTargetMethod">TME Method:</label>
                                        <select className="for-select tmeMenu" id="tmeTargetMethod" defaultValue={true} onChange={onChangeTmeTargetMethod}>
                                            <option value={true} disabled>Choose TME method</option>
                                            {tmeData.map((obj, i) => {
                                                return <option key={i} value={obj.method}>{obj.method.replace('CIBERSORTx', 'CIBERSORT')}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>       
                            }
                            {tmeTargetCellLines && tmeTargetCellLines.length > 0 &&
                                <div className="row">
                                    <div className="col-12">
                                        <label className="boldFieldHeader" htmlFor="tmeTargetCellLines">Immune Cell Types</label>
                                        <select className="form-select tmeMenu" id="tmeTargetCellLines" ref={tmeTargetCellLinesRef} onChange={onChangeTmeTargetCellLine}>
                                            {tmeTargetCellLines.map((cellLine, i) => {
                                                return <option key={i} value={cellLine}>{cellLine}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>
                            }
                        </React.Fragment>
                    }
                </React.Fragment>
            }
            <p/>
            {props.plotSelection === plotSelections.gsea &&
                <div className="row">
                    <label className="col-2 boldFieldHeader">Geneset Type:</label>
                    <input type="radio" className="radioLeftMargin" id="hallmark" name="genesetType" value={GENESETS.hallmark} defaultChecked onChange={onChangeGseaGeneset}/>
                    <label htmlFor="hallmark">Hallmark</label>
                    <input type="radio" className="radioLeftMargin" id="kegg" name="genesetType" value={GENESETS.kegg} onChange={onChangeGseaGeneset}/>
                    <label htmlFor="kegg">KEGG</label>
                </div>
            }
        </React.Fragment>
    )
}

export default GroupingSelections
