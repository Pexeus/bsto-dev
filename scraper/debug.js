const scraper = require("./src/scraper")
const profileManager = require("./src/profileManager")
const VPN = require("./src/vpn")

const captchaTester = require("./src/captchaTester")


const timer = ms => new Promise(res => setTimeout(res, ms))


async function scrape() {
    console.clear()
    await scraper.init()
    await VPN.disconnect()

    console.log("[DEBUGGER] Requesting link");

    vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/9-Der-schoene-Jacques/en")
    console.log(vivo);
}

async function captchaTest() {
    await captchaTester.init()
}

async function profileManagerTest() {
    await profileManager.init()
    await profileManager.resetProfile()
}

scrape()