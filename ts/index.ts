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
    verify,
    configureSubparsers as configureSubparsersForVerify,
} from './verify'

import {
    upload,
    configureSubparsers as configureSubparsersForUpload,
} from './upload'

const main = async () => {
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
        if (args.subcommand === 'init') {
            //const config = loadConfig(args.config)
            //return (await init(config))
            return (await init(args.dir))
        } else if (args.subcommand === 'download') {
            return (await download(args.multihash, args.dir))
        } else if (args.subcommand === 'contribute') {
            return (await contribute(args.dir, args.outdir, args.name, args.entropy))
        } else if (args.subcommand === 'upload') {
            return (await upload(args.dir))
        } else if (args.subcommand === 'verify') {
            return (await verify(args.dir, args.ptau))
        }
    } catch (e) {
        console.error(e)
        return 1
    }

    return 0
}

if (require.main === module) {
    main()
}
