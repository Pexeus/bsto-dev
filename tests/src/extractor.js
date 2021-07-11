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

    fs.writeFileSync("./json/episodes.json", JSON.stringify(out))
    console.log(out.length);
}

module.exports = {
    extractEpisodes: () => {
        extractEpisodes()
    }
}