import * as fs from 'fs'
import * as path from 'path'
import * as shelljs from 'shelljs'

const SUCCINCT_S3_BUCKET = 's3://succinct-trusted-setup';
const WORKSPACE_DIR = '/workspace';
const PTAU_FILENAME = 'powersOfTau28_hez_final_27.ptau';
const FORMAT = '<name>.<num>.zkey'
const ZKEY_NAMES = new Set<string>(['step', 'rotate'])

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
    const uniqNames = new Set<string>()
    for (const z of zkeyFiles) {
        uniqNames.add(z.name)
    }

    if (uniqNames.size !== zkeyFiles.length) {
        console.error(`The .zkey file names should be unique.`)
        return 1
    }

    const eqSet = (xs, ys) =>
        xs.size === ys.size &&
        [...xs].every((x) => ys.has(x));

    if (!eqSet(uniqNames, ZKEY_NAMES)) {
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
    s3bucket: string
): string => {
    const dirNamePrefix = getDirNamePrefix(contributorNum);
    const cmd = `aws s3 ls ${s3bucket}/${dirNamePrefix} --no-sign-request | sed 's/ *PRE //g'`
    const out = shelljs.exec(cmd, { silent: true })

    if (out.code !== 0) {
        console.error(`Error: could not get dirname from prefix of ${s3bucket}/${dirNamePrefix}`)
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
    PTAU_FILENAME,
    SUCCINCT_S3_BUCKET,
    WORKSPACE_DIR,
    ZKEY_NAMES
}
