const fs = require("fs")


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
    }
}