const knex = require("../db/connection")
const db = knex.getDB()

module.exports = {
    userActivity: () => {
        return new Promise(async resolve => {
            var watchlist = await db("episodeswatched")
                .orderBy("ID", "DESC")
                .limit(100)

            watchlist = watchlist.reverse()

            const episodesRaw = await db("episodes")
            const episodes = {}

            episodesRaw.forEach(e => {
                episodes[e.ID] = e.title
            })

            const usersRaw = await db("users")
            const users = {}

            usersRaw.forEach(user => {
                users[user.ID] = user.name
            })

            const activities = []

            watchlist.forEach(episode => {
                const tDiff = Math.round((Date.now() - episode.TIMESTAMP) / 1000 / 60 / 60 / 24)

                const activity = {
                    user: users[episode.UID],
                    date: episode.TIMESTAMP,
                    relative: tDiff,
                    episode: episodes[episode.EID]
                }

                activities.push(activity)
            })

            resolve(activities)
        })
    }
}