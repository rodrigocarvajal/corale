class TransformDataService {

    transformFilterFeatures = (filterSelections) => {

        let transformedSelections = {};

        Object.keys(filterSelections).forEach(key => {
            if (!filterSelections[key]) {
                transformedSelections[key] = filterSelections[key];
            } else if (typeof(filterSelections[key]) === 'string' && filterSelections[key].toLowerCase() === 'all') {
                transformedSelections[key] = null;
            } else if (key !== 'ages' && typeof(filterSelections[key]) === 'object' && (filterSelections[key].indexOf('all') !== -1 || filterSelections[key].length < 1 )) {
                transformedSelections[key] = null;
            } else {
                transformedSelections[key] = filterSelections[key];
            }
        });

        return transformedSelections;
    };

    tranformClinicalInfoField = data => {
        
        if (data.results.title && data.results.title.includes('clinical_info-')) {
            data.results.title = data.results.title.replace('-', '_');
        }

        if (data.results.processed_data) {
            let pData = JSON.parse(data.results.processed_data);
            Object.keys(pData).forEach(key => {
                if (key.includes('clinical_info-')) {
                    pData[key.replace('-', '_')] = pData[key];
                    delete pData[key];
                }
            });

            delete data.results.processed_data;
            data.results['processed_data'] = pData;
        }

        return data;
    };

}

export default new TransformDataService();