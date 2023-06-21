# Script to load application's summary of included datasets from raw .csv to MongoDB

import json
from pymongo import MongoClient

MONGO_HOST=''
MONGO_PORT='27017'
MONGO_USER=''
MONGO_PASS=''
MONGO_DB='corale'
MONGO_AUTHDB='corale'

client = MongoClient('mongodb://' + MONGO_USER + ':' + MONGO_PASS + '@' + MONGO_HOST + ':' + MONGO_PORT + '/?authSource=' + MONGO_AUTHDB)
db = client[MONGO_DB]

rows = []
passthru = [ rows.append(row.replace('\n','').split(',')) for row in open('../summary/summary_table_20210406.csv', 'r') ]
headers = rows[0]
headers[0] = headers[0].replace('\ufeff','')

i = 1
records = []
for i in range(1, len(rows)):
    obj = {}
    for j, key in enumerate(headers):
        obj[key] = rows[i][j]

    records.append(obj)

db['summary'].insert_many(records)