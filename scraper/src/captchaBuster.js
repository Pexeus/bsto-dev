const { on } = require('events');
const eventsModule = require('events');
const { resolve } = require('path');
const wit = require("./wit")

const events = new eventsModule.EventEmitter();
const timer = ms => new Promise(res => setTimeout(res, ms))

var browser
var tab

module.exports = {
    initate: async config => {
        return new Promise(async resolve => {
            browser = config.browser

            browser.on("targetcreated", async () => {
                let newTab = await getCurrentTab()
                
                console.log("[B] new tab: " + newTab.url());
                tab = newTab
            })

            tab = await getCurrentTab()
            findCaptchas()

            resolve(events)
        })
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
        console.log("[C] Captcha Solution: " + solution);

        await insertSolution(frame, solution)
        const redo = await checkRedo(frame)

        if (redo) {
            events.emit("captcha-redo", frame)
        }
    }
})

events.on("captcha-redo", async frame => {
    const isBlocked = await checkBlindBlock(frame)

    if (!isBlocked) {
        //get audio source
        const audioSource = await getAudio(frame)

        //get challenge solution
        const solution = await getSolution(audioSource)
        console.log("[C] Captcha Solution: " + solution);

        await insertSolution(frame, solution)
        const redo = await checkRedo(frame)

        if (redo) {
            events.emit("captcha-redo", frame)
        }
    }
})

function getCurrentTab() {
    return new Promise(async resolve => {
        await timer(1500)

        const pages = await browser.pages()
        let tab

        //console.log("----------------------");

        for (let i = 0; i < pages.length && !tab; i++) {
            //console.log("URL: " + pages[i].url());

            const isHidden = await pages[i].evaluate(() => document.hidden)
            if (!isHidden) {
                tab = pages[i]
            }
        }

        //console.log("----------------------");

        resolve(tab)
    })
}

//continously search for captchas on the current bsto page
async function findCaptchas() {
    console.log("[B] Looking for Captchas...");
    let search = true

    while (search == true) {
        const frames = await tab.frames()

        for (frame of frames) {
            if (frame._url.includes("https://www.google.com/recaptcha/api2/bframe")) {
                let captchaReady = false

                try {
                    captchaReady = await tab.evaluate(() => {
                        const arrowElement = document.querySelector('.g-recaptcha-bubble-arrow');
                        
                        if (arrowElement != null) {
                            const captchaElement = arrowElement.parentElement
            
                            if (captchaElement.style.visibility == "visible") {
                                return true
                            }
                        }
            
                        return false
                    });
                }
                catch {
                    captchaReady = false
                }

                console.log("Captcha Status: " + captchaReady);

                if (captchaReady) {
                    console.log("[B] captcha Found!");
                    events.emit("captcha", frame)
                    search = false

                    break
                }
                
            }
        }

        await timer(500)
    }
}



//insert solution into textfield
async function insertSolution(frame, solution) {
    return new Promise(async (resolve) => {
        try {
            await frame.focus('#audio-response')
            await tab.keyboard.type(solution)

            await frame.click("#recaptcha-verify-button")

            resolve(true)
        }
        catch {
            console.log("inserting went wrong...");
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

//check if the solution was wrong
async function checkRedo(frame) {
    return new Promise(async resolve => {
        let result = false
        await timer(2000)

        const errorElement = await frame.$('.rc-audiochallenge-error-message')

        const isOpen = await tab.evaluate(() => {
            const arrowElement = document.querySelector('.g-recaptcha-bubble-arrow');

            if (arrowElement != null) {
                const captchaElement = arrowElement.parentElement

                if (captchaElement.style.visibility == "visible") {
                    return true
                }
            }

            return false
        });

        if (isOpen == true) {
            const inner = await errorElement.getProperty('innerHTML');
            const errorMessage = await inner.jsonValue();

            if (errorMessage == "Multiple correct solutions required - please solve more.") {
                console.log("[C] Multiple solutions required")

                result = true
            }
        }

        if (!result) {
            console.log("[C] Captcha solved!")
            findCaptchas()
        }
        
        resolve(result)
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

        let errorElement

        try {
            errorElement = await frame.$('.rc-doscaptcha-body-text')
        }
        catch {
            errorElement = null
        }

        if (errorElement != null && errorElement != undefined) {
            try {
                const inner = await errorElement.getProperty('innerHTML');
                const errorMessage = await inner.jsonValue();
                        
                if (errorMessage.includes("Your computer or network may be sending automated queries.")) {
                    console.log("[C] need new IP")
                    
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