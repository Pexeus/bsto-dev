const axios = require("axios")
const fs = require("fs")

const scraper = require("./src/scraper")
const profileManager = require("./src/profileManager")
const VPN = require("./src/vpn")
const captchaTester = require("./src/captchaTester")
const remote = require("./src/remote")

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

testRequest()