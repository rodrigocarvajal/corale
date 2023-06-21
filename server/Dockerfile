FROM corale_flask_base:1.0

ARG SERVER_DIR=/opt/server
ARG COPY_DIR=/opt/copy
ARG JOBS_DIR=/opt/jobs
ARG DATA_DIR=/opt/data
ARG LOG_DIR=/opt/logs

RUN mkdir -p ${SERVER_DIR} ${COPY_DIR} ${JOBS_DIR} ${DATA_DIR} ${LOG_DIR}

COPY . ${COPY_DIR}

RUN mv ${COPY_DIR}/corale ${SERVER_DIR} && \
    mv ${COPY_DIR}/services ${SERVER_DIR} && \
    mv ${COPY_DIR}/startup.sh ${SERVER_DIR} && \
    mv ${COPY_DIR}/.env* ${SERVER_DIR} && \
    mv ${COPY_DIR}/app.py ${SERVER_DIR} && \
    mv ${COPY_DIR}/wsgi.py ${SERVER_DIR} && \
    rm -rf ${COPY_DIR}

WORKDIR ${SERVER_DIR}

CMD ["/bin/bash"]