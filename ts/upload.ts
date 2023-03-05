import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    FORMAT,
    countDirents,
    SUCCINCT_S3_BUCKET,
    getDirName,
    WORKSPACE_DIR,
    generateDirName,
    getDirNamePrefix
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'upload',
        { add_help: true },
    )

    parser.add_argument(
        '--contributorNum',
        {
            required: true,
            action: 'store',
            type: 'int',
            help: 'The participant number that you received from the coordinator.'
        }
    )

    parser.add_argument(
        '--contributorHandle',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: "The contributor's handle (e.g. from github or twitter)"
        }
    )

}

const upload = async (
    contributorNum: number,
    contributorHandle: string,
) => {
    const dirname = `${WORKSPACE_DIR}/${getDirNamePrefix(contributorNum)}`;

    if (!fs.existsSync(dirname)) {
        console.log(`Error: ${dirname} does not exist`)
    }

    // The directory must not be empty
    const numFiles = countDirents(dirname)
    if (numFiles === 0) {
        console.error(`Error: ${dirname} should not be empty`)
        return 1
    }

    // Generate the S3 dirname
    const s3dirname = generateDirName(contributorNum, contributorHandle)

    // Upload files
    const cmd = `aws s3 cp --recursive ${dirname} ${SUCCINCT_S3_BUCKET}/${s3dirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com`
    const out = shelljs.exec(cmd, { silent: true })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to ${SUCCINCT_S3_BUCKET}/${s3dirname}.`)
        console.error(out.stderr)
        return 1
    }
    return 0
}

export {
    upload,
    configureSubparsers,
}
