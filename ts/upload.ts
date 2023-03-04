import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    FORMAT,
    countDirents,
    SUCCINCT_S3_BUCKET
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'upload',
        { add_help: true },
    )

    parser.add_argument(
        '-d',
        '--dir',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The directory that contains the .zkey files. Each .zkey ' +
                'file must follow this naming scheme: ' + FORMAT
        }
    )

}

const upload = async (
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        console.log(`Error: ${dirname} does not exist`)
    }

    // The directory must not be empty
    const numFiles = countDirents(dirname)
    if (numFiles === 0) {
        console.error(`Error: ${dirname} should not be empty`)
        return 1
    }

    // Upload files
    const cmd = `aws s3 cp --recursive ${dirname} ${SUCCINCT_S3_BUCKET}/${dirname}`
    const out = shelljs.exec(cmd, { silent: true })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to ${SUCCINCT_S3_BUCKET}.`)
        console.error(out.stderr)
        return 1
    }
    return 0
}

export {
    upload,
    configureSubparsers,
}
