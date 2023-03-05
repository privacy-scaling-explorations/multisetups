import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    validateZkeyDir,
    countDirents,
    SUCCINCT_S3_BUCKET,
    getDirName,
    WORKSPACE_DIR
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'download',
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
}

const download = async (
    contributorNum: number
) => {
    // Get the previous contribution directory
    const dirname = getDirName(contributorNum - 1);
    console.log("dirname is " + dirname);

    // Clear the workspace
    const clearCmd = `rm -rf ${WORKSPACE_DIR}/*`;
    const outClearCmd = shelljs.exec(clearCmd);

    // Download files
    const cmd = `aws s3 cp --recursive ${SUCCINCT_S3_BUCKET}/${dirname} ${WORKSPACE_DIR}/${dirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com`
    const out = shelljs.exec(cmd)

    if (out.code !== 0) {
        console.error(`Error: could not download files from ${SUCCINCT_S3_BUCKET}/${dirname}`)
        console.error(out.code, out.stderr)
        return 1
    }

    const isZkeyDirValid = validateZkeyDir(`${WORKSPACE_DIR}/${dirname}`) === 0
    if (!isZkeyDirValid) {
        return 1
    }

    return 0
}

export {
    download,
    configureSubparsers,
}
