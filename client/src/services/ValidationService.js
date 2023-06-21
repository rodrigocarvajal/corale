import {plotSelections} from '../resources/json/plotSelections.json';

class ValidationService {

    validate = params => {
        const NULLVALS = [null, undefined, ''];

        const DISABLE_TARGET_FEATS_IF_PLOT_IN = [plotSelections.survival, plotSelections.gsea, plotSelections.heatmap];
        
        if (!DISABLE_TARGET_FEATS_IF_PLOT_IN.includes(params.plot) && (params.targets === '' || params.targets === null || params.targets === undefined)) {
            return { err: true, message: 'Please complete Target Features section' };
        }

        if (NULLVALS.includes(params.grouping) && NULLVALS.includes(params.groupingAges) && 
            NULLVALS.includes(params.groupingGene) && NULLVALS.includes(params.groupingMutation) && 
            NULLVALS.includes(params.groupingTme) ) {

            return { err: true, message: 'Please select a Grouping Feature' };
        }

        if (params.plot === 'gsea' && NULLVALS.includes(params.gseaGeneset)) {
            return { err: true, message: 'Please select GSEA geneset' };
        }

        return { err: false };

    };

    validateCluster = tmeSelection => {
        if (tmeSelection) return true;
        return false;
    };

    transformFilterFieldsForServer = params => {

        Object.keys(params.filters).forEach(key => {
            if (params.filters[key] === null) {
                delete params.filters[key];
            }
        });

        Object.keys(params.filters).forEach(key => {
            if (!Array.isArray(params.filters[key]) && key !== 'ages') {
                params.filters[key] = [params.filters[key]];
            }
        });

        params.filters.age = params.filters.ages;
        delete params.filters.ages;

        return params;
    };

    transformGroupingFieldForServer = params => {

        if (params.grouping === 'clinical_info_primary') {
            params.grouping = 'clinical_info-primary';
        }

        if (params.grouping === 'clinical_info_recurrent') {
            params.grouping = 'clinical_info-recurrent';
        }

        if (params.grouping === 'clinical_info_metastasis') {
            params.grouping = 'clinical_info-metastasis';
        }

        return params;
    };

}

export default new ValidationService();