# Corale

### Contents
1. [Requirements](#requirements)
1. [Python Virtual Environment](#python-virtual-environment)
1. [Redis](#redis)
1. [MongoDB](#mongodb)
1. [Docker](#docker)
    - [Build](#build)
    - [Run](#run)
1. [Initialize MongoDB](#initialize-mongodb)
    - [ETL](#etl)
1. [Cron Cleanup](#cron-cleanup)
1. [Environment Files](#environment-files)
1. [Manual Execution Commands](#manual-execution-commands)
1. [Notes](#notes)
1. [NGINX](#nginx)
1. [Updating Data Files](#updating-data-files)

### Requirements

1. Docker v20.10+
1. Python 3+

### Python Virtual Environment

1. This section discusses creating and activating the python virtual environment for the [ETL](#etl) process
```sh
$ virtualenv --python=python3 venv
$ pip install pandas pymongo
```
1. To activate the virtual environment
```sh
$ source venv/bin/activate
```

### Redis

```sh
$ docker pull redis
```

### MongoDB

```sh
$ docker pull mongo
```

### Docker

1. Docker will be used to deploy each part of the application
2. Clone the GIT repository in your desired deployment directory
```sh
$ git clone git@github.com:CarvajalRodrigo/corale.git
```
#### Build

1. This section describes how to manually build each Docker container
1. Corale Base
    - This container supports the dependencies for running Corale's Flask API and analyses
    - This container takes a long time to build but will only need built once
    - This container is the base container for the Corale Flask container described below
    ```sh
    $ cd server/dockerBase
    $ docker build -t corale_flask_base:1.0 .
    ```
1. Corale Flask
    - This container supports the Flask API and Celery worker processes
    ```sh
    $ cd server/
    $ docker build -t timex_flask:2.0 .
    ```
1. Corale React
    - This container supports the Corale's React frontend
    - **IMPORTANT**: First you must build the static React files
    ```sh
    $ cd client/
    $ npm run build:prod
    $ docker build -t timex_react:2.0 .
    ```

#### Run

1. This section discusses starting each Docker container manually
1. **IMPORTANT**: It is necessary to create a Docker network for inter-container communications for the Corale application to run successfully
```sh
$ docker network create corale_net
```
1. **IMPORTANT**: Make sure the MongoDB was configured for authentication describe [here](#initialize-mongodb)
1. Create the following directories on your local machine.  These directories are used for mounting volumes to the containers
    - /PATH/TO/LOCAL/mongo
    - /PATH/TO/LOCAL/jobs
    - /PATH/TO/LOCAL/data
    - /PATH/TO/LOCAL/logs
1. Run the Docker containers
```sh
$ docker run -d --name corale_redis -p 6378:6379 --restart always --net corale_net redis
$ docker run -d --name corale_mongo -p 27018:27017 --restart always --net corale_net -v /PATH/TO/LOCAL/mongo:/data/db mongo --auth
$ docker run -d --name corale_react -p 7800:7800 --restart always --net corale_net corale_react:2.0
$ docker run -d -ti --name corale_flask -p 7801:7801 --restart always -v /PATH/TO/LOCAL/jobs:/opt/jobs -v /PATH/TO/LOCAL/data:/opt/data --net corale_net corale_flask:2.0 bash -c "./startup.sh --docker -p"
$ docker run -d -ti --name corale_celery --restart always -v /PATH/TO/LOCAL/jobs:/opt/jobs -v /PATH/TO/LOCAL/data:/opt/data --net corale_net corale_flask:2.0 bash -c "./startup.sh --docker -p -w"
```
1. To confirm containers are running
```sh
$ docker ps -a
```
1. To connect to a container
```sh
$ docker exec -it <CONTAINER_NAME> /bin/bash
```

### Initialize MongoDB

1. The first time the MongoDB container is started requires Corale's database to be created
1. **IMPORTANT**: Before starting the Mongo container you must create the corale_net network as described [here](#run)
1. **IMPORTANT**: This step creates a user for the Corale database and to put the MongoDB container behind authentication
```sh
$ docker run -d --name corale_mongo -p 27017:27017 --net corale_net -v /PATH/TO/LOCAL/mongo:/data/db mongo
```
1. Login to the container and create **corale** database, then create application user account:
```sh
$ docker exec -it corale_mongo /bin/bash
# Inside container now
$ mongo
$ use corale;
$ db.createCollection('test');
$ db.createUser({ user: 'corale_app', roles: ['readWrite'], pwd: passwordPrompt() });
$ exit
$ exit
# Now you should be logged out of Mongo and the container
$ docker rm -f corale_mongo
```

#### ETL

1. This section discusses the ETL process for loading the raw Coral datasets into MongoDB.
```sh
$ cd etl/
$ source ../venv/bin/activate
# May need to hardcode the Mongo login credentials in etl.py
$ python3 etl.py
```

### Cron Cleanup

1. **IMPORTANT**: set cronjob to run **server/cleanup.py**
    - This script will remove records that have expired from the MongoDB and the Corale generated files saved on the server
1. **IMPORTANT**: Requires **pymongo** library
    - May need to install [PIP](https://pip.pypa.io/en/stable/installing/)
    ```sh
    $ pip install pymongo
    ```

### Environment Files

1. This section discusses the structure of the **.env** files used to run each component of the application
1. Each .env has the following versions:
    - .env.dev
    - .env.uat
    - .env.prod
1. server/:
```text
REACT_HOST=
REACT_PORT=
REDIS_HOST=
REDIS_PORT=6379
MONGO_HOST=
MONGO_PORT=27017
MONGO_USER=
MONGO_PASS=
MONGO_DB=corale
MONGO_AUTHDB=corale
JOBS_DIR=/PATH/TO/jobs
CORALE_DATE_FILES=/PATH/TO/data
CORALE_JSON_CONFIG=/PATH/TO/com.flask.corale/server/corale/config.json
CORALE_GMT_FILE_ADDR_GSEA=/PATH/TO/com.flask.corale/server/corale/h.all.v7.2.symbols.gmt
CORALE_GMT_FILE_ADDR_GSEA_KEGG=/PATH/TO/com.flask.corale/server/corale/c2.cp.kegg.v7.2.symbols.gmt
CORALE_AA_POLARITY_TABLE=/PATH/TO/com.flask.corale/server/corale/amino_acid_polarity_table.tsv
CORALE_TEMPORARY_KM_CSV=/PATH/TO/test.csv
```
1. client/:
```text
REACT_APP_PRODUCTION=true
REACT_APP_UAT=false
REACT_APP_FLASK_HOST=http://<HOST>
REACT_APP_FLASK_PORT=
REACT_APP_FLASK_PROXY_URL_PREFIX=/corale
REACT_APP_FILESERVER_HOST=http://<HOST>
REACT_APP_FILESERVER_PORT=
REACT_APP_FILESERVER_CORALE_TXT_PATH=/data
REACT_APP_FILESERVER_CORALE_JOB_PATH=/jobs
```
1. client/docker/:
```sh
PORT=
```

### Manual Execution Commands

1. Development:
    - Development is meant to be run outside of Docker containers on localhost:
    ```sh
    # /client - Terminal 1
    $ npm start
    # /server - Terminal 2
    $ ./startup.sh -d
    # /server - Terminal 3
    $ ./startup.sh -d -w
    ```
1. User Acceptance Testing:
    - UAT must be run inside of Docker containers
    ```sh
    # /client - Terminal 1
    $ npm run build
    # /server - Terminal 2
    $ ./startup.sh --docker -u
    # /server - Terminal 3
    $ ./startup.sh --docker -u -w
    ```
1. Production:
    - Prod must be run inside of Docker containers
    ```sh
    # /client - Terminal 1
    $ npm run build
    # /server - Terminal 2
    $ ./startup.sh --docker -p
    # /server - Terminal 3
    $ ./startup.sh --docker -p -w
    ```

### Notes

### NGINX
1. To use NGINX as the static file server for local development
1. NGINX docker:
```sh 
docker run -d --rm --name nginx -p 5556:80 -v /PATH/TO/com.flask.corale/data:/www/corale/data -v /PATH/TO/com.flask.corale/jobs/:/www/corale/jobs -v /PATH/TO/com.flask.corale/userManual:/www/corale/userManual -v /PATH/TO/com.flask.corale/tutorialVideo:/www/corale/tutorialVideo -v /PATH/TO/com.flask.corale/nginx/nginx.conf:/etc/nginx/nginx.conf:ro nginx
```

### Updating Data Files

1. This section discusses updating the raw Corale datasets as well as the Corale Summary .CSV file.
1. **IMPORTANT**: To update the raw Corale data files (.txt) simply replace the current one in **data/** or add the file to **data/**
1. **IMPORTANT**: To update the Summary .CSV:
    1. Add it to **summary/**
    1. Edit the following line in **etl/summary.py**
    ```python
    # Replace the .CSV filename with the newest filename
    passthru = [ rows.append(row.replace('\n','').split(',')) for row in open('../summary/summary_table_20210406.csv', 'r') ]
    ```
    1. Execute the update script
    ```sh
    $ cd etl/
    $ source ../venv/bin/activate
    $ python3 summary.py
    ```
