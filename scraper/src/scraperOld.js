//bilder de/aktivieren: https://support.mozilla.org/en-US/questions/1226175

const puppeteer = require('puppeteer')

const wit = require("./wit")
const remote = require("./remote")
const profileManager = require("./profileManager")

const timer = ms => new Promise(res => setTimeout(res, ms))

let browser
SOLVED = false

module.exports = {
    init: async function() {
        return new Promise( async (resolve) => {
            await profileManager.init()
            await profileManager.clear()

            browser = await puppeteer.launch({ 
                product: 'firefox',
                headless: false,
                defaultViewport: null,
                //userDataDir: "./browserData/browserProfile",
                args: [
                    '--no-sandbox',
                    "--DISPLAY=0"
                ]
            });

            remote.log("[i] scraper initaited")
            resolve(true)
        })
    },
    reboot: async function() {
        return new Promise(async resolve => {
            await browser.close()
            await profileManager.clear()

            browser = await puppeteer.launch({ 
                product: 'firefox',
                headless: false,
                defaultViewport: null,
                userDataDir:  "./browserData/browserProfile",
                args: [
                    '--no-sandbox'
                ]
            });

            await timer(2000)

            remote.log("[i] scraper rebooted")
            resolve(true)
        })
    },
    scrape: async function(url) {
        return new Promise( async (resolve) => {
            setTimeout(() => {
                resolve("error: timeout")
            }, 60000);

            remote.log("new Job: " + url);
            const result = await scrapeEpisode(url)

            resolve(result)
        })
    }
}

async function scrapeEpisode(url) {
    return new Promise(async (resolve) => {

        SOLVED = false

        //erste seite öffnen die das popup triggert und titel abrufen
        const popupPage = await openPopupPage(url)
        if (popupPage == false) {
            resolve("error: failied to initialize")
        }
        else {
            //await popupPage.waitForNavigation()

            remote.log("getting title...");
            episodeTitle = await popupPage.title()

            //prüfen ob die episode vorhanden ist
            remote.log("checking availability...");
            const isAvailable = await checkVivoAvailability(popupPage)
            if (isAvailable == false) {
                await clearTabs()
                resolve("error:notAvailable")

            }
            else {
                //popup triggern und richtige seite finden
                const adsSkipped = await skipAds(popupPage, episodeTitle)

                const episodePage = adsSkipped.page
                const popup = adsSkipped.popup

                if (episodePage == "error:notAvailable") {
                    await clearTabs()
                    resolve("error:notAvailable")
                }

                const vivoLink = await getVivo(episodePage, popup)

                await clearTabs()

                resolve(vivoLink);
            }
        }
    })
}

async function getVivo(tab, popup) {
    let ERROR = false

    return new Promise(async (resolve) => {
        browser.on("targetcreated", async () => {
            let tabs = await browser.pages()
            let newTab = tabs[tabs.length - 1]

            await newTab.waitForNavigation()
            let newTabName = await newTab.title()

            if (newTabName.includes("vıvo | ")) {
                console.log("SOLUTION FOUND: " + newTabName);

                SOLVED = true
                resolve(newTab.url())
            }
        })

        //play button triggern
        if (popup == true) {
            await triggerPlayButton(tab)
        }

        //captcha frame abrufen
        const frame = await findCaptcha(tab)

        console.log("starting captcha solving in 5 seconds...");
        await timer(5000)
        
        if (SOLVED == false) {
            await toggleMode(frame)
            await timer(500)

            while (SOLVED == false && ERROR == false) {
                console.log(`Solved: ${SOLVED} Error: ${ERROR}`);

                const errorCheck = await checkIPBlock(frame)
                remote.log("IPCheck: " + errorCheck);

                if(errorCheck != false) {
                    resolve(errorCheck)
                    ERROR = true
                }
                else {
                    const redoCheck = await checkRedo(frame)
                    const convertCheck = await tryToSolve(tab, frame, requestNew)

                    remote.log("multiple solutions required: " + redoCheck);
                    remote.log("convertig successful: " + convertCheck);

                    if (convertCheck == false || redoCheck == true) {
                        requestNew(frame)
                    }
                }
            }
        }
    })

    async function tryToSolve(tab, frame) {
        return new Promise(async resolve => {
            const audioSource = await getAudio(frame)
            
            const solution = await getSolution(audioSource)
            if (solution == false) {
                resolve(false)
            }
            else {
                await insertSolution(tab, frame, solution)

                setTimeout(() => {
                    if (SOLVED == false) {
                        resolve(true)
                    }
                }, 800);
            }
        })
    }

    async function checkRedo(frame) {
        return new Promise(async resolve => {
            let result = false

            const errorElement = await frame.$('.rc-audiochallenge-error-message')

            if (errorElement != null) {
                const inner = await errorElement.getProperty('innerHTML');
                const errorMessage = await inner.jsonValue();

                if (errorMessage == "Multiple correct solutions required - please solve more.") {
                    remote.log("[!] Multiple solutions required")

                    result = true
                }
            }
            
            resolve(result)
        })
    }

    async function insertSolution(tab, frame, solution) {
        return new Promise(async (resolve) => {
            try {
                await frame.focus('#audio-response')
                await tab.keyboard.type(solution)

                await frame.click("#recaptcha-verify-button")

                resolve(true)
            }
            catch {
                remote.log("inserting went wrong...");
            }
        })
    }

    async function getSolution(src) {
        return new Promise(async (resolve) => {
            const solution = await wit.toText(src)
            remote.log("captcha Solution: " + solution.text)

            if (solution.text != undefined && solution.text != "yes") {
                resolve(solution.text)
            }
            else {
                resolve(false)
            }
        })
    }

    async function getAudio(frame) {
        return new Promise(async (resolve) => {
            await frame.waitForSelector("#audio-source")

            const audioElement = await frame.$('#audio-source')
            const srcAttribute = await audioElement.getProperty('src');
            const src = await srcAttribute.jsonValue();

            resolve(src)
        })
    }

    async function requestNew(frame) {
        return new Promise(async (resolve) => {
            remote.log("requesting new challenge...");

            await frame.click("#recaptcha-reload-button")

            await timer(500)

            resolve(true)
        })
    }

    async function toggleMode(frame) {
        return new Promise(async (resolve) => {
            await frame.waitForSelector("#recaptcha-audio-button")
            await frame.click("#recaptcha-audio-button")

            resolve(true)
        })
    }

    async function checkIPBlock(frame) {
        return new Promise(async (resolve) => {
            await timer(500)

            const errorElement = await frame.$('.rc-doscaptcha-body-text')

            if (errorElement != null && errorElement != undefined) {
                try {
                    const inner = await errorElement.getProperty('innerHTML');
                    const errorMessage = await inner.jsonValue();
                            
                    if (errorMessage.includes("Your computer or network may be sending automated queries.")) {
                        remote.log("[!] need new IP")
                        resolve("error: blockedIP")
                    }
                }
                catch {
                    //aus irgeneinem grund meint er das es nicht undefined ist, shitfix
                }
            }
            else {
                resolve(false)
            }
        })
    }
}

