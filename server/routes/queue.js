const express = require("express")
const fs = require("fs")

const queue = require("../src/queue")

const router = express.Router()

const qFile = "./json/queue.json"

router.get("/status", (req, res) => {
    res.end(fs.readFileSync(qFile))
})

router.get("/job", async (req, res) => {
    const job = await queue.job()
    
    res.end(JSON.stringify(job))
})

module.exports = router