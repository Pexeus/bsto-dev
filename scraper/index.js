const remote = require("./src/remote")
const scraper = require("./src/scraper")
const VPN = require("./src/vpn")
const storage = require("./src/localStorage")
const request = require("./src/request")
const fs = require("fs")
const timer = ms => new Promise(res => setTimeout(res, ms))


async function init() {
    console.clear()
    await VPN.disconnect()
    await scraper.init()

    scrapeContinuously()
}

async function scrapeContinuously() {
    const status = await doJob()

    if (status.completed == true) {
        console.log(status);
        scrapeContinuously()
    }
    else {
        console.log("Stopped Scraping, ERROR:");
        console.log(status);
    }
}

async function doJob() {
    return new Promise(async resolve => {
        //request show
        const job = await remote.job()
        
        //scrape show
        const scraped = await scrapeShow(job)

        //cache show
        fs.writeFileSync("./show.json", JSON.stringify(scraped))

        //dispatch scraped show
        const updateStatus = await remote.update(scraped)

        resolve(updateStatus)
    })
}

async function scrapeShow(show) {
    return new Promise(async (resolve) => {
        let currentSeasonIndex = 0
        let currentEpisodeIndex = 0


        for(season of show.seasons) {
            currentSeasonIndex += 1
            currentEpisodeIndex = 0
            for (episode of season.episodes) {
                currentEpisodeIndex += 1

                const localEpisode = storage.get(episode.href)
                let episodeValid = false    

                if (localEpisode != false && localEpisode != "error: notAvailable") {
                    //if the episode is unavailable, dont try to scrape again
                    if (localEpisode.vivo.includes("notAvailable")) {
                        episodeValid = true
                    }
                    else {
                        episodeValid = await request.check(localEpisode.vivo)
                    }
                }



                if (episodeValid == false) {
                    let redo = true

                    remote.log(`Show: ${show.title} -> Scraping season ${currentSeasonIndex} of ${show.seasons.length}, episode ${currentEpisodeIndex} of ${season.episodes.length}`)

                    //time measurement
                    let timestampStart = new Date()

                    while(redo) {
                        let link = await scrapeEpisode(episode.href)

                        if (link != "Scrape aborted: ip" && link != "error: timeout") {
                            redo = false
                            episode.vivo = link
                        }
                    }
                    //time measurement
                    let delay = (new Date() - timestampStart) / 1000
                    remote.log(`[✓] ${episode.vivo} [${delay}s]`)

                    //storing episode locally
                    storage.save(episode)
                }
                else {
                    remote.log(`[✓] ${localEpisode.vivo} [storage]`)
                    episode.vivo = localEpisode.vivo
                }
            }
        }

        resolve(show)
    })
}

async function scrapeEpisode(episode) {
    return new Promise(async (resolve) => {
        let result = await scraper.scrape(episode)

        if (result == "Scrape aborted: ip") {
            remote.log("[!] getting new IP...")

            await scraper.close()

            await VPN.reconnect()
            
            await scraper.init()

            resolve(result)
        }
        else {
            resolve(result)
        }
    })
}

init()
