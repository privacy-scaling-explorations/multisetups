import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import * as clc from 'cli-color'

import {
    countDirents,
    SUCCINCT_S3_BUCKET,
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

    parser.add_argument(
        '--s3bucket',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The trusted setup s3 bucket',
            default: SUCCINCT_S3_BUCKET
        }
    )

}

const upload = async (
    contributorNum: number,
    contributorHandle: string,
    s3bucket: string
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

    console.log(`uploading your contribution ${s3dirname} ...`);

    // Upload files
    const cmd = `aws s3 cp --recursive ${dirname} ${s3bucket}/${s3dirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com`
    const out = shelljs.exec(cmd, { silent: false })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to ${s3bucket}/${s3dirname}.`)
        console.error(out.stderr)
        return 1
    }

    console.log(`successfully uploaded contribution: ${s3bucket}/${s3dirname}`)

    const transcriptURL = `https://${s3bucket.slice(5)}.s3.amazonaws.com/${s3dirname}/transcript.${contributorNum}.txt`
    const encodedTranscript = encodeURIComponent(transcriptURL);
    const twitterURl = clc.bold(`https://twitter.com/intent/tweet?text=The%20secret%20is%20safer%20because%20of%20me%20%F0%9F%A4%AB%20Check%20out%20my%20contribution%20here%3A&url=${encodedTranscript}`)
    console.log(`\n\n\n\nPlease post a public attestation of your contribution by tweeting the following message:\n\n${twitterURl}`)

    return 0
}

export {
    upload,
    configureSubparsers,
}
