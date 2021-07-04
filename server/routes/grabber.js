const express = require("express")
const grabber = require("../src/grabber")

const router = express.Router()

router.get("/check/:title", async (req, res) => {
    const show = {
        title: req.params.title
    }


    const localEpisodes = await grabber.episdesLocal(show.title)
    const episodesCount = await grabber.compareShow(show)
    const remoteEpisodes = await grabber.episdesWeb(show.title)


    res.json({
        compare: episodesCount,
        episodes: {
            remote: remoteEpisodes,
            local: localEpisodes
        }
    })
})

module.exports = router