async function clearTabs() {
    return new Promise(async resolve => {
        let tabs = await browser.pages()

        tabs.forEach(async (tab) => {
            if (tab.url().includes("https://")) {
                tab.close()
            }
        })

        remote.log("[i] scraper idle")
        await timer(500)
        resolve(true)
    })
}

async function triggerPlayButton(tab) {
    remote.log("triggering playbutton...");

    return new Promise(async (resolve) => {
        await tab.click('[class="play"]')
        let loop = true

        console.log("SOLVED: " + SOLVED);

        while(loop == true && SOLVED == false) {
            const frames = await tab.frames()
            remote.log("waiting for captcha...");
            
            frames.forEach(async frame => {
                if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
                    console.log("Captcha dedected!");
                    let captchaReady = false

                    const button = await frame.$('#recaptcha-verify-button')
                    try {
                        const inner = await button.getProperty('innerHTML');
                        const text = await inner.jsonValue();
                        
                        console.log("captcha ready!");
                        captchaReady = true
                        loop = false
                    }
                    catch {
                        console.log("captcha not ready");
                    }

                    if (captchaReady == true) {
                        resolve(frame)
                    }
                }
            });

            await timer(500)
        }
    })
}

async function findCaptcha(tab) {
    remote.log("locating captcha...");

    return new Promise(async (resolve) => {
        const frames = await tab.frames()

        frames.forEach(frame => {
            if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
                let captchaFrame = frame

                resolve(captchaFrame)
            }
        });

        resolve(false)
    })
}

async function openPopupPage(url) {
    return new Promise(async (resolve) => {
        const popupPage = await browser.newPage()
        popupPage.goto(url)

        await popupPage.setDefaultNavigationTimeout(0); 
        
        try {
            await popupPage.waitForNavigation();
            resolve(popupPage)
        }
        catch {
            remote.log("failed to initialize scrape");
            resolve(false)
        }
    })
}

async function skipAds(tab, title) {
    return new Promise(async (resolve) => {
        let loop = true


        browser.on("targetcreated", async () => {
            let tabs = await browser.pages()
            let newTab = tabs[tabs.length - 1]

            await newTab.waitForNavigation()
            let newTabName = await newTab.title()

            if (newTabName == title) {
                console.log("[i] First Page triggered PopUp");

                loop = false
                resolve({page: newTab, popup: true})
            }
        })

        try {
            await tab.click('[class="play"]')

            while(loop == true) {
                const frames = await tab.frames()
                remote.log("waiting for captcha on first try (ad page)...");

                frames.forEach(async frame => {
                    if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
                        console.log("Captcha dedected!");
                        let captchaReady = false
    
                        const button = await frame.$('#recaptcha-verify-button')
                        try {
                            const inner = await button.getProperty('innerHTML');
                            const text = await inner.jsonValue();
                            
                            console.log("captcha ready!");
                            captchaReady = true
                            loop = false
                        }
                        catch {
                            console.log("captcha not ready");
                        }
    
                        if (captchaReady == true) {
                            resolve({page: tab, popup: false})
                        }
                    }
                });

                await timer(500)
            }
        }
        catch {
            resolve("error:notAvailable")
        }
    })
}

async function checkVivoAvailability(tab) {
    return new Promise(async (resolve) => {
        const title = await tab.$('.bounce')

        if (title == null) {
            resolve(false)
        }
        else {
            const inner = await title.getProperty('innerHTML');
            const text = await inner.jsonValue();

            if (text.includes("Vivo")) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        }
    })
}