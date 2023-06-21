import os
import sys
import shutil
import time
sys.path.insert(1, os.path.dirname(os.path.abspath(__file__)))
from services.ConfigReader import ConfigReader
from pymongo import MongoClient

os.environ['FCORALE_PRODUCTION'] = 'true'
os.environ['FCORALE_UAT'] = 'false'

configReader = ConfigReader()
config = configReader.get_config()

MONGO_HOST   = 'localhost'
MONGO_PORT   = config['MONGO_PORT']
MONGO_USER   = config['MONGO_USER']
MONGO_PASS   = config['MONGO_PASS']
MONGO_DB     = config['MONGO_DB']
MONGO_AUTHDB = config['MONGO_AUTHDB']

client = MongoClient('mongodb://' + MONGO_USER + ':' + MONGO_PASS + '@' + MONGO_HOST + ':' + MONGO_PORT + '/?authSource=' + MONGO_AUTHDB)
print(client)
db = client[MONGO_DB]

CURRENT_TIME_MILLISECONDS = int(time.time() * 1000)

docs = db['job_parameters'].find({ 'exp': { '$lt': CURRENT_TIME_MILLISECONDS } }, { '_id': 0, 'jobId': 1, 'exp': 1 })
for doc in docs:

    if config['JOBS_DIR'][-1] == '/':
        file_dir = config['JOBS_DIR'][-1]
    else:
        file_dir = config['JOBS_DIR']

    file_dir = file_dir + '/' + doc['jobId']
    print('rm: %s' % file_dir)

    shutil.rmtree(file_dir, ignore_errors=True)
    db['job_parameters'].delete_one({ 'jobId': doc['jobId'] })

