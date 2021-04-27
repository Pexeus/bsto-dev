const grabber = require("./src/grabber")
const queue = require("./src/queue")

const fs = require("fs")

async function updateQueue(cache) {
    console.log(cache);

    var shows

    if (cache == true) {
        shows = JSON.parse(fs.readFileSync("./json/shows.json"))
    }
    else {
        console.log("fetching shows...");
        shows = await grabber.showsWeb()
        fs.writeFileSync("./json/shows.json", JSON.stringify(shows))
    }
    
    for (show of shows) {
        const updateRequired = await grabber.compareShow(show)
        
        if (updateRequired) {
            queue.add({
                title: show.title,
                href: show.href,
                status: "queued",
                added: Date.now()
            })
        }
    }
}

updateQueue(false)
