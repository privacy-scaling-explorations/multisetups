import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'

import {
    validateZkeyDir,
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

const download = async (
    contributorNum: number,
    s3bucket: string,
) => {
    // Get the previous contribution directory
    const dirname = getDirName(contributorNum - 1, s3bucket);

    // Clear the workspace
    const clearCmd = `rm -rf ${WORKSPACE_DIR}/*`;
    const outClearCmd = shelljs.exec(clearCmd, { silent: true });

    console.log(`downloading the previous contribution ${dirname} ...`);

    // Download files
    const cmd = `aws s3 sync ${s3bucket}/${dirname} ${WORKSPACE_DIR}/${dirname} --region us-east-1 --endpoint-url https://s3-accelerate.amazonaws.com --no-sign-request`
    const out = shelljs.exec(cmd, { silent: false })

    if (out.code !== 0) {
        console.error(`Error: could not download files from ${s3bucket}/${dirname}`)
        console.error(out.code, out.stderr)
        return 1
    }

    const isZkeyDirValid = validateZkeyDir(`${WORKSPACE_DIR}/${dirname}`) === 0
    if (!isZkeyDirValid) {
        return 1
    }

    console.log(`successfully downloaded previous contribution: ${s3bucket}/${dirname}`)

    return 0
}

export {
    download,
    configureSubparsers,
}
