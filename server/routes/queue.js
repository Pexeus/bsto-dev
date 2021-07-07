const express = require("express")
const fs = require("fs")
const pm2 = require('pm2')
const grabber = require("../src/grabber")

const queue = require("../src/queue")

const router = express.Router()

const qFile = "./json/queue.json"

const scraperAtctivity = {
    lastJobRequest: 0,
}

router.get("/status", async (req, res) => {
    const status = await queueStatus()

    res.json({
        scraper: scraperAtctivity,
        queue: JSON.parse(fs.readFileSync(qFile, "utf8")),
        status: status
    })
})

router.get("/job", async (req, res) => {
    console.log("[Queue API] Job Requested");
    scraperAtctivity.lastJobRequest = Date.now()
    const job = await queue.job()
    
    res.end(JSON.stringify(job))
})

router.post("/add/:title", async (req, res) => {
    const title = req.params.title
    const url = await grabber.getShowUrl(title)

    const set = {
        title: title,
        href: url,
        status: "queued",
        added: Date.now()
    }

    const status = await queue.add(set, true)

    res.json({
        show: set,
        status: status
    })
})

function queueStatus() {
    return new Promise(resolve => {
        pm2.describe('neoflix-queue', (err, data) => {
            if(err) {
                console.log(err);
            }

            resolve(data)
        })
    })
}

module.exports = router