#!/bin/bash

export GIT_HEAD=$(git rev-parse HEAD)
export GIT_HEAD_NAME=$(git name-rev --name-only $GIT_HEAD)
export GIT_UPSTREAM=$(git config remote.origin.url)
GIT_UPSTREAM=${GIT_UPSTREAM:-$(git config remote.upstream.url)}
