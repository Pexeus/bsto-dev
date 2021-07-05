const express = require("express")
const fs = require("fs")
const pm2 = require('pm2')

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

function queueStatus() {
    return new Promise(resolve => {
        pm2.describe('neoflix-dev', (err, data) => {
            if(err) {
                console.log(err);
            }

            resolve(data)
        })
    })
}

module.exports = router