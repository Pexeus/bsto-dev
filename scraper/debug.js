const scraper = require("./src/scraper")

async function init() {
    await scraper.init()

    let vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/2-Bart-wird-ein-Genie/en#46kg7kpjq")
    console.log(vivo);

    vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/2-Bart-wird-ein-Genie/en#46kg7kpjq")
    console.log(vivo);

    vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/2-Bart-wird-ein-Genie/en#46kg7kpjq")
    console.log(vivo);

    vivo = await scraper.scrape("https://bs.to/serie/Die-Simpsons/1/2-Bart-wird-ein-Genie/en#46kg7kpjq")
    console.log(vivo);
}

init()