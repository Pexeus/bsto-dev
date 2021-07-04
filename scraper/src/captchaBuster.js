const eventsModule = require('events');
const wit = require("./wit")

const events = new eventsModule.EventEmitter();
const timer = ms => new Promise(res => setTimeout(res, ms))

var browser
var tab
var activated
var initiated = false

const status = {
    error: undefined,
    current: "initiating"
}

module.exports = {
    initiate: async config => {
        return new Promise(async resolve => {
            browser = config.browser

            tab = await getCurrentTab()
            
            activated = true

            browser.on("targetcreated", async () => {
                console.log("[B] New Tab");

                let newTab = await getCurrentTab()
                tab = newTab

                initStatus()
            })

            if (initiated == false) {
                findCaptchas()
            }

            resolve(events)
        })
    },
    status: () => {
        return status
    },
    exit: () => {
        return new Promise(async resolve => {
            activated = false

            await timer(3000)

            console.log("[B] Buster deactivated");
            resolve(true)
        })
    }
}

//continously search for captchas on the current bsto page
async function findCaptchas() {
    const bframeURL = "https://www.google.com/recaptcha/api2/bframe"
    initiated = true

    console.log("[B] Looking for Captchas...");
    var search = true

   setInterval(async () => {
    if (activated == true) {
        if (search == true && tab != undefined) {
            setStatus("scanning")
            //console.log("[B] checking tab status");
            const tabChanged = await checkTabStatus()

            if (tabChanged) {
                await initStatus()
            }

            //console.log("[B] getting frames");
            const frames = await getFrames()

            for (frame of frames) {
                if (frame._url.includes(bframeURL)) {
                    let captchaReady = false
                    
                    try {
                        captchaReady = await tab.evaluate(() => {
                            const bframeURL = "https://www.google.com/recaptcha/api2/bframe"
                            const frames = document.querySelectorAll("iframe")

                            let result = false

                            try {
                                frames.forEach(frame => {
                                    if (frame.src.includes(bframeURL)) {    
                                        const visibility = frame.parentElement.parentElement.style.visibility
        
                                        if (visibility == "visible") {
                                            result = true
                                        }
                                    }
                                })
                            }
                            catch {
                                result = false
                            }

                            return result
                        });
                    }
                    catch {
                        console.log("failed to evlauate in captcha searcher"); 
                        captchaReady = false
                    }

                    //console.log("[B] Captcha ready: " + captchaReady);

                    if (captchaReady) {
                        console.log("[B] captcha Found!");
                        events.emit("captcha", frame)
                        search = false
                    }
                }
            }
        }
        else {
            //if the buster is currently solving stuff, keep checking for the tab to change (reload, new url)
            //if the tab changes/captcha dissapears, go back to searching for captchas

            if (status.current == "solving" || status.current == "error") {
                //console.log("[B] Checking Tab Status")
                const tabChanged = await checkTabStatus()
                if (tabChanged == true) {
                    if (tabChanged) {
                        //console.log("[B] initiating tab status");
                        await initStatus()
                    }
                    search = true
                }
            }
            else {
                search = true
            }
        }
    }

    if (status.current != "solving") {
        setStatus("waiting")
    }
   }, 500);
}

//solve incoming captchas
events.on("captcha", async frame => {
    setStatus("solving")
    console.log("[B] Captcha dedected");

    const isWorking = await checkCaptcha(frame)

    if (isWorking) {
        await blindMode(frame)
        const isBlocked = await checkBlindBlock(frame)

        if (!isBlocked) {
            //get audio source
            const audioSource = await getAudio(frame)

            //get challenge solution
            const solution = await getSolution(audioSource)
            console.log("[B] Captcha Solution: " + solution);

            await insertSolution(frame, solution)
            const redo = await checkRedo(frame)

            if (redo) {
                events.emit("captcha-redo", frame)
            }
        }
    }
    else {
        console.log("[P] Broken Captcha");
        setStatus("error")

        events.emit("error", "captcha-error")
    }
})

events.on("captcha-redo", async frame => {
    const isBlocked = await checkBlindBlock(frame)

    if (!isBlocked) {
        //get audio source
        const audioSource = await getAudio(frame)

        //get challenge solution
        const solution = await getSolution(audioSource)
        console.log("[B] Captcha Solution: " + solution);

        await insertSolution(frame, solution)
        const redo = await checkRedo(frame)

        if (redo) {
            events.emit("captcha-redo", frame)
        }
    }
})

