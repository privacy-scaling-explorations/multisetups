# Attestation of contribution to trusted setup ceremony

{{#if ceremony}}Ceremony: {{ceremony}}

{{/if}}<!--
Please edit this document as you see fit.

The following information is prepopulated for convenience and transparency;
however that does not mean that it is all required.

Please exercise your personal judgement, and if necessary delete stuff
to reach a balance of privacy and transparency which is comfortable for you.
-->

## Context

Contributor name: **INSERT NAME HERE**
Date: {{date}} {{time}}
Geographic location: **INSERT LOCATION HERE**
Time taken: **e.g. "~30 minutes"**

## Hardware used

Device(s): **SPECIFY MACHINE USED, E.G. HARDWARE**
CPU architecture: {{os.arch}}
CPU model: {{cpu.model}}
CPU logical cores: {{cpu.cores}}
CPU bugs: {{cpu.bugs}}
Memory: {{mem.total}}MB

## Software used

OS type: {{os.type}}
OS platform: {{os.platform}}
OS version: {{os.version}}
Uptime: {{uptime}}
Repository upstream: {{repo.upstream}}
Repository commit: {{repo.head}} ({{repo.head_name}})

## Transcript

```
{{transcript}}
```

## Entropy sources

- [ ] mashed keyboard to generate random string
- [ ] bytes from /dev/urandom from machine ...
- [ ] webcam
- [ ] audio input
- [ ] Geiger counter
- [ ] random words from random books
- [ ] asked people for random numbers / words

## Side channel defenses

- [ ] Left other processes running
- [ ] Didn't use swap space
- [ ] Ran the software on secure hardware
- [ ] Didn't tell anyone except coordinator about participation in advance

## Other defenses

- [ ] Disconnected network during generation of contribution
- [ ] Rebooted with airgap before generation of contribution
- [ ] Full disk encryption
- [ ] Put the machine in a Faraday cage
- [ ] Used multiple machines and randomly picked the result of one of them
- [ ] Ensured no one could see the screen

## Post processing

- [ ] Filled up memory with memtester
- [ ] Rebooted the machine
- [ ] Power-cycled the machine
- [ ] Wiped the storage drive
- [ ] Destroyed the machine after (!)

## Sharing of results

I intend to share the files:

- [ ] via IPFS using multisetups
- [ ] via GitHub PR
- [ ] via `magic-wormhole`
- [ ] via **INSERT CLOUD STORAGE HERE**

## Any other comments (optional)

