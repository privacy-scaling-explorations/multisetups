import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    FORMAT,
    validateZkeyDir,
    parseZkeyFilename,
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'upload',
        { add_help: true },
    )

    parser.add_argument(
        '-d',
        '--dir',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The directory that contains the .zkey files. Each .zkey ' +
                'file must follow this naming scheme: ' + FORMAT
        }
    )

}

const upload = async (
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        console.log(`Error: ${dirname} does not exist`)
    }

    // The directory must not be empty
    let numFiles = 0
    for (const file of fs.readdirSync(dirname)) {
        numFiles ++
    }

    if (numFiles === 0) {
        console.error(`Error: ${dirname} should not be empty`)
        return 1
    }

    // Upload files
    const cmd = `ipfs add --pin -Q -r ${dirname}`
    const out = shelljs.exec(cmd, { silent: true })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to IPFS.`)
        console.error(out.stderr)
        return 1
    }
    const multihash = out.stdout.trim()
    console.log('Contribution uploaded. Please send this multihash to the coordinator and keep your IPFS node running and connected to the IPFS network.')
    console.log(multihash)
    return 0
}

export {
    upload,
    configureSubparsers,
}
