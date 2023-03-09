import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as path from 'path'
import { download } from './download'

import {
    getDirName,
    PTAU_FILENAME,
    SUCCINCT_S3_BUCKET,
    WORKSPACE_DIR,
    ZKEY_NAMES,
    getZkeyFiles
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'verify_contribution',
        { add_help: true },
    )

    parser.add_argument(
        '--contributorNum',
        {
            required: true,
            action: 'store',
            type: 'int',
            help: 'The contributor number that you received from the coordinator.'
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

const verify_contribution = async (
    contributorNum: number,
    s3bucket: string,
) => {

    // Download the contribution and initial zkey files
    download(contributorNum, s3bucket)
    download(0, s3bucket)
    
    // Download the ptau file
    const downloadPtauCmd = `aws s3 sync ${s3bucket}/ptau/${PTAU_FILENAME} ${WORKSPACE_DIR}/ --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com`
    const downloadPtauOut = shelljs.exec(downloadPtauCmd, { silent: true })

    if (downloadPtauOut.code !== 0) {
        console.error(`Error: could not download file ${s3bucket}/ptau/${PTAU_FILENAME}`)
        console.error(downloadPtauOut.code, downloadPtauOut.stderr)
        return 1
    }

    const contributionDirname = getDirName(contributorNum, s3bucket);
    const contributionFiles = getZkeyFiles(contributionDirname)

    const initialDirName = getDirName(0, s3bucket);
    const initialZkeyFiles = getZkeyFiles(initialDirName)

    // At this point, we know that the downloaded directories each has a STEP and ROTATE zkey file.
    // The download function will verify that.

    for (const zkeyName of ZKEY_NAMES.values()) {
        console.log(`Verifying the ${zkeyName} contribution.`)

        let contributionFilename = ''
        let initialFilename = ''

        for (const contribution of contributionFiles) {
            if (contribution.name == zkeyName) {
                contributionFilename = path.join(WORKSPACE_DIR, contribution.name)
            }
        }

        for (const initial of initialZkeyFiles) {
            if (initial.name == zkeyName) {
                initialFilename = path.join(WORKSPACE_DIR, initial.name)
            }
        }

        const cmd = `node --es-module-specifier-resolution=node --async-stack-traces --no-warnings --max-old-space-size=2048000 --initial-old-space-size=2048000 --no-global-gc-scheduling --no-incremental-marking --max-semi-space-size=1024 --initial-heap-size=2048000 --expose-gc ./node_modules/.bin/snarkjs zkvi ${initialFilename} ${PTAU_FILENAME} ${contributionFilename}`
        console.log("Going to run the command: " + cmd);

        const out = shelljs.exec(cmd, { silent: true })

        if (out.code !== 0) {
            console.error(`Error: Verification failed for circuit ${zkeyName} and contributor ${contributorNum}`)
            console.error(out.code, out.stderr)
            return 1
        }    
    }

    return 0
}

export {
    verify_contribution,
    configureSubparsers,
}
