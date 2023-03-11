import { ArgumentParser } from 'argparse'
import * as path from 'path'
import * as shelljs from 'shelljs'
import { download } from './download'

import {
    getDirName,
    getZkeyFiles,
    PTAU_FILENAME,
    SUCCINCT_S3_BUCKET,
    WORKSPACE_DIR,
    ZKEY_NAMES,
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'verify_initial_zkeys',
        { add_help: true },
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

const verify_initial_zkeys = async (
    s3bucket: string,
    downloadPtau: boolean
) => {

    // Download the initial zkey files
    const initialDirName = getDirName(0, s3bucket)
    const initialDirNameCmd = `aws s3 sync ${s3bucket}/${initialDirName} ${WORKSPACE_DIR}/${initialDirName} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com --no-sign-request`
    console.log("initialDirNameCmd is:", initialDirNameCmd);
    const initialDirNameOut = shelljs.exec(initialDirNameCmd, { silent: false })

    // Download the ptau file
    if (downloadPtau) {
        const downloadPtauCmd = `wget -O ${WORKSPACE_DIR}/ptau/${PTAU_FILENAME} https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_27.ptau`
        console.log("downloadPtauCmd is:", downloadPtauCmd);
        const downloadPtauOut = shelljs.exec(downloadPtauCmd, { silent: false })
    }

    // Download the r1cs files
    const downloadR1CSCmd = `aws s3 sync ${s3bucket}/r1cs/ ${WORKSPACE_DIR}/r1cs/ --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com --no-sign-request`
    const downloadR1CSOut = shelljs.exec(downloadR1CSCmd, { silent: false })
    if (downloadR1CSOut.code !== 0) {
        console.error(`Error: could not download r1cs files from ${s3bucket}/r1cs/`)
        console.error(downloadR1CSOut.code, downloadR1CSOut.stderr)
        return 1
    }

    const initialZkeyFiles = getZkeyFiles(`${WORKSPACE_DIR}/${initialDirName}`)

    for (const zkeyName of ZKEY_NAMES.values()) {
        console.log(`Verifying the ${zkeyName} initial zkey.`)

        let initialFilename = ''
        for (const initial of initialZkeyFiles) {
            if (initial.name == zkeyName) {
                initialFilename = initial.filename
            }
        }

        const r1csFilename = path.join(WORKSPACE_DIR, 'r1cs', `${zkeyName}.r1cs`)

        const cmd = `node --es-module-specifier-resolution=node --async-stack-traces --no-warnings --max-old-space-size=2048000 --initial-old-space-size=2048000 --no-global-gc-scheduling --no-incremental-marking --max-semi-space-size=1024 --initial-heap-size=2048000 --expose-gc ./node_modules/.bin/snarkjs zkey -v verify ${r1csFilename} ${WORKSPACE_DIR}/ptau/${PTAU_FILENAME} ${initialFilename}`
        console.log("Going to run the command: " + cmd);

        const out = shelljs.exec(cmd, { silent: true })

        if (out.code !== 0) {
            console.error(`Error: Initial zKey verification failed for circuit ${zkeyName}`)
            console.error(out.code, out.stderr)
            return 1
        }    
    }

    return 0
}

export {
    verify_initial_zkeys,
    configureSubparsers,
}