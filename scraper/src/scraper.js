//imports
const puppeteer = require('puppeteer')
const remote = require("./remote")
const profileManager = require("./profileManager")

const eventsModule = require('events')
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
                events.emit("captcha-error", err)
            })

            remote.log("[S] browser initaited")
            resolve(true)
        })
    },
    //close browser
    close: async () => {
        return new Promise(async resolve => {
            await captchaBuster.exit()

            await browser.close()

            console.log("[S] browser closed");

            resolve(true)
        })
    },
    //scrape episode
    scrape: async url => {
        return new Promise(async resolve => {
            url = `${url}/Vivo`

            const timeout = setTimeout(() => {
                console.log("[S] Scrape timed out, aborting...");
                resolve("Scrape aborted: timeout")
            }, 60000);

            console.log("[S] Scraping: " + url)
            const result = await scrapeEpisode(url)
            
            console.log("[S] Link found: " + result);
            await clearTabs()

            let captchaDone = false

            while(captchaDone == false) {
                await timer(100)
                //console.log("waiting for captcha: " + captchaBuster.status().current);

                if (captchaBuster.status().current == "waiting") {
                    captchaDone = true
                }
            }

            console.log("[S] Clearing timeout");
            clearTimeout(timeout)
            resolve(result)
        })
    },
    testCaptcha: async () => {
        const captchaTab = await browser.newPage()
        captchaTab.goto("https://www.google.com/recaptcha/api2/demo")
    }
}

//get a tab by url
function getTab(url) {
    return new Promise(async resolve => {
        let tabs = await browser.pages()
                .catch(err => {
                    console.log("[S] cant get browser tabs");
                })

        for (const tab of tabs) {
            if (tab.url() == url) {
                resolve(tab)
            }
        }
    })
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
                .catch(err => {
                    console.log("[S] cant get browser tabs");
                })
                
            let newTab = tabs[tabs.length - 1]

            await newTab.waitForNavigation()
    
            let newTabName = await newTab.title()
                .catch(err => {
                    console.log(err);
                })
            
            //if bsto is reopening the episodes page, update the tab

            if (newTab.url().includes("https://bs.to/")) {
                events.emit("bsto-tab", newTab)
            }

            if (newTabName.includes("vıvo")) {
                console.log("[S] Vivo Tab dedected: " + newTabName);
                solved = true
                
                resolve(newTab.url())
            }

            if (newTab.url().includes("https://bs.to/") == false && newTab.url().includes("https://vivo.sx/") == false) {
                console.log("[S] Popup dedected");
                await newTab.close()

                const bstoTab = await getTab(url)
                events.emit("bsto-tab", bstoTab)
            }
        })

        //on broken captcha, reload page
        events.on("captcha-error", async err => {
            console.log("[S] Captcha error: " + err);
            if (err == "captcha-error") {
                console.log("[S] Reloading Page [Captcha error]");
                try {
                    await bstoTab.reload()
                }
                catch {
                    
                }

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
            const vivoAvailable = await checkAvailability(bstoTab)

            if (vivoAvailable) {
                //scrolling down
                scrollBottom(bstoTab)

                //clicking the playButton
                await timer(2000)
                console.log("[S] clicking play")

                await bstoTab.click('[class="play"]')
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
                    try {
                        await bstoTab.reload()
                    }
                    catch {
                        
                    }

                    await bstoTab.waitForNavigation();
                    events.emit("bsto-tab", bstoTab)
                }
                else {
                    console.log("[S] Cancelled reload: " + captchaBuster.status().current);
                }
            }
        }, 10000);
    })
}

async function checkAvailability(tab) {
    return new Promise(async resolve => {
        let isAvailable

        try {
            isAvailable = await tab.evaluate(() => {
                let available = false
                let playerExists = false

                const playerDeactivated = document.getElementsByClassName("hoster-player deactivated")[0]

                if (playerDeactivated == undefined) {
                    playerExists = true
                }

                if (playerExists == true) {
                    const hosts = Array.from(document.getElementsByClassName("hoster-tabs top")[0].children)

                    hosts.forEach(host => {
                        if (host.innerHTML.includes("hoster Vivo")) {
                            available = true
                        }
                    })
                }
    
                return available
            })
        }
        catch {
            console.log("[S] Cant check Vivo Status, defaulting to false");
            isAvailable = false
        }

        console.log("[S] Vivo Available: " + isAvailable);

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
            events.emit("abort", "invalidURL")
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