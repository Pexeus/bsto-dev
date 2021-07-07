const fs = require("fs")
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

function init() {
    console.log("Initiating Shows Queue");

    try  {
        JSON.parse(fs.readFileSync(qFile))
    }
    catch {
        fs.writeFileSync(qFile, JSON.stringify([]))
    }

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
    add: (show, priority) => {
        if (checkShow(show)) {
            console.log(`[ Adding ] ${show.title}`);

            const queue = get()

            if (priority == true) {
                queue.splice(2, 0, show);
            }
            else {
                queue.push(show)
            }

            set(queue)

            return true
        }
        else {
            return false
        }
    },
    job:() => {
        return new Promise(async resolve => {
            const job = await getJob()

            resolve(job)
        })
    },
    setStatus: (title, status) => {
        return new Promise(resolve => {
            const queue = get()


            queue.forEach(show => {
                if (show.title == title) {
                    console.log(`[Q] Setting status of Show ${title} to ${status}`);
                    show.status = status
                }
            })

            resolve(true)
        })
    },
    remove: title => {
        const queue = get()
        let showDeleted = false

        queue.forEach((entry, index) => {
            if (entry.title == title) {
                console.log(`[ Removing ] ${show.title}`);
                queue.splice(index, 1)

                showDeleted = true
            }
        })

        return showDeleted
    },
    forward: title => {
        const queue = get()
        let forwarded = false

        queue.forEach((entry, index) => {
            if (entry.title == title && entry.status == "updating") {
                console.log(`[ Removing ] ${title}`);
                queue.splice(index, 1)

                forwarded = true
            }
        })

        if (forwarded == true) {
            queue[0].status == "updating"
        }

        set(queue)

        return forwarded
    }
}

init()