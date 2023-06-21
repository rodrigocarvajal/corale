import datetime
from celery import Celery
from flask import Flask, request, send_file, make_response
from flask_cors import CORS
from services.ConfigReader import ConfigReader
from services.DirectoryService import DirectoryService
from services.MongoQueryService import MongoQueryService
from services.SubmitJobService import SubmitJobService
from celery.exceptions import SoftTimeLimitExceeded

###############################################################################
###############################################################################
# flask startup

config = ConfigReader()

PROXY_URL_PREFIX = '/corale'

app = Flask(__name__)
cors = CORS(app, 
    resources={
        r'/*': { 'origins': [
            'http://localhost:3000',
            config.get_config()['REACT_HOST'] + ':' + config.get_config()['REACT_PORT']
        ]},
    },
)

###############################################################################
###############################################################################
# declarations and constants

directoryService = DirectoryService()
mongoQueryService = MongoQueryService(config)

app.config['CELERY_BROKER_URL'] = 'redis://' + config.get_config()['REDIS_HOST'] + ':' + config.get_config()['REDIS_PORT']
app.config['CELERY_RESULT_BACKEND'] = 'redis://' + config.get_config()['REDIS_HOST'] + ':' + config.get_config()['REDIS_PORT']

celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
celery.conf.update(app.config)

###############################################################################
###############################################################################
###############################################################################
# endpoints

@app.route(PROXY_URL_PREFIX + '/test', methods=['GET'])
def test():
    return { 'status': 'Alive', 'time': datetime.datetime.today() }

@app.route(PROXY_URL_PREFIX + '/api/datasets/summary/get', methods=['GET'])
def get_corale_summary():
    res = async_get_corale_summary.apply_async(args=[])
    return { 'summary': res.get() }, 200

@app.route(PROXY_URL_PREFIX + '/api/datasets/get', methods=['POST'])
def get_corale_dataset_list():
    body = request.get_json()
    datasets = async_create_datasets_metadata_small.apply_async(args=[body['plotSelection']])
    return datasets.get(), 200

@app.route(PROXY_URL_PREFIX + '/api/datasets/details/get', methods=['GET'])
def get_corale_dataset_details_list():
    datasets = async_create_datasets_metadata_detailed.apply_async(args=[])
    return datasets.get(), 200

@app.route(PROXY_URL_PREFIX + '/api/dataset/genelist', methods=['POST'])
def get_dataset_gene_list():
    body = request.get_json()
    gene_list = async_get_dataset_gene_list.apply_async(args=[body['dataset']])
    return { 'geneList': gene_list.get() }, 200

@app.route(PROXY_URL_PREFIX + '/api/dataset/clinical', methods=['POST'])
def get_dataset_clinical():
    body = request.get_json()
    data = async_get_dataset_clinical.apply_async(args=[body['dataset']])
    return { 'clinical': data.get() }, 200

@app.route(PROXY_URL_PREFIX + '/api/dataset/tme', methods=['POST'])
def get_dataset_tme():
    sortByCellLineFirst = False

    body = request.get_json()
    data = async_get_dataset_tme.apply_async(args=[body['dataset'], sortByCellLineFirst])
    return { 'tme': data.get() }, 200

@app.route(PROXY_URL_PREFIX + '/api/dataset/mutation', methods=['POST'])
def get_dataset_mutation():
    body = request.get_json()
    data = async_get_dataset_mutation.apply_async(args=[body['dataset']])
    return { 'mutation': data.get() }, 200

@app.route(PROXY_URL_PREFIX + '/api/gsea/get', methods=['GET'])
def get_gsea_plot():
    jobId = request.args.get('jobId')
    filename = request.args.get('img')
    file_path = config.get_config()['JOBS_DIR'] + '/' + jobId + '/' + filename
    return send_file(file_path, mimetype='image/jpg')

@app.route(PROXY_URL_PREFIX + '/api/clustermap/get', methods=['GET'])
def get_clustermap():
    jobId = request.args.get('jobId')
    filename = request.args.get('img')
    file_path = config.get_config()['JOBS_DIR'] + '/' + jobId + '/' + filename
    return send_file(file_path, mimetype='image/jpg')

