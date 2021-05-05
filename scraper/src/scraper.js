//imports
const puppeteer = require('puppeteer')
const remote = require("./remote")
const profileManager = require("./profileManager")

const eventsModule = require('events');
const events = new eventsModule.EventEmitter()

const captchaBuster = require("./captchaBuster");

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
            
            //emitting new tab event on new tab (fix to prohibit event duping)
            browser.on("targetcreated", () => {
                events.emit("newTab")
            })

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
            setTimeout(async () => {
                console.log("Scrape timed out, aborting...");
                await clearTabs
                resolve("error: timeout")
            }, 30000);

            console.log("[S] Scraping: " + url);
            const result = await scrapeEpisode(url)
            
            console.log("[S] Link found: " + result);
            await clearTabs()

            resolve(result)
        })
    }
}

async function scrapeEpisode(url) {
    return new Promise(async resolve => {
        //variable for the current bsto tab
        var bstoTab

        //removing old listeners (to prohibit dublicated events)
        const listeners = events.eventNames()

        listeners.forEach(listener => {
            events.removeAllListeners(listener)
        })

        events.on("newTab", async () => {
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

        //resolve the scrape on abort (errors usw.)
        events.on("abort", msg => {
            resolve("Scrape aborted: " + msg)
        })

        //update the current bstoTab
        events.on("bsto-tab", async tab => {
            bstoTab = tab

            //scrolling to bottom of page
            scrollBottom(bstoTab)

            //check if vivo is a host and select if yes
            const vivoAvailable = await useVivo(bstoTab)

            if (vivoAvailable) {
                //clicking the playButton
                console.log("[S] clicking play")

                try {
                    await bstoTab.click('[class="play"]')
                }
                catch {
                    console.log("[S] Popup Triggered");
                }
            }
            else {
                events.emit("abort", "noAvailable")
            }
        })    

        //opening site
        bstoTab = await newTab(url)
    })
}

async function useVivo(tab) {
    return new Promise(async resolve => {
        const isAvailable = tab.evaluate(() => {
            console.log("Validating vivo");
            const hosts = Array.from(document.getElementsByClassName("hoster-tabs top")[0].children)
            let result = false
            

            hosts.forEach(host => {
                if (host.innerHTML.includes("Vivo")) {
                    host.click()

                    result = true
                }
            })

            return result
        })

        resolve(isAvailable)
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
        await timer(2000)
        resolve(true)
    })
}