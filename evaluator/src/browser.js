const puppeteer = require('puppeteer')
const profileManager = require("./profileManager")
const session = {
    page: undefined,
}

module.exports = {
    init: async () => {
        return new Promise(async resolve => {
            await profileManager.init()

            browser = await puppeteer.launch({
                headless: true,
                defaultViewport: null,
                userDataDir: "./browserData/browserProfile",
                args: [
                    '--no-sandbox',
                ]
            });

            session.page = await browser.newPage()

            resolve()
        })
    },
    executeAt:async url => {
        return new Promise(async resolve => {
            await session.page.goto(url)

            resolve()
        })
    },
    getMovies: async conf => {
        return new Promise(async resolve => {
            const result = await requestMovies(conf)

            resolve(result)
        })
    }
}

function requestMovies(conf) {
    return new Promise(async resolve => {
        const html = await session.page.evaluate(async conf => {
            console.log(conf);

            const data = await fetch("https://streamkiste.tv/include/fetch.php", {
                "credentials": "include",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0",
                    "Accept": "*/*",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "X-Requested-With": "XMLHttpRequest"
                },
                "referrer": "https://streamkiste.tv/cat/filme",
                "body": `page=${conf.page}&type=${conf.type}&wq=${conf.wq}&wsq=&sq=&year=&sortby=`,
                "method": "POST",
                "mode": "cors"
            });

            const html = await data.text()
            console.log(html);

            return html 
        }, conf)

        resolve(html)
    })
}