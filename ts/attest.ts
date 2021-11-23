import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as os from 'os'

import * as Handlebars from 'handlebars'

import {
    getZkeyFiles,
    countDirents,
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'attest',
        { add_help: true },
    )

    parser.add_argument(
        '-t',
        '--template',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The template file to generate the attestation from.'
        }
    )

    parser.add_argument(
        '-d',
        '--dir',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The directory to write the attestation to.'
        }
    )
}

const attest = async (
    templateFile: string,
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
    }

    // The directory must not be empty
    const numFiles = countDirents(dirname)
    if (numFiles === 0) {
        console.error(`Error: ${dirname} is empty. Run the 'download' subcommand first.`)
        return 1
    }

    const zkeys = getZkeyFiles(dirname)
    if (zkeys.length !== 1) {
        console.error(
            `Error: found ${zkeys.length} zkeys in ${dirname}. ` +
                `There must only be one.`
        )
        return 1
    }
    const contribNum = zkeys[0].num

    const outFile = `${dirname}/attestation.${contribNum}.md`
    if (fs.existsSync(outFile)) {
        console.error(`Error: ${outFile} already exists; aborting.`)
        return 1
    }

    const transcriptFile = `${dirname}/transcript.${contribNum}.txt`
    if (!fs.existsSync(transcriptFile)) {
        console.error(`Error: ${transcriptFile} doesn't exist; aborting.`)
        return 1
    }

    const template = fs.readFileSync(templateFile).toString()
    const compiled = Handlebars.compile(template)

    const now = new Date()
    const attestation = compiled({
        ceremony: process.env.CEREMONY,
        date: now.toDateString(),
        time: now.toTimeString(),
        repo: {
            head: process.env.GIT_HEAD,
            head_name: process.env.GIT_HEAD_NAME,
            upstream: process.env.GIT_UPSTREAM,
        },
        os: {
            arch: os.arch(),
            platform: os.platform(),
            type: os.type(),
            version: os.version(),
        },
        cpu: {
            model: os.cpus()[0].model,
            cores: os.cpus().length,
            bugs: getCpuBugs(),
        },
        mem: {
            total: os.totalmem() / 1024**2,
        },
        uptime: os.uptime(),
        transcript: getTranscript(transcriptFile)
    })
    fs.writeFileSync(outFile, attestation);
    console.log(
        `Wrote prepopulated attestation to ${outFile}.\n` +
            `Please edit this file, sign it, and run the 'upload' subcommand.`)

    return 0
}

const getTranscript = (transcriptFile: string): string => {
    return fs.readFileSync(transcriptFile)
        .toString()
        .trim()
        .replace(/\x1B\[[\d;]+m/g, '')
}

const getCpuBugs = (): string => {
    const bugs = shelljs.exec(`grep '^bugs' /proc/cpuinfo | sort -u`, { silent: true })
    return bugs.replace(/^bugs\s+:\s+/, '').trim()
}

export {
    attest,
    configureSubparsers,
}
