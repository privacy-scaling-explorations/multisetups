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
        'download',
        { add_help: true },
    )

    parser.add_argument(
        '-m',
        '--multihash',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The multihash that you received from the coordinator.'
        }
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

const download = async (
    multihash: string,
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
    }

    // The directory must be empty
    let numFiles = 0
    for (const file of fs.readdirSync(dirname)) {
        numFiles ++
    }

    if (numFiles > 0) {
        console.error(`Error: ${dirname} should be empty`)
        return 1
    }

    // Download files
    const cmd = `ipfs get -o ${dirname} /ipfs/${multihash}`
    const out = shelljs.exec(cmd)

    if (out.code !== 0) {
        console.error(`Error: could not download files from /ipfs/${multihash}`)
        console.error(out.code, out.stderr)
        return 1
    }

    const isZkeyDirValid = validateZkeyDir(dirname, true) === 0
    if (!isZkeyDirValid) {
        return 1
    }

    return 0
}

export {
    download,
    configureSubparsers,
}
