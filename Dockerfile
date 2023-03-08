FROM node:15.8.0-buster

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install
COPY awsconfig /root/.aws

# Build the multisetups package
WORKDIR /multisetups
COPY . /multisetups/
RUN npm i