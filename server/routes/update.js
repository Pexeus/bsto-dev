//impoorts
const express = require("express")

//local imports
const updater = require("../src/updater")
const grabber = require("../src/grabber")
const queue = require("../src/queue")

const router = express.Router()

//update show
router.post("/show", async (req, res) => {
    console.log("[API] Updating Show...");

    const show = req.body
    const metadata = await grabber.metaWeb(show.title)

    //updating episodes
    const episodeStatus = await updater.show(req.body)

    //updating metadata
    const metaStatus = await updater.showMeta(episodeStatus.showID, metadata)

    //removing from queue
    const queueForwarded = queue.forward(show.title)

    //setting completion status
    let completed = false
    if (episodeStatus.status == true && metaStatus.status == true && queueForwarded == true) {
        completed = true
    }

    res.json({
        completed: completed,
        episodeStatus: episodeStatus,
        metaStatus: metaStatus,
        queueStatus: queueForwarded
    })
})

router.get("/show", (req, res) => {
    res.end("WTF")
})

module.exports = router