async function initStatus() {
    try {
        await tab.evaluate(() => {
            const statusPanel = document.createElement("div")
            statusPanel.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 200000000000000;
            color: rgba(0, 0, 0, 0.766);
            font-family: monospace;
            padding: 20px;
            box-shadow: 0px 0px 6px gray;
            border-radius: 3px;
            font-weight: bold;
            background-color: white;`
    
            const status = document.createElement("h2")
            status.id = "captcha_status"
    
            status.innerHTML = "initiating"
    
            statusPanel.appendChild(status)
            document.documentElement.appendChild(statusPanel)
        });
    }
    catch {
        //this is getting executed on old tabs
    }
}

async function setStatus(newStatus) {
    status.current = newStatus

    try {
        await tab.evaluate(newStatus => {    
            const statusElement = document.getElementById("captcha_status")
            if (statusElement != null) {
                statusElement.innerHTML = newStatus
            }
        }, newStatus);
    }
    catch {
        //this is getting executed on old tabs
    }
}

function getCurrentTab() {
    return new Promise(async resolve => {
        await timer(1500)

        const pages = await browser.pages()
        let tab

        //console.log("----------------------");

        for (let i = 0; i < pages.length && !tab; i++) {
            let isHidden

            try {
                isHidden = await pages[i].evaluate(() => document.hidden)
            }
            catch {
                isHidden = true
            }

            if (!isHidden) {
                tab = pages[i]
            }
        }

        //console.log("----------------------");
        resolve(tab)
    })
}

//get the current tabs frames
//in case of a reload or otherwise, prepare the tab
function getFrames() {
    return new Promise(async resolve => {
        let frames = []

        try {
            frames = await tab.frames()
        }
        catch {
            console.log("[B] Cant get Frames of Tab");
        }

        resolve(frames)
    })
}

function checkTabStatus() {
    return new Promise(async resolve => {
        let tabStatus = false

        try {
            tabStatus = await tab.evaluate(() => {
                let result = false

                const statusElement = document.getElementById("captcha_status")

                if (statusElement == null) {
                    result = true
                }

                return result
            })
        }
        catch {
            //console.log("[B] Cant check tab status");
        }

        //console.log("[B] Tab Status " + tabStatus);
        resolve(tabStatus)
    })
}



//insert solution into textfield
async function insertSolution(frame, solution) {
    return new Promise(async (resolve) => {
        try {
            await frame.focus('#audio-response')
            await tab.keyboard.type(String(solution))

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
    console.log("[B] Checking Redo...");
    return new Promise(async resolve => {
        await timer(3000)

        const errorMessages = ["please solve more", "Bitte weitere Aufgaben lösen"]

        let result = false
        let isOpen = true
        let errorMessage
        let errorElement

        try {
            await frame.$(".rc-audiochallenge-error-message")
        }
        catch {
            console.log("[B] Cannot call Captcha for redo check");
            isOpen = false
        }

        if (isOpen == true) {
            errorElement = await frame.$(".rc-audiochallenge-error-message")
            const prop = await errorElement.getProperty('innerHTML');
            errorMessage = await prop.jsonValue();
            
            errorMessages.forEach(msg => {
                if(errorMessage.includes(msg)) {
                    console.log(errorMessage.includes(msg));
                    result = true
                }
            })
        }
        
        if (false) {
            console.log("-----------------");
            console.log("errorElement Length", String(errorElement).length);
            console.log("isOpen:", isOpen);
            console.log("message:", errorMessage);
            console.log("result:", result);
            console.log("-----------------");
        }

        if (result == false) {
            setStatus("waiting")
            console.log("[B] Captcha solved!")
        }
        
        if (result == true) {
            console.log("[B] Multiple solutions required")
        }
        

        resolve(result)
    })
}

//extract audio source of captcha
async function getAudio(frame) {
    return new Promise(async (resolve) => {
        try {
            await frame.waitForSelector("#audio-source")
        }
        catch {
            resolve(false)
        }

        const audioElement = await frame.$('#audio-source')
        const srcAttribute = await audioElement.getProperty('src');
        const src = await srcAttribute.jsonValue();

        resolve(src)
    })
}

//check if the captcha is responding
function checkCaptcha(frame) {
    return new Promise(async (resolve) => {
        let isWorking = true
        console.log("[B] Checking if the captcha is responding...");
        await timer(1000)

        try {
            //await frame.waitForSelector("#recaptcha-help-button")
            await frame.click("#recaptcha-help-button")
        }
        catch {
            isWorking = false
        }

        console.log("Captcha Responding: " +  isWorking);
        resolve(isWorking)
    })
}

//toggle the captcha to blind mode
async function blindMode(frame) {
    return new Promise(async (resolve) => {

        try {
            await frame.waitForSelector("#recaptcha-audio-button")
            await frame.click("#recaptcha-audio-button")
        }
        catch(err) {
            console.log("[B] Failed to toggle to blind mode");
            console.log(err);
        }

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
                    console.log("[B] need new IP")
                    
                    setStatus("error")
                    events.emit("error", "ip")
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