#!/bin/bash

set -e

export CEREMONY="Succinct Telepathy Light Client Circuits 1.0"
source $(dirname $0)/git-snapshot.sh

echo GIT_HEAD="$GIT_HEAD"
echo GIT_HEAD_NAME="$GIT_HEAD_NAME"
echo GIT_UPSTREAM="$GIT_UPSTREAM"

docker build . "$@"