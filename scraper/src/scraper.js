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

            buster = await captchaBuster.initiate({
                browser: browser
            })

            buster.on("error", err => {
                console.log("Captcha error emitted");
                events.emit("captcha-error", err)
            })

            remote.log("[S] browser initaited")
            resolve(true)
        })
    },
    //close browser
    close: async () => {
        return new Promise(async resolve => {
            await browser.close()
            await captchaBuster.exit()

            console.log("[S] browser closed");

            resolve(true)
        })
    },
    //scrape episode
    scrape: async url => {
        return new Promise(async resolve => {
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
        var solved = false
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
                solved = true
                
                resolve(newTab.url())
            }
        })

        //on broken captcha, reload page
        events.on("captcha-error", async err => {
            console.log("[S] Captcha error: " + err);
            if (err == "captcha-error") {
                console.log("[S] Reloading Page");
                await bstoTab.evaluate(() => {
                    location.reload()
                })

                await bstoTab.waitForNavigation();
                events.emit("bsto-tab", bstoTab)
            }

            if (err == "ip") {
                events.emit("abort", err)
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
            
            await tab.waitForNavigation();

            if (vivoAvailable) {
                //clicking the playButton
                console.log("[S] clicking play")

                scrollBottom(bstoTab)

                try {
                    await bstoTab.click('[class="play"]')
                }
                catch {
                    console.log("[S] Cannot press play");
                }
            }
            else {
                events.emit("abort", "notAvailable")
            }
        })    

        //opening site
        bstoTab = await newTab(url)
        setInterval(async () => {
            if (solved == false) {
                if (captchaBuster.status().current != "solving") {
                    console.log("[S] Reloading page");
                    await bstoTab.evaluate(() => {
                        location.reload()
                    })

                    await bstoTab.waitForNavigation();
                    events.emit("bsto-tab", bstoTab)
                }
            }
        }, 15000);
    })
}

async function useVivo(tab) {
    return new Promise(async resolve => {
        const isAvailable = tab.evaluate(() => {
            console.log("[S] Validating vivo");
            const hosts = Array.from(document.getElementsByClassName("hoster-tabs top")[0].children)
            let result = false
            

            hosts.forEach(host => {
                if (host.innerHTML.includes("Vivo")) {
                    const href = host.children[0]

                    href.click()

                    result = true
                }
            })

            return result
        })

        console.log("[S] Vivo Available: true");

        resolve(isAvailable)
    })
}

//scroll to bottom of page
async function scrollBottom(tab) {
    try {
        tab.evaluate(async () => {
            window.scrollTo(0,document.body.scrollHeight);
        })
    }
    catch {
        console.log("[B] cannot scroll to bottom");
    }
}

//create a new tab
async function newTab(url) {
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