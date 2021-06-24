const axios = require("axios")
const fs = require("fs")

const scraper = require("./src/scraper")
const profileManager = require("./src/profileManager")
const VPN = require("./src/vpn")
const captchaTester = require("./src/captchaTester")
const remote = require("./src/remote")

const v = "Vivo"
const timer = ms => new Promise(res => setTimeout(res, ms))

async function testRequest() {
    const show = JSON.parse(fs.readFileSync("./show.json"))
    console.log(show);

    console.log("---------------------------------------------");

    const status = await remote.update(show)
    console.log(status);
}

async function scrape() {
    console.clear()
    await scraper.init()
    await VPN.disconnect()

    while (true) {
        console.log("[DEBUGGER] Requesting link");

        await scraper.scrape("https://bs.to/serie/Miss-Kobayashi-s-Dragon-Maid/1/1-Der-maechtigste-Maid-Drache-der-Geschichte-Na-ja-sie-ist-ja-auch-ein-Drache/de/")
        await scraper.scrape("https://bs.to/serie/Star-Wars-The-Clone-Wars/6/1-Zustand-unbekannt/de/")
        await scraper.scrape("https://bs.to/serie/Nikita/4/1-Ohne-Gefuehle/de/")

    }
}

async function startStop() {
    await VPN.disconnect()

    console.log("[D] Starting");
    await scraper.init()
    console.log("[D] Ready");

    await timer(5000)

    console.log("[D] Stopping");
    await scraper.close()
    console.log("[D] Closed");

    console.log("[D] Starting");
    await scraper.init()
    console.log("[D] Ready");

    await scraper.testCaptcha()
}

async function vpnScrape() {
    console.clear()
    await VPN.disconnect()
    await scraper.init()

    while (true) {        
        await scraper.scrape("https://bs.to/serie/Miss-Kobayashi-s-Dragon-Maid/1/1-Der-maechtigste-Maid-Drache-der-Geschichte-Na-ja-sie-ist-ja-auch-ein-Drache/de/")

        await VPN.reconnect()
        console.log("waiting...");
        await timer(10000)
        console.log("Go!");
    }
}

async function captchaTest() {
    await VPN.reconnect()
    await captchaTester.init()
}

async function profileManagerTest() {
    await profileManager.init()
    await profileManager.resetProfile()
}

scrape()