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

    parser.add_argument(
        '--downloadPtau',
        {
            required: false,
            action: 'store_true',
            help: 'Download the ptau file',
            default: false
        }
    )
}

const verify_contribution = async (
    contributorNum: number,
    s3bucket: string,
    downloadPtau: boolean
) => {

    // Download the contribution and initial zkey files
    const contributionDirname = getDirName(contributorNum, s3bucket)
    const initialDirName = getDirName(0, s3bucket)

    const contributionDirNameCmd = `aws s3 sync ${s3bucket}/${contributionDirname} ${WORKSPACE_DIR}/${contributionDirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com --no-sign-request`
    console.log("contributionDirNameCmd is:", contributionDirNameCmd);
    const contributionDirNameOut = shelljs.exec(contributionDirNameCmd, { silent: false })
    const initialDirNameCmd = `aws s3 sync ${s3bucket}/${initialDirName} ${WORKSPACE_DIR}/${initialDirName} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com --no-sign-request`
    console.log("initialDirNameCmd is:", initialDirNameCmd);
    const initialDirNameOut = shelljs.exec(initialDirNameCmd, { silent: false })
    
    // Download the ptau file
    if (downloadPtau) {
        const downloadPtauCmd = `wget -O ${WORKSPACE_DIR}/ptau/${PTAU_FILENAME} https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_27.ptau`
        console.log("downloadPtauCmd is:", downloadPtauCmd);
        const downloadPtauOut = shelljs.exec(downloadPtauCmd, { silent: false })
    }

    const contributionFiles = getZkeyFiles(`${WORKSPACE_DIR}/${contributionDirname}`)
    const initialZkeyFiles = getZkeyFiles(`${WORKSPACE_DIR}/${initialDirName}`)

    for (const zkeyName of ZKEY_NAMES.values()) {
        console.log(`Verifying the ${zkeyName} contribution.`)

        let contributionFilename = ''
        let initialFilename = ''

        for (const contribution of contributionFiles) {
            if (contribution.name == zkeyName) {
                contributionFilename = contribution.filename
                break
            }
        }

        for (const initial of initialZkeyFiles) {
            if (initial.name == zkeyName) {
                initialFilename = initial.filename
                break
            }
        }

        const cmd = `node --es-module-specifier-resolution=node --async-stack-traces --no-warnings --max-old-space-size=2048000 --initial-old-space-size=2048000 --no-global-gc-scheduling --no-incremental-marking --max-semi-space-size=1024 --initial-heap-size=2048000 --expose-gc ./node_modules/.bin/snarkjs -v zkvi ${initialFilename} ${WORKSPACE_DIR}/ptau/${PTAU_FILENAME} ${contributionFilename}`
        console.log("Going to run the command: " + cmd);

        const out = shelljs.exec(cmd, { silent: false })

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
