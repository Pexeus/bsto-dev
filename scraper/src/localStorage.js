const fs = require("fs")
const dataFile = "./localStorage.JSON"

module.exports = {
    get: function(href) {
        if (href != undefined) {
            return getEpisode(href)
        }
        else {
            return getData()
        }
    },
    save: function(episode) {
        append(episode)
    },
    reset: function() {
        resetStorage()
    }
}

function getEpisode(href) {
    const episodes = getData().episodes
    let hit = false

    episodes.forEach(episode => {
        if (episode.href == href) {
            hit = episode
        }
    })

    return hit
}

function append(episode) {
    const db = getData()
    db.episodes.push(episode)

    saveData(db)
}

function resetStorage() {
    const defaultDB = {
        episodes: []
    }

    saveData(defaultDB)
}

function getData() {
    return JSON.parse(fs.readFileSync(dataFile))
}

function saveData(obj) {
    const string = JSON.stringify(obj)
    fs.writeFileSync(dataFile, string)
}