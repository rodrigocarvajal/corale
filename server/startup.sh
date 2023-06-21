#!/bin/bash

# Set Defaults ######################
HOST=localhost
PROD_HOST=0.0.0.0
UAT_HOST=0.0.0.0
PORT=5510
UAT_PORT=7801
PROD_PORT=7801
LOG_DIR=/opt/logs
DOCKER_FLASK_APP=/opt/server
GUNICORN_LOG_DIR=${LOG_DIR}/gunicorn_flask.log
GUNICORN_ERROR_LOG_DIR=${LOG_DIR}/gunicorn_error.log
CELERY_LOG_DIR=${LOG_DIR}/celery.log
GUNICORN_POST_REQEUST_TIMEOUT_SEC=300
#####################################

# DO NOT CHANGE #####################
start_celery_worker='false'
production_selection='false'
uat_selection='false'
flaskenv=develop
#####################################

docker=false

function help_f 
{

echo -e "
Parameters:

    -d, --develop           Run in development mode
    --docker                Run in Docker container
    -h, --help              This help message
    -p, --production        Run in production mode
    -u, --uat               Run in UAT mode
    --host                  Set Flask's hostname
    --port                  Set Flask's port

"
}

if [ "$1" == "" ]; then
    echo "No input parameter selected"
    exit 1
fi

while [ "$1" != "" ]; do

    case $1 in

        -d | --develop      )   MODE=development
                                flaskenv='development'
                                ;;

        --docker            )   host=0.0.0.0
                                docker=true
                                ;;

        -h | --help         )   help_f
                                exit 0
                                ;;

        -p | --production   )   MODE=production
                                flaskenv='production'
                                production_selection='true'
                                HOST=$PROD_HOST
                                PORT=$PROD_PORT
                                ;;

        -u | --uat          )   MODE=uat
                                HOST=$UAT_HOST
                                PORT=$UAT_PORT
                                flaskenv='production'
                                uat_selection='true'
                                ;;

        -w | --worker       )   start_celery_worker='true'
                                ;;

        --host              )   shift
                                HOST=$1
                                ;;

        --port              )   shift  
                                PORT=$1
                                ;;

        *                   )   echo "Invalide option"
                                exit 1
                                ;;

    esac
    shift

done

export FCORALE_UAT=$uat_selection
export FCORALE_PRODUCTION=$production_selection

export FLASK_ENV=$flaskenv

if [ "$docker" == "true" ]; then
    export FLASK_APP=$DOCKER_FLASK_APP
else 
    export FLASK_APP=app.py
fi

if [ "$start_celery_worker" == "false" ]; then
    if [ "$production_selection" == "true" ] || [ "$uat_selection" == "true" ]; then
        echo 'GUNICORN: Booting...'
        echo 'GUNICORN: Hosted @ '$HOST:$PORT 
        echo 'GUNICORN: Ready'
        gunicorn -w 2 -b $HOST:$PORT --timeout $GUNICORN_POST_REQEUST_TIMEOUT_SEC --access-logfile $GUNICORN_LOG_DIR --error-logfile ${GUNICORN_ERROR_LOG_DIR} wsgi:app
    else
        flask run --host $HOST --port $PORT
    fi
else
    celery -A app.celery worker -O fair --loglevel=INFO --logfile=${CELERY_LOG_DIR}
fi