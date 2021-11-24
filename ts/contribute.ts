import { ArgumentParser } from 'argparse'
import * as crypto from 'crypto'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as path from 'path'

import {
    FORMAT,
    parseZkeyFilename,
    countDirents
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'contribute',
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

    parser.add_argument(
        '-o',
        '--outdir',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The directory to store the new .zkey files.',
        }
    )

    parser.add_argument(
        '-n',
        '--name',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The name of the contributor. Will be visible in verifications.',
        }
    )

    parser.add_argument(
        '-e',
        '--entropy',
        {
            required: false,
            action: 'store',
            default: crypto.randomBytes(128).toString('hex'),
            type: 'str',
            help: 'Custom entropy'
        }
    )
}

const contribute = async (
    dirname: string,
    newDirname: string,
    contributorName: string,
    entropy: string,
) => {
    if (!fs.existsSync(newDirname)) {
        fs.mkdirSync(newDirname)
    }

    // newDirname must be empty
    const numNewFiles = countDirents(newDirname)
    if (numNewFiles !== 0) {
        console.error(`Error: ${newDirname} is not empty.`)
        return 1
    }

    // The directory must not be empty
    const numFiles = countDirents(dirname)
    if (numFiles === 0) {
        console.error(`Error: ${dirname} is empty. Run the 'download' subcommand first.`)
        return 1
    }

    // Perform contributions
    let contribNum = 0
    const contribs: any[] = []
    for (const file of fs.readdirSync(dirname)) {
        const m = parseZkeyFilename(file)
        if (m) {
            const name = m.name
            const num = m.num
            contribNum = num + 1

            const newName = `${name}.${num + 1}.zkey`
            contribs.push({
                original: file,
                'new': newName,
            })
        //} else {
            //console.error(`Error: unexpected file ${file}`)
            //return 1
        }
    }

    let transcript = ''

    let currentEntropy = entropy + crypto.randomBytes(128).toString('hex')

    for (const c of contribs) {
        currentEntropy = crypto.createHash('sha512').update(currentEntropy, 'utf8').digest('hex')

        const o = path.join(dirname, c.original)
        const n = path.join(newDirname, c['new'])
        const cmd = `node ./node_modules/.bin/snarkjs zkey contribute ${o} ${n} --name="${contributorName}`
        let out = shelljs.exec(`echo ${currentEntropy} | ${cmd}`, { silent: true })
        out = out.replace(/Enter a random text\. \(Entropy\): /, '$&\n')
        transcript += `${cmd}\n`
        transcript += `${out}\n\n`
    }

    const transcriptFilepath = path.join(newDirname, `transcript.${contribNum}.txt`)
    fs.writeFileSync(transcriptFilepath, transcript.trim() + '\n')
    console.log(
        `Contribution generated, and transcript written to ${transcriptFilepath}.\n` +
            `Please run the 'attest' command next.`
    )

    return 0
}

export {
    contribute,
    configureSubparsers,
}
