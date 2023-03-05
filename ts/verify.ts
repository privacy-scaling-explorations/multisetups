import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    FORMAT,
    validateZkeyDir,
    parseZkeyFilename,
    getDirName
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'verify',
        { add_help: true },
    )

    parser.add_argument(
        '--participantNum',
        {
            required: true,
            action: 'store',
            type: 'int',
            help: 'The participant number that you received from the coordinator.'
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
    participantNum: number,
    ptauFile: string,
) => {
    const dirname = getDirName(participantNum);

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
