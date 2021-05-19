const knex = require("../db/connection")

const db = knex.getDB()

//get the id of a show by title
//returns false if there is now show registered
function getShowID(title) {
    return new Promise(async resolve => {
        const isRegistered = await db("shows")
            .where({title: title})
            .first()

        if (isRegistered != undefined) {
            resolve(isRegistered.ID)
        }

        resolve(false)
    })
}

//insert a newly registered show
function registerShow(insert) {
    return new Promise(async resolve => {
        console.log("Registring new show: " + insert.title);

        await db("shows").insert({title: insert.title})
            .catch(err => {
                console.log(err);
            })
        
        const showID = await getShowID(insert.title)
        resolve(showID)
    })
}

function updateSeasons(showID, newSeasons) {
    return new Promise(async resolve => {
        const currentSeasons = await db("seasons")
            .where({ID_show: showID})
            .catch(err => {
                console.log(err);
            })

        //represents the index of the most current season that is already in the DB
        let lastSavedSeason = 0

        for (season of currentSeasons) {
            //updating current season
            console.log("Updating Season " + (lastSavedSeason + 1));
            await updateSeason(season, newSeasons[lastSavedSeason].episodes)
            
            //updating season index
            lastSavedSeason = lastSavedSeason + 1
        }

        console.log("Currently Saved Seasons:" + lastSavedSeason);
        console.log("Fetched Seasons: " + newSeasons.length)

        for(i = lastSavedSeason; i < newSeasons.length; i++) {
            const newSeason = newSeasons[i]
            await insertSeason(showID, newSeason)

        }

        resolve(true)
    })
}

function updateSeason(season, newEpisodes) {
    return new Promise(async resolve => {
        const seasonEpisodes = await db("episodes")
            .where({
                ID_show: season.ID_show,
                ID_season: season.ID_season
            })
            .catch(err => {
                console.log(err);
            })

        //represents the index of the most current episode that is already in the DB
        let episodeIndex = 0

        for (const episode of seasonEpisodes) {
            const newEpisode = newEpisodes[episodeIndex]

            if (newEpisode.vivo != episode.vivo_link) {
                if (episode.title == newEpisode.title) {
                    console.log("updating episode " + episode.title);

                    await db("episodes")
                        .where({
                            ID: episode.ID
                        })
                        .update({
                            title: newEpisode.title,
                            bs_link: newEpisode.href,
                            vivo_link: newEpisode.vivo
                        })
                        .catch(err => {
                            console.log(err);
                        })

                    const check = await db("episodes")
                        .where({
                            ID: episode.ID
                        })

                }
                else {
                    console.log("Possible Data corruption:");
                    console.log(episode);
                }
            }

            //marking episode as updated
            newEpisodes[episodeIndex].updated = true

            //updating index
            episodeIndex++                         
        }

        for (const episode of newEpisodes) {
            if (!episode.updated) {
                console.log(`Adding Episode ${episode.title} to Season ${season.ID_season}`);

                await db("episodes")
                    .insert({
                        ID_show: season.ID_show,
                        ID_season: season.ID_season,
                        title: episode.title,
                        bs_link: episode.href,
                        vivo_link: episode.vivo
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        }

        resolve(true)
    })
}



function insertSeason(showID, newSeason) {
    return new Promise(async resolve => {
        const currentSeasons = await db("seasons")
            .where({ID_show: showID})
            .catch(err => {
                console.log(err)
            })

        const seasonID = currentSeasons.length + 1
        
        console.log(`Adding Season ${seasonID} to ${showID}`);
        await db("seasons").insert({ID_season: seasonID, ID_show: showID})
            .catch(err => {
                console.log(err)
            })
        
        for(episode of newSeason.episodes) {
            console.log(`Adding episode ${episode.title} to Season ${seasonID}`);
            await db("episodes")
                .insert({
                    ID_show: showID,
                    ID_season: seasonID,
                    title: episode.title,
                    bs_link: episode.href,
                    vivo_link: episode.vivo
                })
                .catch(err => {
                    console.log(err)
                })
        }

        resolve(true)
    })
}

function removeShow(title) {
    return new Promise(async resolve => {
        showID = await getShowID(title)

        if (!showID) {
            resolve({
                status: false,
                error: "show not registered: " + title
            })
        }
        else {
            console.log("removing from episodes...");
            const deletedEpisodes = await db("episodes")
                .where({ID_show: showID})
                .del()
                .catch(err => {
                    console.log(err);
                })

            console.log(deletedEpisodes + " episodes deleted");

            console.log("removing from seasons...");
            const deletedSeasons = await db("seasons")
                .where({ID_show: showID})
                .del()
                .catch(err => {
                    console.log(err);
                })

            console.log(deletedSeasons + " seasons deleted");

            console.log("unregistring " + title + "...");
            await db("shows")
                .where({title: title})
                .del()
                .catch(err => {
                    console.log(err);
                })
            
            console.log(`Deleted Show ${title}`);

            resolve({
                status: true
            })
        }
    })
}

function checkShow(id) {
    return new Promise(async resolve => {
        const seasons = await db("seasons")
            .where({ID_show: showID})
            .catch(err => {
                console.log(err)
            })

        console.log(seasons);
    })
}

module.exports = {
    delete: title => {
        return new Promise(async resolve => {
            const status = await removeShow(title)

            resolve(status)
        })
    },
    show: async newData => {
        return new Promise(async resolve => {
            let showID

            showID = await getShowID(newData.title)

            if (!showID) {
                showID = await registerShow(newData)
            }

            let seasonStatus

            try {
                seasonStatus = await updateSeasons(showID, newData.seasons)
            }
            catch {
                seasonStatus = false
            }

            console.log(seasonStatus);

            //resolve({
            //    showID: showID,
            //    status: seasonStatus
            //})
        })
    },
    showMeta(showID, newData) {
        return new Promise(async resolve => {
            const update = await db("metadata").where({SID:showID}).update({
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
            .catch(err => {
                console.log(err);
            })

            if (!update) {
                console.log(`creating new metadata entry [${showID}]`);

                const insert = await db("metadata").insert({
                    SID:showID,
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
                .catch(err => {
                    console.log(err);
                })
            }

            const metaCheck = await db("metadata").where({SID:showID})

            resolve({
                status: true,
                data: metaCheck
            })
        })
    }
}