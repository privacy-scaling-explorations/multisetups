#!/usr/bin/env node

import * as argparse from 'argparse'
import * as yaml from 'js-yaml'
import * as fs from 'fs'

import {
    download,
    configureSubparsers as configureSubparsersForDownload,
} from './download'

import {
    contribute,
    configureSubparsers as configureSubparsersForContribute,
} from './contribute'

import {
    verify_contribution,
    configureSubparsers as configureSubparsersForVerifyContribution,
} from './verify_contribution'

import {
    verify_initial_zkeys,
    configureSubparsers as configureSubparsersForVerifyInitialZKeys,
} from './verify_initial_zkeys'

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

    configureSubparsersForDownload(subparsers)
    configureSubparsersForUpload(subparsers)
    configureSubparsersForContribute(subparsers)
    configureSubparsersForVerifyContribution(subparsers)
    configureSubparsersForVerifyInitialZKeys(subparsers)

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
            return (await download(args.contributorNum, args.s3bucket))
        } else if (args.subcommand === 'contribute') {
            return (await contribute(args.contributorNum, args.entropy))
        } else if (args.subcommand === 'upload') {
            return (await upload(args.contributorNum, args.contributorHandle, args.s3bucket))
        } else if (args.subcommand === 'verify_contribution') {
            return (await verify_contribution(args.participantNum, args.ptau))
        } else if (args.subcommand === 'verify_initial_zkeys') {
            return (await verify_initial_zkeys(args.s3bucket))
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
