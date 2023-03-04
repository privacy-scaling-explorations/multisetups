FROM node:15.8.0-buster

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

RUN npm i

ENV CEREMONY ${CEREMONY}
ENV GIT_HEAD ${GIT_HEAD}
ENV GIT_HEAD_NAME ${GIT_HEAD_NAME}
ENV GIT_UPSTREAM ${GIT_UPSTREAM}
