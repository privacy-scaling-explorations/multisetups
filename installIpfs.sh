#!/bin/bash

arch=$(uname -m)

if [[ "$arch" =~ "^arm" ]]; then
    url=https://dist.ipfs.io/go-ipfs/v0.8.0/go-ipfs_v0.8.0_linux-arm64.tar.gz
else
    url=https://dist.ipfs.io/go-ipfs/v0.8.0/go-ipfs_v0.8.0_linux-amd64.tar.gz
fi

echo "Downloading $url"
wget -q -O ipfs.tar.gz $url 
tar -xvzf ipfs.tar.gz
cd go-ipfs
bash install.sh
