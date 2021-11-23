import * as fs from 'fs'
import * as path from 'path'

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

export {
    FORMAT,
    getZkeyFiles,
    validateZkeyDir,
    parseZkeyFilename,
    countDirents,
}
