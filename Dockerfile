FROM node:15.8.0-buster

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN wget -q https://dist.ipfs.io/go-ipfs/v0.8.0/go-ipfs_v0.8.0_linux-amd64.tar.gz && \
    tar -xvzf go-ipfs_v0.8.0_linux-amd64.tar.gz && \
    cd go-ipfs && \
    bash install.sh

WORKDIR /multisetups
COPY . /multisetups/
RUN npm i

CMD rm -rf /root/.ipfs2 && \
    mkdir -p /root/.ipfs && \
    mv /root/.ipfs /root/.ipfs2 && \
    ipfs init -e && \
    mv /root/.ipfs2 /root/.ipfs && \
    ipfs daemon

ENV GIT_HEAD ${GIT_HEAD}
ENV GIT_HEAD_NAME ${GIT_HEAD_NAME}
ENV GIT_UPSTREAM ${GIT_UPSTREAM}
