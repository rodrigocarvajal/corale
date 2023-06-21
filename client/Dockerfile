FROM node:15.12.0-alpine3.10

ARG SERVER_DIR=/opt/server

RUN mkdir -p ${SERVER_DIR}

COPY docker ${SERVER_DIR}
COPY build ${SERVER_DIR}/build

RUN cd ${SERVER_DIR} && \
    npm install

WORKDIR ${SERVER_DIR}
ENTRYPOINT [ "npm", "run", "start:prod" ]