const scraper = require("./src/scraper")
const profileManager = require("./src/profileManager")

const timer = ms => new Promise(res => setTimeout(res, ms))


async function init() {
    console.clear()
    await scraper.init()

    while (true) {
        console.log("[DEBUGGER] Requesting link");

        vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/2-Bart-wird-ein-Genie/")
        console.log(vivo);

        await timer(3000)
    }


}

async function profileManagerTest() {
    await profileManager.init()
    await profileManager.resetProfile()
}

init()