const puppeteer = require('puppeteer')
const fs = require("fs")

const wit = require("./wit")
const remote = require("./remote")

let browser
let scraper_error = ""
let timeout = 90

module.exports =  {
    episode: async function(url) {
        return new Promise( async (resolve) => {
            remote.log(`> starting timeout of ${timeout} seconds`);

            setTimeout(async () => {
                resolve("error: timedOut")
            }, timeout * 1000);

            const vivo = await initiate(url)
            resolve(vivo)
        })
    }
}

async function initiate(url) {
    return new Promise( async (resolve) => {
        browser = await puppeteer.launch({ 
            product: 'firefox',
            headless: false,
            defaultViewport: null,
            userDataDir: "./browserProfile",
            args: [
                '--no-sandbox'
            ]
        });


        const vivoURL = await scrapeEpisode(browser, url)

        browser.close()
        resolve(vivoURL)
    })
}

async function scrapeEpisode(browser, episode) {
    return new Promise(async resolve => {
        const episodePage = await browser.newPage()
        episodePage.goto(episode)

        let episodeTitle = false

        //waiting for page
        await episodePage.setDefaultNavigationTimeout(0); 
        await episodePage.waitForNavigation();
        episodeTitle = await episodePage.title()
        setTimeout(async () => {
            try {
                await episodePage.click('[class="play"]')
            }
            catch {
                resolve("error:notAvailable")
            }
        }, 800);

        browser.on("targetcreated", async () => {
            let tabs = await browser.pages()
            let newTab = tabs[tabs.length - 1]

            await newTab.waitForNavigation();
            let newTabName = await newTab.title()

            if (newTabName == episodeTitle) {
                remote.log("> scraping: " + episodeTitle.split(" - Burning Series")[0])
                
                const url = getURL(browser, newTab)
                resolve(url)
            }
        })
    })
}

async function getURL(browser, tab) {
    return new Promise(async resolve => {
        scrollBottom(tab)

        remote.log("checking availability...");
        const vivoValid = await checkVivoAvailability(tab)
        remote.log("availability: " + vivoValid)
        
        if (vivoValid != true) {
            resolve("error: noVivo")
        }
        else {
            await tab.waitForSelector(".play")
            await tab.click('[class="play"]')
            
            solveCaptcha(tab);

            browser.on("targetcreated", async () => {
                let tabs = await browser.pages()
                let newTab = tabs[tabs.length - 1]

                await newTab.waitForNavigation();
                let newTabName = await newTab.title()

                if (newTabName.includes("vıvo | ")) {
                    resolve(newTab.url())
                }
            })

            browser.on("targetdestroyed", async () => {
                resolve(scraper_error)
            })
        }
    })
}

async function checkVivoAvailability(tab) {
    return new Promise(async (resolve) => {
        await tab.waitForSelector(".bounce")

        const title = await tab.$('.bounce')
        const inner = await title.getProperty('innerHTML');
        const text = await inner.jsonValue();

        if (text.includes("vivo")) {
            resolve(true)
        }
        else {
            resolve(false)
        }
    })
}

async function solveCaptcha(tab) {
    const frames = await tab.frames();
    let executed = false

    frames.forEach(frame => {
        if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
            executed = true

            let captchaFrame = frame

            setTimeout(() => {
                toggleMode(captchaFrame)
                setTimeout(async () => {
                    const errorElement = await frame.$('.rc-doscaptcha-body-text')
                
                    if (errorElement != null) {
                        const inner = await errorElement.getProperty('innerHTML');
                        const errorMessage = await inner.jsonValue();
                                
                        if (errorMessage.includes("Your computer or network may be sending automated queries.")) {
                            remote.log("[!] need new IP")
                            scraper_error = "error: blockedIP"

                            await tab.close()
                        }
                    }
                    else {
                        remote.log("[ solving captcha ]")
                        tryToSolve(tab, captchaFrame, false)
                    }
                }, 1500);
            }, 1000);
        }
    });

    if (executed == false) {
        setTimeout(() => {
            solveCaptcha(tab)
            remote.log("> waiting for captcha...")
        }, 800);
    }

    async function tryToSolve(tab, frame, reload) {§
        let newChallengeTimeout = 500

        if (reload == true) {
            remote.log("> requesting new challenge...")
            await frame.click("#recaptcha-reload-button")

            newChallengeTimeout = 1000
        }

        setTimeout( async () => {
            try {
                const audioElement = await frame.$('#audio-source')
                const srcAttribute = await audioElement.getProperty('src');
                const src = await srcAttribute.jsonValue();
    
                const solution = await wit.toText(src)
                remote.log("> solution: " + solution.text)
    
                if (solution.text != undefined && solution.text != "yes") {
                    await frame.focus('#audio-response')
                    await tab.keyboard.type(solution.text)
    
                    setTimeout(async () => {
                        await frame.click("#recaptcha-verify-button")
                    }, 500);
                }
                else {
                    remote.log("> failed to convert to text")
                    setTimeout(() => {
                        tryToSolve(tab, frame, true)
                    }, 2000);
                }

                setTimeout(async () => {
                    try {
                        const errorElement = await frame.$('.rc-audiochallenge-error-message')
                
                        if (errorElement != null) {
                            const inner = await errorElement.getProperty('innerHTML');
                            const errorMessage = await inner.jsonValue();
                                
                            if (errorMessage == "Multiple correct solutions required - please solve more.") {
                                remote.log("[!] Multiple solutions required")
                                setTimeout(() => {
                                    remote.log("> retrying now")
                                    tryToSolve(tab, frame, false)
                                }, 3000);
                            }
                        }
                    }
                    catch {
                        
                    }
                }, 1000);
            }
            catch {
                
            }

        }, newChallengeTimeout);
    }

    async function toggleMode(frame) {
        await frame.click("#recaptcha-audio-button")
    }
}

async function scrollBottom(tab) {
    tab.evaluate(async () => {
        window.scrollTo(0,document.body.scrollHeight);
    })
}

async function maintainMode() {
    return new Promise( async (resolve) => {
        browser = await puppeteer.launch({ 
            product: 'firefox',
            headless: false,
            defaultViewport: null,
            userDataDir: "./browserProfile",
            args: [
                '--no-sandbox'
            ]
        });
    })
}