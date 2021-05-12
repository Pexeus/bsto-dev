//imports
const puppeteer = require('puppeteer')
const remote = require("./remote")
const profileManager = require("./profileManager")

const eventsModule = require('events');
const events = new eventsModule.EventEmitter()

const captchaBuster = require("./captchaBuster")

//delay funktion
const timer = ms => new Promise(res => setTimeout(res, ms))

//global variables
var browser
var buster

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
                    '--no-sandbox',
                ]
            });

            buster = captchaBuster.initate({
                browser: browser
            })

            remote.log("[S] browser initaited")
            resolve(true)
        })
    },
    //close browser
    close: async () => {
        return new Promise(async resolve => {
            await browser.close()

            console.log("[S] browser closed");

            resolve(true)
        })
    },
    //scrape episode
    scrape: async url => {
        return new Promise(async resolve => {
            console.log("[S] Scraping: " + url);
            const result = await scrapeEpisode(url)

            await clearTabs()

            resolve(result)
        })
    }
}

async function scrapeEpisode(url) {
    return new Promise(async resolve => {

        //LISTENERS
        browser.on("targetcreated", async () => {

            let tabs = await browser.pages()
            let newTab = tabs[tabs.length - 1]
    
            await newTab.waitForNavigation()
            let newTabName = await newTab.title()

            console.log("[S] New Tab: " + newTab.url());
            
            //if bsto is reopening the episodes page, update the tab
            if (newTab.url().includes(url)) {
                //await newTab.waitForNavigation();

                events.emit("bsto-tab", newTab)
            }

            if (newTabName.includes("vıvo | ")) {
                console.log("[S] Vivo Tab dedected: " + newTabName);
    
                resolve(newTab.url())
            }
        })

        //variable for the current bsto tab
        var bstoTab

        //resolve the scrape on abort (errors usw.)
        events.on("abort", msg => {
            resolve("Scrape aborted: " + msg)
        })

        //update the current bstoTab
        events.on("bsto-tab", async tab => {
            bstoTab = tab

            //scrolling to bottom of page
            scrollBottom(bstoTab)

            //clicking the playButton
            console.log("[S] clicking play");
            await bstoTab.click('[class="play"]')
        })

        //opening site
        bstoTab = await newTab(url)
    })
}

//scroll to bottom of page
async function scrollBottom(tab) {
    tab.evaluate(async () => {
        window.scrollTo(0,document.body.scrollHeight);
    })
}

//create a new tab
async function newTab(url) {
    console.log("[S] Opening new Tab: " + url);

    return new Promise(async (resolve) => {
        const popupPage = await browser.newPage()
        popupPage.goto(url)

        await popupPage.setDefaultNavigationTimeout(0); 
        
        try {
            await popupPage.waitForNavigation();
            resolve(popupPage)
        }
        catch {
            remote.log("[S] failed to open page: " + url);
            
            events.emit("abort", "failed to open page: " + url)
        }
    })
}

//close all current tabs
async function clearTabs() {
    return new Promise(async resolve => {
        let tabs = await browser.pages()

        tabs.forEach(async (tab) => {
            if (tab.url().includes("https://")) {
                tab.close()
            }
        })

        remote.log("[S] scraper idle")
        await timer(500)
        resolve(true)
    })
}