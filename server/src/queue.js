const fs = require("fs")
const { resolve } = require("path")
const grabber = require("./grabber")


const qFile = "./json/queue.json"
const backupFile = "./json/queueBackup.json"

function backup() {
    const current = fs.readFileSync(qFile)
    fs.writeFileSync(backupFile, JSON.stringify(current))
}

function get() {
    return JSON.parse(fs.readFileSync(qFile))
}

function set(data) {
    fs.writeFileSync(qFile, JSON.stringify(data))
}

function checkShow(show) {
    const queue = get()

    queue.forEach((entry, index) => {
        if (entry.href == show.href && entry.status == "updating") {
            console.log(`[ Skipping ] ${show.title}`);
            return false
        }
        if (entry.href == show.href && entry.status != "updating") {
            console.log(`[ Removing ] ${show.title}`);
            queue.splice(index, 1)
        }
    })

    set(queue)
    return true
}

async function getJob() {
    return new Promise(async resolve => {
        const queue = get()
        var job

        queue.forEach(show => {
            if (show.status == "updating") {
                job = show
            }
        })

        if (job == undefined) {
            job = queue[0]
            queue[0].status = "updating"

            set(queue)
        }

        job.seasons = await grabber.episdesWeb(job.title)
        
        resolve(job)
    })
}

module.exports = {
    get: () => {
        return get()
    },
    reset: () => {
        backup()

        fs.writeFileSync(qFile, JSON.stringify([]))
    },
    add: show => {
        if (checkShow(show)) {
            console.log(`[ Adding ] ${show.title}`);

            const queue = get()

            queue.push(show)
            set(queue)
        }
    },
    job:() => {
        return new Promise(async resolve => {
            const job = await getJob()

            resolve(job)
        })
    }
}