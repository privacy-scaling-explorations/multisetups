# multisetups

For production use, Groth16 zk-SNARK circuits require a multi-party trusted
setup to generate the proving and verifying key fo reach circuit, while
reducing the probability that the toxic waste associated with the keys has been
retained. While there already exist ([1](https://github.com/briangu33/Setup),
[2](https://github.com/glamperd/setup-mpc-ui),
[3](https://github.com/celo-org/snark-setup/)) which help teams to automate
this process, so far none exist that support this combination of requirements:

1. Multiple circuits per ceremony (e.g. [MACI](https://github.com/appliedzkp/maci))
2. Large circuits (more than 1 million constraints) that cannot be set up in a
   browser

The `multisetups` utility seeks to meet them with the following goals in mind:

1. Simplicity:

    - Rather than automate away the role of a central coordinator, a
      coordinator is needed to verify contributions and pass the baton on to
      the next participant. Moreover, doing so reduces the time and cost of
      development.

2. Ease of use for contributors:

    - Contributors should only have to run a few commands to participate in
      the ceremony. Moreover, the software will be Dockerised for maximum
      ease-of-use.

3. Low infrastructure overhead:

    - Contribution files should be transferred via IPFS, so it is not necessary
      to provision cloud machines for the ceremony. As long as the coordinator
      has high bandwidth and storage, they can run the ceremony from their own
      machine.

## Requirements

You need IPFS installed in your `$PATH` and you should run `ipfs daemon` in a
separate terminal. This allows the coordinator and participants to easily share
`.zkey` files.

## Quick start with Docker

```bash
git clone git@github.com:weijiekoh/multisetups.git &&
cd multisetups &&
docker-compose build &&
docker-compose up
```

To create a new ceremony with the sample `.zkey` files:

```
docker-compose exec multisetups node build/index.js init -d /multisetups/zkeys
Ceremony initialised. Please give this multihash to the first participant and keep your IPFS node running and connected to the IPFS network.
Qmeg59hpYk82DYmdupTgYTuZNedLeTKBJNQ2r38EpUqgYn
```

To download the ceremony files as a contributor:

```
docker-compose exec multisetups node build/index.js download -m Qmeg59hpYk82DYmdupTgYTuZNedLeTKBJNQ2r38EpUqgYn -d /ceremony/old

Saving file(s) to /ceremony/old
 247.36 KiB / 247.36 KiB [========================================] 100.00% 0s
```

To contribute:

```
docker-compose exec multisetups node build/index.js contribute -d /ceremony/old -n /ceremony/new

Contribution complete. Please run the 'upload' subcommand. Next, sign the transcript in /ceremony/new/transcript.1.txt and send it to the coordinator.
```

To upload the contribution:

```
docker-compose exec multisetups node build/index.js upload -d /ceremony/new

Contribution uploaded. Please send this multihash to the coordinator and keep your IPFS node running and connected to the IPFS network.
QmYDsgWYRuHNYBeJABGZ6Csdj256jvj4E4WYX2dJ6w6iCj
```

## Installation

```bash
git clone git@github.com:weijiekoh/multisetups.git &&
cd multisetups &&
npm i
```

## Creating a new ceremony

First, create a `zkeys` directory and store all your `.zkey` files in it. You
can use [`zkey-manager`](https://github.com/weijiekoh/zkey-manager) to create
them.

Next, run:

```
node build/index.js init -d zkeys
```

You should see something like this:

```
Ceremony initialised. Please give this multihash to the first participant and keep your IPFS node running and connected to the IPFS network.
Qmeg59hpYk82DYmdupTgYTuZNedLeTKBJNQ2r38EpUqgYn
```

## Contributing to a ceremony

First, download the `.zkey` files:

```
node build/index.js download -d ./old -m <MULTIHASH>.
```

Next, perform the contribution. This may take a long time. It should ideally be
done on an airgapped computer.

```
node build/index.js contribute -m <MULTIHASH> -d ./old -n ./new
```

Finally, upload the files:

```
node build/index.js upload -n ./new
```
