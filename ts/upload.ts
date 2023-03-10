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

    // Parse the blake2 hashes from the transcript file
    const transcriptPath = path.join(dirname, `transcript.${contributorNum}.txt`)
    let parsingRotateHash = false
    let parsingStepHash = false

    // If contribHashLinNum != -1, then means we are currently parsing the contribution hash
    let contribHashLineNum = -1

    let rotateContribHash = '0x'
    let stepContribHash = '0x'

    fs.readFileSync(transcriptPath, 'utf8').split('\n').forEach((line) => {
        if (line.includes("rotate") || line.includes("Hasher_2")) {
            parsingRotateHash = true
            return
        } else if (line.includes("step") || line.includes("Hasher_3")) {
            parsingStepHash = true
            return
        }

        if (line.includes('Contribution Hash')) {
            contribHashLineNum = 0
            return
        }

        if (contribHashLineNum != -1) {
            if (parsingRotateHash) {
                let re = / /gi
                rotateContribHash += line.trim().replace(re, '')
            } else if (parsingStepHash) {
                let re = / /gi
                stepContribHash += line.trim().replace(re, '')
            } else {
                console.error(`Error: unexpected parsing state: ${line}`)
                return
            }

            contribHashLineNum += 1
            if (contribHashLineNum >= 4) {
                parsingRotateHash = false
                parsingStepHash = false
                contribHashLineNum = -1
            }

            return
        }

        return
    })

    console.log(`successfully uploaded contribution: ${s3bucket}/${s3dirname}`)

    const transcriptURL = `https://${s3bucket.slice(5)}.s3.amazonaws.com/${s3dirname}/transcript.${contributorNum}.txt`
    const encodedTranscript = encodeURIComponent(transcriptURL);
    const twitterURl = clc.bold(`https://twitter.com/intent/tweet?text=%40SuccinctLabs%F0%9F%A4%AB%0A${rotateContribHash}0A%0A${stepContribHash}`)
    console.log(`\n\n\n\nPlease post a public attestation of your contribution by tweeting the following message:\n\n${twitterURl}`)

    return 0
}

export {
    upload,
    configureSubparsers,
}
