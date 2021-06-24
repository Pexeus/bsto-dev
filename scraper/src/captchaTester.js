const puppeteer = require('puppeteer')
const captchaBuster = require("./captchaBuster");
const profileManager = require("./profileManager")

const timer = ms => new Promise(res => setTimeout(res, ms))

module.exports = {
    //startup browser
    init: async () => {
        return new Promise( async (resolve) => {
            await profileManager.init()
            await profileManager.resetProfile()

            browser = await puppeteer.launch({ 
                product: 'firefox',
                headless: false,
                defaultViewport: null,
                userDataDir: "./browserData/browserProfile",
                args: [
                    '--no-sandbox', '--auto-open-devtools-for-tabs'
                ]
            });

            console.log("[CaptchaTester] browser initaited")

            buster = await captchaBuster.initiate({
                browser: browser
            })
            
            await timer()
            await newTab("https://www.google.com/recaptcha/api2/demo")
        })
    },
}

async function newTab(url) {
    console.log("[CaptchaTester] Opening new Tab: " + url);

    return new Promise(async (resolve) => {
        const tab = await browser.newPage()
        tab.goto(url)

        await tab.setDefaultNavigationTimeout(0); 
        
        await tab.waitForNavigation();
        resolve(tab)
    })
}