import React, {useEffect} from 'react';
import HttpService from '../services/HttpService';
import TransformDataService from '../services/TransformDataService';
import routes from '../resources/json/routes.json';
import sessionj from '../resources/json/session.json';
import {clinicalDataKeys} from '../resources/util/clinicalDataKeys';

function FilterFeatures(props) {

    const [showFilterFeatures, setShowFilterFeatures]         = React.useState(false);
    const [clinicalData, setClinicalData]                     = React.useState(null);
    const [selectedCutoffMethod]                              = React.useState(null);
    const [ages, setAges]                                     = React.useState({ min: null, max: null });
    const [alcohol, setAlcohol]                               = React.useState(null);
    const [caseNormal, setCaseNormal]                         = React.useState(null);
    const [clinicalInfoMetastasis, setClinicalInfoMetastasis] = React.useState(null);
    const [clinicalInfoPrimary, setClinicalInfoPrimary]       = React.useState(null);
    const [clinicalInfoRecurrent, setClinicalInfoRecurrent]   = React.useState(null);
    const [grade, setGrade]                                   = React.useState(null);
    const [tumorSite, setTumorSite]                           = React.useState(null);
    const [hpv, setHpv]                                       = React.useState(null);
    const [os, setOs]                                         = React.useState(null);
    const [races, setRaces]                                   = React.useState(null);
    const [sex, setSex]                                       = React.useState(null);
    const [smokingStatus, setSmokingStatus]                   = React.useState(null);
    const [stageM, setStageM]                                 = React.useState(null);
    const [stageN, setStageN]                                 = React.useState(null);
    const [stageT, setStageT]                                 = React.useState(null);
        
    useEffect(() => {
        if (props.dataset) {
            HttpService.post(routes.server.root + routes.server.datasetClinical, { dataset: props.dataset })
                .then(res => {
                    setClinicalData(res.data.clinical);

                    if (res.data.clinical.ages.length > 1) {
                        setAges({ min: res.data.clinical.ages[0], max: res.data.clinical.ages[res.data.clinical.ages.length-1] })
                    }

                });
        }
    }, [props]);

    useEffect(() => {
        let filterFeatures = {
            ages,
            alcohol,
            caseNormal,
            clinicalInfoMetastasis,
            clinicalInfoPrimary,
            clinicalInfoRecurrent,
            grade,
            tumorSite,
            hpv,
            os,
            races,
            sex,
            smokingStatus,
            stageM,
            stageN,
            stageT
        };

        filterFeatures = TransformDataService.transformFilterFeatures(filterFeatures);
        sessionStorage.setItem(sessionj.filterFeatures, JSON.stringify(filterFeatures));
    }, [
        selectedCutoffMethod, ages, alcohol, caseNormal, clinicalInfoMetastasis,
        clinicalInfoPrimary, clinicalInfoRecurrent, grade, tumorSite, hpv, os,
        races, sex, smokingStatus, stageM, stageN, stageT
    ]);

    const onChangeAge = e => {
        let {min, max} = ages;
        if (e.target.id === 'minimumAge') {
            min = Number(e.target.value);
        } else {
            max = Number(e.target.value);
        }
        setAges({ min, max });
    };

    const onChangeRadio = e => {
        const key = e.target.name.split('filtering')[1];
        setStateValue(key, e.target.value);
    };

    const onChangeMultiSelect = e => {
        const userSelections = [];
        for (let i = 0; i < e.target.options.length; i++) {
            if (e.target.options[i].selected) {
                userSelections.push(e.target.options[i].value);
            }
        }
        setStateValue(e.target.name, userSelections);
    };

    const getEventHandler = key => {
        switch (key) {

            case clinicalDataKeys.alcohol.field:
                return onChangeRadio;

            case clinicalDataKeys.case_normal.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.clinical_info_metastasis.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.clinical_info_primary.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.clinical_info_recurrent.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.grade.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.tumor_site.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.hpv.field:
                return onChangeRadio;

            case clinicalDataKeys.os.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.races.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.sex.field:
                return onChangeRadio;

            case clinicalDataKeys.smoker.field:
                return onChangeRadio;

            case clinicalDataKeys.stage_t.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.stage_n.field:
                return onChangeMultiSelect;

            case clinicalDataKeys.stage_m.field:
                return onChangeMultiSelect;

            default:
                return null;
        }
    };

    const setStateValue = (key, value) => {
        switch (key) {

            case clinicalDataKeys.alcohol.field:
                setAlcohol(value);
                break;

            case clinicalDataKeys.case_normal.field:
                setCaseNormal(value);
                break;

            case clinicalDataKeys.clinical_info_metastasis.field:
                setClinicalInfoMetastasis(value);
                break;

            case clinicalDataKeys.clinical_info_primary.field:
                setClinicalInfoPrimary(value);
                break;

            case clinicalDataKeys.clinical_info_recurrent.field:
                setClinicalInfoRecurrent(value);
                break;

            case clinicalDataKeys.grade.field:
                setGrade(value);
                break;

            case clinicalDataKeys.tumor_site.field:
                setTumorSite(value);
                break;

            case clinicalDataKeys.hpv.field:
                setHpv(value);
                break;

            case clinicalDataKeys.os.field:
                setOs(value);
                break;

            case clinicalDataKeys.races.field:
                setRaces(value);
                break;

            case clinicalDataKeys.sex.field:
                setSex(value);
                break;

            case clinicalDataKeys.smoker.field:
                setSmokingStatus(value);
                break;

            case clinicalDataKeys.stage_t.field:
                setStageT(value);
                break;

            case clinicalDataKeys.stage_n.field:
                setStageN(value);
                break;

            case clinicalDataKeys.stage_m.field:
                setStageM(value);
                break;

            default:
                return null;
        }
    };

    const createRadioButtons = (key, i) => {

        const eventHandler = getEventHandler(key);

        return (
            <div className="row" key={i}>
                <div className="col-11">
                    <label className="col-2 boldFieldHeader" htmlFor={key + 'Select'}>{clinicalDataKeys[key].title}: </label>
                    <span>
                        {clinicalData[key].map((val, j) => {
                            if (!val) val = '';
                            else val = val.toLowerCase();
                            if (j === 0) {
                                return (
                                    <React.Fragment key={j}>
                                        <input type="radio" className="radioLeftMargin" id={key + val} name={'filtering' + key} value={val} onChange={eventHandler} defaultChecked/>
                                        <label htmlFor={'filtering' + key}>{val}</label>
                                    </React.Fragment>
                                )
                            } else {
                                return (
                                    <React.Fragment key={j}>
                                        <input type="radio" className="radioLeftMargin" id={key + val} name={'filtering' + key} value={val} onChange={eventHandler}/>
                                        <label htmlFor={'filtering' + key}>{val}</label>
                                    </React.Fragment>
                                )
                            }
                        })}
                    </span>
                </div>
            </div>
        )
    };

    const createMultiSelectForm = (key, i) => {

        const eventHandler = getEventHandler(key);

        return (
            <div className="row" key={i}>
                <div className="col-11">
                    <label className="col-2 boldFieldHeader" htmlFor={key + 'Select'}>{clinicalDataKeys[key].title}: </label>
                    <select className="col-2 form-select" id={key + 'Select'} multiple size="4" name={key} defaultValue={['all']} onChange={eventHandler}>
                        {clinicalData[key].map((val, i) => {
                            if (!val) val = '';
                            if (key !== clinicalDataKeys.os.field) {
                                return (
                                    <option key={i} value={val.toLowerCase()}>{val}</option>
                                )
                            } else {
                                return (
                                    <option key={i} value={val.toLowerCase()}>{val.replace('_year', ' Year')}</option>
                                )
                            }
                        })}
                    </select>
                </div>
            </div>
        )
    };

    const onClickFilterFeatures = () => {
        setShowFilterFeatures(!showFilterFeatures);
    };

    const renderForm = () => {
        return Object.keys(clinicalData).map((key, i) => {

            if (ages.min && ages.max && key === clinicalDataKeys.ages.field && clinicalData.ages.length > 1) {
                return (
                    <div className="row" key={i}>
                        <div className="col-11">
                            <label className="col-2 boldFieldHeader" htmlFor="">{clinicalDataKeys[key].title}: </label>
                            <label className="radioRightMargin" htmlFor="minimumAge">Min:</label>
                            <input type="text" className="ageTextInput" id="minimumAge" placeholder={clinicalData.ages[0]} value={ages.min} onChange={onChangeAge}/>
                            <label className="radioLeftMargin" htmlFor="maximumAge">Max:</label>
                            <input type="text" className="ageTextInput" id="maximumAge" placeholder={clinicalData.ages[clinicalData.ages.length-1]} value={ages.max} onChange={onChangeAge}/>
                        </div>
                    </div>
                )
            }

            if (
                (key === clinicalDataKeys.case_normal.field && clinicalData.case_normal.length > 2) ||
                (key === clinicalDataKeys.clinical_info_metastasis.field && clinicalData.clinical_info_metastasis.length > 2) ||
                (key === clinicalDataKeys.clinical_info_primary.field && clinicalData.clinical_info_primary.length > 2) ||
                (key === clinicalDataKeys.clinical_info_recurrent.field && clinicalData.clinical_info_recurrent.length > 2) ||
                (key === clinicalDataKeys.grade.field && clinicalData.grade.length > 2) ||
                (key === clinicalDataKeys.tumor_site.field && clinicalData.tumor_site.length > 2) ||
                (key === clinicalDataKeys.os.field && clinicalData.os.length > 2) ||
                (key === clinicalDataKeys.races.field && clinicalData.races.length > 0) ||
                (key === clinicalDataKeys.stage_t.field && clinicalData.stage_t.length > 0) ||
                (key === clinicalDataKeys.stage_n.field && clinicalData.stage_n.length > 0) ||
                (key === clinicalDataKeys.stage_m.field && clinicalData.stage_m.length > 0)
            ) {
                return createMultiSelectForm(key, i);
            } else if (
                (key === clinicalDataKeys.alcohol.field && clinicalData.alcohol.length > 2) ||
                (key === clinicalDataKeys.hpv.field && clinicalData.hpv.length > 2) ||
                (key === clinicalDataKeys.sex.field && clinicalData.sex.length > 2) ||
                (key === clinicalDataKeys.smoker.field && clinicalData.smoker.length > 2)
            ) {
                return createRadioButtons(key, i);
            } else {
                return null;
            }

        });
    };

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-3 optionsToggle" onClick={onClickFilterFeatures}>Filter Features</div>
            </div>
            <p/>
            {showFilterFeatures && clinicalData && renderForm()}
            <p/>
        </React.Fragment>
    );
}

export default FilterFeatures
