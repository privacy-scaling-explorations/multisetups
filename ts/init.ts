import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'
import { FORMAT, validateZkeyDir } from './utils'


const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'init',
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

const init = async (
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        console.error(`Error: ${dirname} does not exist`)
        return 1
    }

    const isZkeyDirValid = validateZkeyDir(dirname) === 0
    if (!isZkeyDirValid) {
        return 1
    }

    const cmd = `ipfs add --pin -Q -r ${dirname}`
    const out = shelljs.exec(cmd, { silent: true })
    if (out.code !== 0 || out.stderr) {
        console.error(`Error: could not add ${dirname} to IPFS.`)
        console.error(out.stderr)
        return 1
    }
    const multihash = out.stdout.trim()
    console.log('Ceremony initialised. Please give this multihash to the first participant and keep your IPFS node running and connected to the IPFS network.')
    console.log(multihash)

    return 0
}

export {
    init,
    configureSubparsers,
}
