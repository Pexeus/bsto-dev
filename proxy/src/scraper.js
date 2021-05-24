const puppeteer = require('puppeteer')
const session = {}

module.exports = {
    init: async () => {
        return new Promise(async resolve => {
            session.browser = await puppeteer.launch({
                headless: true,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                ]
            })
            .catch(err => {
                console.log(err);
            })

            console.log("Scraper initiated");

            session.page = await session.browser.newPage()

            resolve()
        })
    },
    getSource: async code => {
        return new Promise(async resolve => {
            console.log("getting source");
            await session.page.goto(`https://vivo.sx/${code}`)

            const source = await session.page.evaluate(() => {
                const source = document.querySelector(".plyr__video-wrapper").children[0].children[0].src
                console.log(source);

                return source
            })
            .catch(err => {
                console.log(err);
            })

            resolve(source)
        })
    },
    close: async () => {
        return new Promise(async resolve => {
            if (session.browser =! undefined) {
                await session.browser.close()
            }

            console.log("Scraper Closed");
            resolve(true)
        })
    }
}