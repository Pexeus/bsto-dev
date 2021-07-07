const fs = require("fs")

const grabber = require("./src/grabber")
const queue = require("./src/queue")

async function updateQueue(cache) {
    return new Promise(async resolve => {
        var shows
        let i = 0

        if (cache == true) {
            shows = JSON.parse(fs.readFileSync("./json/shows.json"))
        }
        else {
            console.log("fetching shows...");
            shows = await grabber.showsWeb()
            fs.writeFileSync("./json/shows.json", JSON.stringify(shows))
        }
        
        for (show of shows) {
            const updateInfo = await grabber.compareShow(show)
            const updateRequired = updateInfo.status

            console.log(`${i} / ${shows.length}`);
            i++
            
            if (!updateRequired) {  
                queue.add({
                    title: show.title,
                    href: show.href,
                    status: "queued",
                    added: Date.now()
                })
            }
        }

        console.log(shows.length);
        resolve(true)
    })
}

async function init(useCache) {
    while (true) {
        console.log("Starting Continuous updating of queue");
        await updateQueue(useCache)
    }
}

init(false)
