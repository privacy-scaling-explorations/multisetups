FROM node:15.8.0-buster

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

COPY ./installIpfs.sh .
RUN bash installIpfs.sh

WORKDIR /multisetups
COPY . /multisetups/
RUN npm i

CMD rm -rf /root/.ipfs2 && \
    mkdir -p /root/.ipfs && \
    mv /root/.ipfs /root/.ipfs2 && \
    ipfs init -e && \
    mv /root/.ipfs2 /root/.ipfs && \
    ipfs daemon
