const fs = require("fs")

const updater = require("./src/updater")
const grabber = require("./src/grabber") 

async function testShowUpdater() {
    const show = JSON.parse(fs.readFileSync("./show.json"))
    const scatteredShow = scatterShow(JSON.parse(fs.readFileSync("./show.json")))

    //const metadata = await grabber.metaWeb(show.title)
    
    await updater.delete("Auf Achse")

    const result = await updater.show(scatteredShow)
    console.log(result);

    console.log("Scattered Show Inserted");

    const final = await updater.show(show)
    console.log(final);
}

function scatterShow(show) {
    show.seasons.pop()

    show.seasons.forEach(season => {
        season.episodes.pop()
        season.episodes.forEach(episode => {
            const rand = Math.random()
            
            if (rand > 0.8) {
                episode.vivo = "8==============D"
            }

        })
    })

    return show
}

testShowUpdater()