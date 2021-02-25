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

const validateZkeyDir = (
    dirname: string,
    mayContainTranscript = false,
) => {
    if (!fs.existsSync(dirname)) {
        console.error(`Error: ${dirname} does not exist`)
        return 1
    }
    const zkeyFiles: any[] = []
    let totalFiles = 0
    for (const file of fs.readdirSync(dirname)) {
        if (mayContainTranscript && file.startsWith('transcript') && file.endsWith('.txt')) {
            continue
        }
        totalFiles ++
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

    if (zkeyFiles.length !== totalFiles && mayContainTranscript === false) {
        console.error(`Error: ${dirname} should only contain .zkey files`)
        return 1
    }

    if (zkeyFiles.length === 0) {
        console.error('Error: there are no .zkey files in', dirname)
        return 1
    }

    // Validate zkey filenames
    let isValid = true
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

export {
    FORMAT,
    validateZkeyDir,
    parseZkeyFilename,
}
