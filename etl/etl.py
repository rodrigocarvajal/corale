import glob
import pandas as pd
from pymongo import MongoClient

current_section = None

MONGO_HOST=''
MONGO_PORT='27017'
MONGO_USER=''
MONGO_PASS=''
MONGO_DB='corale'
MONGO_AUTHDB='corale'

client = MongoClient('mongodb://' + MONGO_USER + ':' + MONGO_PASS + '@' + MONGO_HOST + ':' + MONGO_PORT + '/?authSource=' + MONGO_AUTHDB)
db = client[MONGO_DB]

###############################################################################
###############################################################################
###############################################################################
# functions

def _process_general_data(tdf_ary):
    index = []
    data = []

    for row in tdf_ary:
        if row is not None:
            index.append(row[0].replace('!', '').replace('.', '??'))
            data.append(row[1:])

    return pd.DataFrame(data, index=index)

def _process_clinical_data(tdf_ary):
    index = []
    data = []
    
    for row in tdf_ary:
        index.append(row[0])
        
        row_c = []
        passthru = [ row_c.append(r.replace('na', '')) for r in row[1:] ]
        data.append(row_c)

    index[0] = 'sampleid'
    return pd.DataFrame(data, index=index)

def _process_tme_or_mutation_data(tdf_ary):
    index = []
    data = []

    for row in tdf_ary:
        index.append(row[0])
        data.append(row[1:])

    index[0] = 'sampleid'
    return pd.DataFrame(data, index=index)

def create_df(df_ary, df_section, cohort):

    if df_section == 'meta_data':
        df = _process_general_data(df_ary)
        t_dict = df.to_dict()[0]
        if t_dict['dataset_name'] == 'GSE46802-GPL6480':
            t_dict['cohort'] = 'GSE46802'
        else:
            t_dict['cohort'] = t_dict['dataset_name']
        del t_dict['dataset_name']
        
        db['metadata'].insert_one(t_dict)

    elif df_section == 'clinical_data':
        df = _process_clinical_data(df_ary)

        docs = []
        ddf = df.to_dict()
        for key in ddf:

            if 'clinical_info-metastasis' in ddf[key]:
                ddf[key]['clinical_info_metastasis'] = ddf[key]['clinical_info-metastasis']
                del ddf[key]['clinical_info-metastasis']
            
            if 'clinical_info-primary' in ddf[key]:
                ddf[key]['clinical_info_primary'] = ddf[key]['clinical_info-primary']
                del ddf[key]['clinical_info-primary']
            
            if 'clinical_info-recurrent' in ddf[key]:
                ddf[key]['clinical_info_recurrent'] = ddf[key]['clinical_info-recurrent']
                del ddf[key]['clinical_info-recurrent']

            ddf[key]['cohort'] = cohort
            docs.append(ddf[key])

        db['clinical_data'].insert_many(docs)

    elif df_section == 'expression_data':
        df = _process_general_data(df_ary)

        docs = []
        ddf = df.to_dict()
        for key in ddf:
            ddf[key]['cohort'] = cohort
            ddf[key]['sampleid'] = ddf[key]['NAME']
            del ddf[key]['NAME']
            docs.append(ddf[key])
        
        db['expression_data'].insert_many(docs)

    elif df_section == 'tme_data':
        if len(df_ary) > 0:

            df = _process_tme_or_mutation_data(df_ary)

            docs = []
            ddf = df.to_dict()
            for obj in ddf:
                n_dict = {}
                n_dict['cohort'] = cohort
                for key in ddf[obj]:

                    if key == 'sampleid':
                        n_dict[key] = ddf[obj][key]
                    else:
                        key_ary = key.split('|')

                        try:
                            if n_dict[key_ary[0]]:
                                nt_dict = n_dict[key_ary[0]]
                                nt_dict[key_ary[1]] = ddf[obj][key]
                                n_dict[key_ary[0]] = nt_dict
                        except:
                            if len(key_ary) > 1:
                                n_dict[key_ary[0]] = { key_ary[1]: ddf[obj][key] }
                            else:
                                n_dict[key_ary[0]] = { 'default': ddf[obj][key] }

                docs.append(n_dict)

            db['tme_data'].insert_many(docs)

    else: # mutation_data
        df = _process_tme_or_mutation_data(df_ary)

        docs = []
        ddf = df.to_dict()
        for key in ddf:
            ddf[key]['cohort'] = cohort
            docs.append(ddf[key])

        db['mutation_data'].insert_many(docs)
        

###############################################################################
###############################################################################
###############################################################################
# main

datasets = glob.glob('../data/*.txt')

for i, dataset in enumerate(datasets):

    cohortid = dataset.split('/')[-1].replace('_corale.txt','')
    pct_complete = i / len(datasets)
    print(cohortid + '\t\t' + str(pct_complete) + '%')

    rows = []
    to_df = []

    passthru = [ rows.append(row.split('\n')) for row in open(dataset,'r') ]
    
    for row in rows:
        row = row[0].split('\t')

        # find section start
        if '#' in row[0] and '_start' in row[0]:
            current_section = row[0].replace('#','').replace('_start','')
            continue

        # find section end
        if '#' in row[0] and '_end' in row[0]:
            df = create_df(to_df, current_section, cohortid)
            to_df = []
            continue

        to_df.append(row)