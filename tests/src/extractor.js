const db = require("../db/connection").getDB()
const fs = require("fs")

async function extractEpisodes() {
    const out = []

    const episodes = await db("episodes")
        .catch(err => {
            console.log(err);
        })
        
    episodes.forEach(episode => {
        if (episode.vivo_link.includes("vivo.sx")) {
            out.push({
                href: episode.bs_link,
                title: episode.title,
                vivo: episode.vivo_link
            })
        }
    })

    fs.writeFile("./json/episodes.json", JSON.stringify(out), async err => {
        if (!err) {
            const check = fs.readFileSync("./json/episodes.json", "utf-8")
            const obj = JSON.parse(check)
            console.log(obj.length);
        }
        else {
            console.log(err);
        }
    })
    console.log(out.length);
}

module.exports = {
    extractEpisodes: () => {
        extractEpisodes()
    }
}