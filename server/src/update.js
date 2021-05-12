const knex = require("../db/connection")

const db = knex.getDB()

async function updateShow(insert) {

    const current = {}

    current.show = await db("shows")
        .where({title: insert.title})
        .first()

    current.seasons = await db("seasons")
        .where({ID_show: current.show.ID})

    current.episodes = await db("episodes")
        .where({ID_show: current.show.ID})


    console.log(current);
}

module.exports = {
    meta(showID, newData){
        return new Promise(async resolve => {
            let update = await db("metadata").where({SID:showID}).update({
                desc: newData.desc,
                genres: newData.genres,
                fromYear: newData.fromYear,
                toYear: newData.toYear,
                actors: newData.actors,
                producers: newData.producers,
                directors: newData.directors,
                authors: newData.authors,
                cover: newData.cover
            })
    
            if(update) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    }
} 

/*updateShow({
    title: "Mr. Robot"
})*/