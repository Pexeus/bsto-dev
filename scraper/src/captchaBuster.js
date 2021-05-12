const eventsModule = require('events');
const { resolve } = require('path');
const wit = require("./wit")

const events = new eventsModule.EventEmitter();
const timer = ms => new Promise(res => setTimeout(res, ms))

var browser

module.exports = {
    initate: async config => {
        browser = config.browser

        const currentTab = await getCurrentTab()
        findCaptchas(currentTab)

        return events
    }
}

//solve incoming captchas
events.on("captcha", async frame => {
    console.log("[C] Captcha dedected");

    await blindMode(frame)
    const isBlocked = await checkBlindBlock(frame)

    if (!isBlocked) {
        //get audio source
        const audioSource = await getAudio(frame)

        //get challenge solution
        const solution = await getSolution(audioSource)
        console.log("[S] Captcha Solution: " + solution);

        await insertSolution(bstoTab, frame, solution)
    }
})

function getCurrentTab() {
    return new Promise(async resolve => {
        const pages = await browser.pages()
        let tab
        for (let i = 0; i < pages.length && !tab; i++) {
            const isHidden = await pages[i].evaluate(() => document.hidden)
            if (!isHidden) {
                tab = pages[i]
            }
        }

        resolve(tab)
    })
}

//continously search for captchas on the current bsto page
async function findCaptchas(tab) {
    search = true

    console.log("[C] Buster initated, looking for Captchas...");

    while (search == true) {
        const frames = await tab.frames()
        captchaReady = false

        frames.forEach(async frame => {
            if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
                const button = await frame.$('#recaptcha-verify-button')

                try {
                    const inner = await button.getProperty('innerHTML');
                    const text = await inner.jsonValue();
                    
                    console.log("captcha ready: " + text);
                    captchaReady = true
                }
                catch {
                    console.log("captcha not ready");
                }

                if (captchaReady) {
                    const innerText = await tab.evaluate(() => {
                        console.log("checking for failed captcha...")
                        const player = document.getElementsByClassName("hoster-player")[0]
                        const title = player.childNodes[1]
                        
                        console.log(player);
                        console.log(title);
                        

                        return title.innerHTML
                    });

                    console.log(innerText);

                    search = false
                    events.emit("captcha", frame)
                }
            }
        })

        await timer(500)
    }
}

//insert solution into textfield
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

//get challenge solution based on download url
async function getSolution(src) {
    return new Promise(async (resolve) => {
        const solution = await wit.toText(src)

        if (solution.text != undefined && solution.text != "yes") {
            resolve(solution.text)
        }
        else {
            resolve(false)
        }
    })
}

//extract audio source of captcha
async function getAudio(frame) {
    return new Promise(async (resolve) => {
        await frame.waitForSelector("#audio-source")

        const audioElement = await frame.$('#audio-source')
        const srcAttribute = await audioElement.getProperty('src');
        const src = await srcAttribute.jsonValue();

        resolve(src)
    })
}

//toggle the captcha to blind mode
async function blindMode(frame) {
    return new Promise(async (resolve) => {
        await frame.waitForSelector("#recaptcha-audio-button")
        await frame.click("#recaptcha-audio-button")

        resolve(true)
    })
}

//check if blind mode is blocked
async function checkBlindBlock(frame) {
    return new Promise(async (resolve) => {
        await timer(500)

        const errorElement = await frame.$('.rc-doscaptcha-body-text')

        if (errorElement != null && errorElement != undefined) {
            try {
                const inner = await errorElement.getProperty('innerHTML');
                const errorMessage = await inner.jsonValue();
                        
                if (errorMessage.includes("Your computer or network may be sending automated queries.")) {
                    remote.log("[S] need new IP")
                    
                    events.emit("abort", "IP")
                    resolve(true)
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