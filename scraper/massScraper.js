const fs = require("fs")

const scraper = require("./src/scraper")
const remote = require("./src/remote")
const VPN = require("./src/vpn")
const storage = require("./src/localStorage")

const timer = ms => new Promise(res => setTimeout(res, ms))

async function init() {
    await VPN.disconnect()
    await scraper.init()

    const shows = JSON.parse(fs.readFileSync("./import/all.json"))
    remote.log("> imported " + shows.length + " shows")
    const remoteStatus = await remote.status()


    let showNr = 0
    remote.log(`Remote pointer: ${remoteStatus.pointer}`);

    for (show of shows) {
        showNr += 1
        if (remoteStatus.pointer < showNr) {
            remote.log(`Scraping: ${show.title}`);

            dataset = await scrapeShow(show)
            dataset.id = showNr
            remote.dispatch(dataset)
            await timer(2000)

            //storage.reset()
        }
    }
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
                if (localEpisode == false) {
                    let redo = true

                    remote.log(`Show: ${show.title} -> Scraping season ${currentSeasonIndex} of ${show.seasons.length}, episode ${currentEpisodeIndex} of ${season.episodes.length}`)

                    //time measurement
                    let timestampStart = new Date()

                    while(redo) {
                        let link = await scrapeEpisode(episode.href)

                        if (link != "error: blockedIP" && link != "error: timeout") {
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

    async function scrapeEpisode(episode) {
        return new Promise(async (resolve) => {
            let result = await scraper.scrape(episode)

            if (result == "error: blockedIP") {
                remote.log("[!] getting new IP...")
                await VPN.reconnect()
                remote.log("[!] rebooting scraper...")
                await scraper.reboot()

                resolve(result)
            }
            else if (result == "error: timeout") {
                remote.log("[!] getting new IP...")
                await VPN.reconnect()
                remote.log("[!] rebooting scraper...")
                await scraper.reboot()

                resolve(result)
            }
            else {
                resolve(result)
            }
        })
    }
}

remote.log("scraper starting...")
init()

async function vpnTest() {
    await VPN.reconnect()
    console.log("reconnected");
}