@app.route(PROXY_URL_PREFIX + '/api/gsea/list', methods=['POST'])
def get_gsea_list():
    body = request.get_json()
    
    try:
        if body['jobId']:
            gsea_res = directoryService.get_gsea_plot_list(config.get_config()['JOBS_DIR'], body['jobId'], body['geneset'])
            return { 'err': gsea_res['err'], 'message': gsea_res['message'], 'files': gsea_res['plotList'], 'percentComplete': gsea_res['percentComplete'] }, 200
    except Exception as e:
        print(e)
        return { 'err': True, 'message': 'Missing Job ID', 'files': None }, 400

@app.route(PROXY_URL_PREFIX + '/api/gsea/geneset/report', methods=['POST'])
def get_gsea_geneset_report():
    body = request.get_json()

    try:
        res = async_get_gsea_geneset_report.apply_async(args=[body['jobId']])
        return res.get(), 200
    except Exception as e:
        print(e)
        return { 'err': True, 'message': 'Missing Job ID', 'report': None }

@app.route(PROXY_URL_PREFIX + '/api/job/parameters/save', methods=['POST'])
def save_job_parameters():
    body = request.get_json()
    res = async_save_job_parameters.apply_async(args=[ body['jobId'], body['params'] ])
    return res.get(), 200

@app.route(PROXY_URL_PREFIX + '/api/job/parameters/get', methods=['POST'])
def get_job_parameters():
    body = request.get_json()
    res = async_get_job_parameters.apply_async(args=[body['jobId']])
    return res.get(), 200

@app.route(PROXY_URL_PREFIX + '/api/submit', methods=['POST'])
def submit_job():
    body = request.get_json()

    jobService = SubmitJobService({}, config.get_config()['JOBS_DIR'])
    jobId = jobService.jobId

    if body['plot'] == 'gsea':
        async_submit_job.apply_async(args=[body, jobId])
        return { 'job': { 'results': { 'message': 'Job Submitted', 'jobId': jobId } } }

    res = async_submit_job.apply_async(args=[body])
    res = res.get()
    res['jobId'] = jobId
    return res, 200
    
@celery.task(time_limit=930, soft_time_limit=900)
def async_submit_job(params, jobId=None):
    try:
        jobService = SubmitJobService(params, config.get_config()['JOBS_DIR'])

        if params['plot'] == 'gsea':
            jobService.set_jobId = jobId
            jobService.create_plots_and_data()
            return
        
        res = jobService.create_plots_and_data()
        return { 'job': res }

    except SoftTimeLimitExceeded:
        print('ERROR: Task time limit exceeded')

@celery.task
def async_create_datasets_metadata_small(plotSelection):
    datasets = mongoQueryService.create_datasets_metadata_small(plotSelection)
    return { 'datasets': datasets }

@celery.task
def async_create_datasets_metadata_detailed():
    datasets = mongoQueryService.create_datasets_metadata_detailed()
    return { 'datasets': datasets }

@celery.task
def async_get_dataset_gene_list(dataset):
    return mongoQueryService.create_gene_list(dataset)

@celery.task
def async_get_dataset_clinical(dataset):
    return mongoQueryService.create_dataset_clinical(dataset)

@celery.task
def async_get_dataset_tme(dataset, sortByCellLineFirst):
    if sortByCellLineFirst:
        return mongoQueryService.get_dataset_tme(dataset)
    else:
        return mongoQueryService.get_dataset_tme_by_method(dataset)

@celery.task
def async_get_dataset_mutation(dataset):
    return mongoQueryService.create_dataset_mutation(dataset)

@celery.task
def async_get_gsea_geneset_report(jobId):
    return directoryService.get_gsea_geneset_report(config.get_config()['JOBS_DIR'], jobId)

@celery.task
def async_save_job_parameters(jobId, params):
    return mongoQueryService.save_job_parameters(jobId, params)

@celery.task
def async_get_job_parameters(jobId):
    return mongoQueryService.get_job_parameters(jobId)

@celery.task()
def async_get_corale_summary():
    return mongoQueryService.get_corale_summary()