const fs = require("fs")

const updater = require("./src/updater")
const grabber = require("./src/grabber")
const info = require("./src/info")

async function userActivity() {
    const activities = await info.userActivity()
    let i = 0
    activities.forEach(activity => {
        const uInfo = `${activity.user}: ${activity.episode} [${activity.relative} Ago]`
        console.log(uInfo);
        i++
    })

    console.log(i);
}

async function testShowUpdater() {
    const show = JSON.parse(fs.readFileSync("./show.json"))
    const scatteredShow = scatterShow(JSON.parse(fs.readFileSync("./show.json")))

    //const metadata = await grabber.metaWeb(show.title)
    
    await updater.delete("Auf Achse")

    const result = await updater.show(scatteredShow)
    console.log(result);

    console.log("Scattered Show Inserted");

    const metadata = await grabber.metaWeb(show.title)
    console.log(metadata);

    const statusEpisodes = await updater.show(show)
    const statusMetadata = await updater.showMeta(statusEpisodes.showID, metadata)


    console.log(statusEpisodes, statusMetadata);
}

async function metaTester() {
    const data = await grabber.metaWeb("Nakanohito Genome [ Jikkyouchuu ] | The Ones Within")
    const statusMetadata = await updater.showMeta(5413, data)

    console.log(statusMetadata);
}

function isDoubleByte(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt( i ) > 255) { return true; }
    }
    return false;
}

function cleanText(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt( i ) > 255) {
            str = str.replace(str[i], "_")
        }
    }

    return str
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

async function deleteShow(title) {
    await updater.delete(title)
    console.log("show deleted");
}

async function testChecker() {
    const localEpisodes = await grabber.episdesLocal("Endlings")
}

testChecker()
