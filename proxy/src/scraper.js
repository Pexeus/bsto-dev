const puppeteer = require('puppeteer')

const session = {}

module.exports = {
    init: async () => {
        return new Promise(async resolve => {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                ]
            })
            .catch(err => {
                console.log(err);
            })

            session.page = await browser.newPage()

            resolve()
        })
    },
    getSource: async code => {
        await session.page.goto(`https://vivo.sx/${code}`)

        const source = await session.page.evaluate(() => {
            const source = document.querySelector(".plyr__video-wrapper").children[0].children[0].src
            console.log(source);

            return source
        })
        .catch(err => {
            console.log(err);
        })

        return source
    }
}