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
        'verify',
        { add_help: true },
    )

    parser.add_argument(
        '-d',
        '--dir',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The directory that contains the .zkey files to verify. Each .zkey ' +
                'file must follow this naming scheme: ' + FORMAT
        }
    )

    parser.add_argument(
        '-p',
        '--ptau',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The path to the .ptau file',
        }
    )
}

const verify = async (
    dirname: string,
    ptauFile: string,
) => {
    // The directory must not be empty
    let numFiles = 0
    for (const file of fs.readdirSync(dirname)) {
        numFiles ++
    }

    if (numFiles === 0) {
        console.error(`Error: ${dirname} is empty. Run the 'download' subcommand first.`)
        return 1
    }

    // Perform contributions
    let contribNum
    const contribs: string[] = []
    for (const file of fs.readdirSync(dirname)) {
        const m = parseZkeyFilename(file)
        if (m) {
            contribs.push(file)
        }
    }

    console.log('You should run the following commands to verify the contribution:')
    for (const c of contribs) {
        const cmd = `node ./node_modules/.bin/snarkjs zkey verify <R1CS_FILE> ${ptauFile} ${c}`
        console.log(cmd)
    }

    return 0
}

export {
    verify,
    configureSubparsers,
}
