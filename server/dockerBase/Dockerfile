FROM ubuntu:18.04

ARG SERVER_DIR=/opt/server

RUN mkdir -p ${SERVER_DIR}

COPY requirements.txt ${SERVER_DIR}

RUN apt update && \
    apt install -y \
        build-essential \ 
        apt-utils \
        libssl-dev \
        libffi-dev \
        libxml2-dev \
        libcurl4-openssl-dev \
        python3-dev \
        #python3.8-dev MAY NEED THIS DEPENDENCY \
        libpython3.8-dev \
        python3-distutils \
        python3-apt \
        software-properties-common \
        curl && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt install -y python3.8 && \
    mv /usr/bin/python3.8 /usr/bin/python && \
    curl https://bootstrap.pypa.io/get-pip.py -o /opt/get-pip.py && \
    python /opt/get-pip.py && \
    cd ${SERVER_DIR} && \
    pip install -r requirements.txt

CMD ["/bin/bash"]