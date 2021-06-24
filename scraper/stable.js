const remote = require("./src/remote")
const scraper = require("./src/scraper")
const storage = require("./src/localStorage")
const request = require("./src/request")
const VPN = require("./src/vpn")

const timer = ms => new Promise(res => setTimeout(res, ms))

async function init() {
    console.clear()
    await VPN.disconnect()
    await scraper.init()

    scrapeContinuously()
}

async function scrapeContinuously() {
    //request job
    const job = await remote.job()

    //scrape episodes
    const show = await scrapeShow(job)

    const updateStatus = await remote.update(show)
    
    if (updateStatus.completed == true) {
        scrapeContinuously()
    }
}

function scrapeShow(show) {
    let seasonIndex = 0
    let episodeIndex = 0

    return new Promise(async resolve =>{
        for (const season of show.seasons) {
            seasonIndex++
            episodeIndex = 0

            for (const episode of season.episodes) {
                let scraping = true
                let tries = 0
                episodeIndex++

                console.log(`Scraping Episode ${episodeIndex}/${season.episodes.length} from Season ${seasonIndex}/${show.seasons.length}`);

                while (scraping) {
                    tries++
                    let result = await scrapeEpisde(episode)
                    
                    if (result.redo == true && tries < 4) {
                        console.log(`Scrape failed, retry ${tries}/3`);
                        await scraper.close()
                        await scraper.init()
                        result = await scrapeEpisde(episode)
                    }
                    else {
                        console.log(`[✓] --> ${result.link}`);

                        episode.vivo = result.link
                        storage.save(episode)

                        scraping = false
                    }
                }
            }

            console.log(season.episodes);
        }

        resolve(show)
    })
}

function scrapeEpisde(episode) {
    return new Promise(async resolve => {
        const cachedEpisode = storage.get(episode.href)
        var result
        var episodeValid

        if (cachedEpisode != false) {
            episodeValid = await request.check(cachedEpisode.vivo)
            
            if (episodeValid) {
                result = {
                    status: true,
                    redo: false,
                    message: "chached",
                    link: cachedEpisode.vivo
                }
            }
        }

        if (cachedEpisode == false || episodeValid == false) {
            scraped = await scraper.scrape(episode.href)

            result = {
                status: true,
                redo: false,
                message: "done",
                link: scraped
            }

            if (scraped == "Scrape aborted: ip") {
                console.log("[main][!] Scrape failed: IP blocked")

                result = {
                    status: false,
                    redo: true,
                    message: "IP",
                    link: "error: IP"
                }
            }

            if (scraped == "Scrape aborted: notAvailable") {
                console.log("[main][!] Scrape failed: notAvailable")

                result = {
                    status: false,
                    redo: false,
                    message: "unavailable",
                    link: "error: unavailable"
                }
            }

            if (scraped == "Scrape aborted: invalidURL") {
                console.log("[main][!] Scrape failed: notAvailable")

                result = {
                    status: false,
                    redo: false,
                    message: "invalidURL",
                    link: "invalid URL"
                }
            }

            if (scraped == "Scrape aborted: timeout") {
                console.log("[main][!] Scrape failed: timeout")

                result = {
                    status: false,
                    redo: true,
                    message: "timeout",
                    link: "browser error"
                }
            }
        }

        resolve(result)
    })
}

init() 