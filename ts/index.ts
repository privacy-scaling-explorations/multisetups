#!/usr/bin/env node

import * as argparse from 'argparse'
import * as yaml from 'js-yaml'
import * as fs from 'fs'

import {
    init,
    configureSubparsers as configureSubparsersForInit,
} from './init'

import {
    download,
    configureSubparsers as configureSubparsersForDownload,
} from './download'

import {
    contribute,
    configureSubparsers as configureSubparsersForContribute,
} from './contribute'

import {
    attest,
    configureSubparsers as configureSubparsersForAttest,
} from './attest'

import {
    verify,
    configureSubparsers as configureSubparsersForVerify,
} from './verify'

import {
    upload,
    configureSubparsers as configureSubparsersForUpload,
} from './upload'

const run = async () => {
    const parser = new argparse.ArgumentParser({
        description: 'multisetups: create and contribute to a trusted setup ceremony using snarkjs for multiple circuits',
    })

    const subparsers = parser.add_subparsers({
        title: 'Subcommands',
        dest: 'subcommand',
        required: true,
    })

    configureSubparsersForInit(subparsers)
    configureSubparsersForDownload(subparsers)
    configureSubparsersForUpload(subparsers)
    configureSubparsersForContribute(subparsers)
    configureSubparsersForAttest(subparsers)
    configureSubparsersForVerify(subparsers)

    const args = parser.parse_args()

    const loadConfig = (configFile: string) => {
        try {
            return yaml.load(fs.readFileSync(configFile).toString())
        } catch {
            console.error('Error: could not read', args.config)
            return
        }
    }

    try {
        if (args.subcommand === 'download') {
            return (await download(args.contributorNum))
        } else if (args.subcommand === 'contribute') {
            return (await contribute(args.contributorNum, args.entropy))
        } else if (args.subcommand === 'attest') {
            return (await attest(args.template, args.contributorNum))
        } else if (args.subcommand === 'upload') {
            return (await upload(args.contributorNum, args.contributorHandle))
        } else if (args.subcommand === 'verify') {
            return (await verify(args.participantNum, args.ptau))
        }
    } catch (e) {
        console.error(e)
        return 1
    }

    return 0
}

const main = async () => {
    process.exit(await run())
}

if (require.main === module) {
    main()
}
