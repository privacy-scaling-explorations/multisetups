import * as fs from 'fs'
import * as path from 'path'
import * as shelljs from 'shelljs'

const SUCCINCT_S3_BUCKET = 's3://succinct-telepathy-trusted-setup';
const WORKSPACE_DIR = '/workspace';

const FORMAT = '<name>.<num>.zkey'

const parseZkeyFilename = (file: string) => {
    const r = /^(.+)\.(\d+)\.zkey$/
    const m = file.match(r)
    if (m) {
        return {
            name: m[1],
            num: Number(m[2]),
        }
    }
    return null
}

const getZkeyFiles = (
    dirname: string,
): Array<any> => {
    const zkeyFiles: any[] = []
    for (const file of fs.readdirSync(dirname)) {
        const m = parseZkeyFilename(file)
        if (m) {
            const name = m.name
            const num = m.num
            zkeyFiles.push({
                name,
                num,
                filename: path.join(dirname, file),
            })
        }
    }
    return zkeyFiles
}

const validateZkeyDir = (
    dirname: string,
) => {
    if (!fs.existsSync(dirname)) {
        console.error(`Error: ${dirname} does not exist`)
        return 1
    }
    const zkeyFiles = getZkeyFiles(dirname)

    if (zkeyFiles.length === 0) {
        console.error('Error: there are no .zkey files in', dirname)
        return 1
    }

    // Validate zkey filenames
    const uniqNames = new Set()
    for (const z of zkeyFiles) {
        uniqNames.add(z.name)
        //if (z.num !== 0) {
            //console.log(z)
            //console.error(`Error: all .zkey files in ${dirname} should have the correct format: ${FORMAT}`)
            //return 1
        //}
    }
    if (uniqNames.size !== zkeyFiles.length) {
        console.error(`The .zkey file names should be unique.`)
        return 1
    }

    return 0
}

const countDirents = (
    dirname: string,
): number => {
    let numFiles = 0
    for (const _file of fs.readdirSync(dirname)) {
        numFiles ++
    }
    return numFiles
}

const getDirNamePrefix = (
    contributorNum: number,
): string => {
    return String(contributorNum).padStart(4, '0').trim();
}

const generateDirName = (
    contributorNum: number,
    contributerHandle: string
): string => {
    const dirNamePrefix = getDirNamePrefix(contributorNum);
    const dirName = `${dirNamePrefix}-${contributerHandle}`;
    return dirName;
}

const getDirName = (
    contributorNum: number,
): string => {
    const dirNamePrefix = getDirNamePrefix(contributorNum);
    const cmd = `aws s3 ls ${SUCCINCT_S3_BUCKET}/${dirNamePrefix} | sed 's/ *PRE //g'`
    const out = shelljs.exec(cmd)

    if (out.code !== 0) {
        console.error(`Error: could not get dirname from prefix of ${SUCCINCT_S3_BUCKET}/${dirNamePrefix}`)
        console.error(out.code, out.stderr)
        return ""
    }

    const dirName = out.stdout.trim();
    return dirName;
}

export {
    FORMAT,
    generateDirName,
    getDirName,
    getDirNamePrefix,
    getZkeyFiles,
    validateZkeyDir,
    parseZkeyFilename,
    countDirents,
    SUCCINCT_S3_BUCKET,
    WORKSPACE_DIR
}
