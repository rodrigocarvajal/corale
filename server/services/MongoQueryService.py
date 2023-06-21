import time
from pymongo import MongoClient

class MongoQueryService:

    def __init__(self, config):
        self.config = config.get_config()
        self.db = self._create_db_connection()
        self.DAYS_TO_EXPIRE = 14 * 86400000

    def _create_db_connection(self):
        client = MongoClient('mongodb://' + self.config['MONGO_USER'] + ':' + self.config['MONGO_PASS'] + '@' + self.config['MONGO_HOST'] + ':' + self.config['MONGO_PORT'] + '/?authSource=' + self.config['MONGO_AUTHDB'])
        return client[self.config['MONGO_DB']]

    def create_gene_list(self, dataset):
        gene_list = []

        doc = self.db['expression_data'].find_one({ 'cohort': dataset }, { '_id': 0, 'sampleid': 0, 'cohort': 0 })
        for keys in doc:
            gene_list.append(keys)

        gene_list = list(set(gene_list))
        gene_list.sort()

        return gene_list

    def create_datasets_metadata_small(self, plotSelection):
        metadata = []

        if plotSelection == 'survival':
            
            docs = self.db['metadata'].find({}, { '_id': 0 })
            for doc in docs:
                os = False

                if 'OS' in doc and doc['OS'] != '-' and float(doc['OS']) > 0:
                    os = True

                if os:
                    metadata.append(doc)

        else:
            docs = self.db['metadata'].find({}, { '_id': 0, 'cohort': 1, 'TITLE': 1, 'SUMMARY': 1, 'N_SAMPLES': 1 })        
            for doc in docs:
                metadata.append(doc)

        return metadata

    def create_dataset_clinical(self, dataset):
        t_dict = {
            'races': [],
            'tumor_site': [],
            'sex': [],
            'ages': [],
            'smoker': [],
            'stage_m': [],
            'clinical_info_primary': [],
            'alcohol': [],
            'clinical_info_recurrent': [],
            'case_normal': [],
            'stage_n': [],
            'grade': [],
            'stage_t': [],
            'hpv': [],
            'clinical_info_metastasis': [],
        }

        docs = self.db['clinical_data'].find({ 'cohort': dataset }, { '_id': 0, 'race': 1, 'tumor_site': 1, 'sex': 1, 'smoker': 1, 'age': 1, 'stage_m': 1, 'clinical_info_primary': 1, 'alcohol': 1, 'clinical_info_recurrent': 1, 'case/normal': 1, 'stage_n': 1, 'grade': 1, 'stage_t': 1, 'hpv': 1, 'clinical_info_metastasis': 1, })
        for doc in docs:
            if 'race' in doc:
                if doc['race'] == '':
                    pass
                else:
                    t_dict['races'].append(doc['race'].title())
            
            if 'tumor_site' in doc:
                if doc['tumor_site'] == '':
                    pass
                else:
                    t_dict['tumor_site'].append(doc['tumor_site'].title())

            if doc['sex'] == '':
                pass
            else:
                t_dict['sex'].append(doc['sex'].title())

            if '-' in doc['age']:
                age_split = doc['age'].split('-')

                for age in age_split:
                    try:
                        t_dict['ages'].append(int(age))
                    except Exception as e:
                        pass
            elif doc['age'] == '':
                pass
            else:
                try:
                    t_dict['ages'].append(int(doc['age']))
                except ValueError as e:
                    t_dict['ages'].append(int(float(doc['age'])))


            if doc['smoker'] == '':
                pass
            else:
                t_dict['smoker'].append(doc['smoker'].title())

            if doc['stage_m'] == '':
                pass
            else:
                t_dict['stage_m'].append(doc['stage_m'])

            if 'clinical_info_primary' in doc:
                if doc['clinical_info_primary'] == '':
                    pass
                else:
                    t_dict['clinical_info_primary'].append(doc['clinical_info_primary'].title())

            if doc['alcohol'] == '':
                pass
            else:
                t_dict['alcohol'].append(doc['alcohol'].title())

            if doc['clinical_info_recurrent'] == '':
                pass
            else:
                t_dict['clinical_info_recurrent'].append(doc['clinical_info_recurrent'].title())

            if 'case/noraml' in doc:
                if doc['case/normal'] == '':
                    pass
                else:
                    t_dict['case_normal'].append(doc['case/normal'].title())

            if doc['stage_n'] == '':
                pass
            else:
                t_dict['stage_n'].append(doc['stage_n'])

            if doc['grade'] == '':
                pass
            else:
                t_dict['grade'].append(doc['grade'])

            if doc['stage_t'] == '':
                pass
            else:
                t_dict['stage_t'].append(doc['stage_t'])

            if 'hpv' in doc:
                if doc['hpv'] == '':
                    pass
                else:
                    t_dict['hpv'].append(doc['hpv'].title())

            if 'clinical_info_metastasis' in doc:
                if doc['clinical_info_metastasis'] == '':
                    pass
                else:
                    t_dict['clinical_info_metastasis'].append(doc['clinical_info_metastasis'].title())

        t_dict['races'] = sorted(list(set(t_dict['races'])))
        t_dict['tumor_site'] = sorted(list(set(t_dict['tumor_site'])))
        t_dict['sex'] = sorted(list(set(t_dict['sex'])))
        t_dict['ages'] = sorted(list(set(t_dict['ages'])))
        t_dict['smoker'] = sorted(list(set(t_dict['smoker'])), reverse=True)
        t_dict['stage_m'] = sorted(list(set(t_dict['stage_m'])))
        t_dict['clinical_info_primary'] = sorted(list(set(t_dict['clinical_info_primary'])))
        t_dict['alcohol'] = sorted(list(set(t_dict['alcohol'])), reverse=True)
        t_dict['clinical_info_recurrent'] = sorted(list(set(t_dict['clinical_info_recurrent'])))
        t_dict['case_normal'] = sorted(list(set(t_dict['case_normal'])))
        t_dict['stage_n'] = sorted(list(set(t_dict['stage_n'])))
        t_dict['grade'] = sorted(list(set(t_dict['grade'])))
        t_dict['stage_t'] = sorted(list(set(t_dict['stage_t'])))
        t_dict['hpv'] = sorted(list(set(t_dict['hpv'])))
        t_dict['clinical_info_metastasis'] = sorted(list(set(t_dict['clinical_info_metastasis'])))

        for key in t_dict:
            if len(t_dict[key]) == 1:
                t_dict[key] = []
            if len(t_dict[key]) > 1 and key not in('ages'):
                t_dict[key].insert(0, 'All')
        
        return t_dict

    def create_datasets_metadata_detailed(self):
        docs_ary = []
        docs = self.db['metadata'].find({}, {'_id': 0, 'cohort': 1, 'TITLE': 1, 'SUMMARY': 1, 'DATASET_TYPE': 1, 'N_SAMPLES': 1, 'PUBMED': 1, 'FILES': 1, 'PLATFORM': 1 })
        passthru = [ docs_ary.append(doc) for doc in docs ]
        return docs_ary

    def get_dataset_tme(self, dataset):
        doc = self.db['tme_data'].find_one({ 'cohort': dataset }, { '_id': 0, 'sampleid': 0, 'cohort': 0 })
        data = []
        for key in doc:
            tmp = { 'cellLine': key, 'methods': [] }
            for key2 in doc[key]:
                tmp['methods'].append(key2)

            data.append(tmp)

        return data

    def get_dataset_tme_by_method(self, dataset):
        doc = self.db['tme_data'].find_one({ 'cohort': dataset }, { '_id': 0, 'sampleid': 0, 'cohort': 0 })
        tdata = {}
        for cellLine in doc:
            for method in doc[cellLine]:
                if method not in tdata:
                    tdata[method] = []

                tdata[method].append(cellLine)
        
        for method in tdata:
            tmp = list(set(tdata[method]))
            tmp.sort()
            tdata[method] = tmp


        data = []
        passthru = [ data.append({ 'method': method, 'cellLines': tdata[method] }) for method in tdata ]

        return data

    def create_dataset_mutation(self, dataset):
        doc = self.db['mutation_data'].find_one({ 'cohort': dataset }, { '_id': 0, 'sampleid': 0, 'cohort': 0 })
        data = []
        if doc:
            passthru = [ data.append(key) for key in doc ]
        
        return data

    def save_job_parameters(self, jobId, params):

        CURRENT_TIME_MILLISECONDS = time.time() * 1000

        try:
            self.db['job_parameters'].update_one({
                'jobId': jobId,
            },
            { 
                '$set': { 
                    'jobId': jobId,
                    'createdAt': int(CURRENT_TIME_MILLISECONDS),
                    'exp': int(self.DAYS_TO_EXPIRE + CURRENT_TIME_MILLISECONDS),
                    'filters': params['filters'],
                    'grouping': params['grouping'],
                    'groupingGene': params['groupingGene'],
                    'groupingMutation': params['groupingMutation'],
                    'groupingTme': params['groupingTme'],
                    'targets': params['targets'],
                    'plot': params['plot'],
                    'gseaGeneset': params['gseaGeneset'],
                    'gseaMultiClinicalFeature': params['gseaMultiClinicalFeature'],
                    'dataset': params['dataset'],
                    'error': False,
                    'errorMsg': None,
                }
            }, upsert=True)
            return { 'err': False, 'message': 'Job parameters saved' }

        except Exception as e:
            print(e)
            return { 'err': True, 'message': 'Failed to save job parameters' }
        
    def get_job_parameters(self, jobId):
        try:
            doc = self.db['job_parameters'].find_one({ 'jobId': jobId })  
            try:
                pos_class = doc['pos_class']
                neg_class = doc['neg_class']
            except Exception as e:
                pos_class = None
                neg_class = None
            return {
                'jobId': doc['jobId'],
                'dataset': doc['dataset'],
                'filters': doc['filters'],
                'grouping': doc['grouping'],
                'groupingGene': doc['groupingGene'],
                'groupingMutation': doc['groupingMutation'],
                'groupingTme': doc['groupingTme'],
                'gseaGeneset': doc['gseaGeneset'],
                'gseaMultiClinicalFeature': doc['gseaMultiClinicalFeature'],
                'plot': doc['plot'],
                'targets': doc['targets'],
                'pos_class': pos_class,
                'neg_class': neg_class,
                'error': doc['error'],
                'errorMsg': doc['errorMsg'],
            }
        except Exception as e:
            print(e)
            return { 'err': True, 'message': 'Job parameters cannot be located' }

    def get_corale_summary(self):
        docs = self.db['summary'].find({}, { '_id': 0 })
        ary = []
        passthru = [ ary.append(doc) for doc in docs ]
        return ary
    
    