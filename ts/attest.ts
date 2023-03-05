import { ArgumentParser } from 'argparse'
import * as shelljs from 'shelljs'
import * as fs from 'fs'
import * as os from 'os'

import * as Handlebars from 'handlebars'

import {
    getZkeyFiles,
    countDirents,
    getDirNamePrefix,
    WORKSPACE_DIR
} from './utils'

const configureSubparsers = (subparsers: ArgumentParser) => {
    const parser = subparsers.add_parser(
        'attest',
        { add_help: true },
    )

    parser.add_argument(
        '--template',
        {
            required: true,
            action: 'store',
            type: 'str',
            help: 'The template file to generate the attestation from.'
        }
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

}

const attest = async (
    templateFile: string,
    contributorNum: number
) => {
    const dirname = `${WORKSPACE_DIR}/${getDirNamePrefix(contributorNum)}`;

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
    
    console.log("transcriptFile: ", transcriptFile);
    const template = fs.readFileSync(templateFile).toString()
    const compiled = Handlebars.compile(template)

    const now = new Date()

    console.log("going to run compiled");
    const attestation = compiled({
        //ceremony: process.env.CEREMONY,
        ceremony: "test ceremony",
        date: now.toDateString(),
        time: now.toTimeString(),
        repo: {
            head: 'test git head',
            head_name: 'test git head name',
            upstream: 'test git upstream',
            //head: process.env.GIT_HEAD,
            //head_name: process.env.GIT_HEAD_NAME,
            //upstream: process.env.GIT_UPSTREAM,
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
    console.log("going to read transcriptFile: ", transcriptFile);
    return fs.readFileSync(transcriptFile)
        .toString()
        .trim()
        .replace(/\x1B\[[\d;]+m/g, '')
}

const getCpuBugs = (): string => {
    console.log("going to run getCpuBugs");
    const bugs = shelljs.exec(`grep '^bugs' /proc/cpuinfo | sort -u`, { silent: true })
    return bugs.replace(/^bugs\s+:\s+/, '').trim()
}

export {
    attest,
    configureSubparsers,
}
