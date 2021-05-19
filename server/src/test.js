const knex = require("../db/connection")

const db = knex.getDB()

let info = require("./info")
let grab = require("./grabber")
let update = require("./update")

const init = async () => {
    /*x = await info.userActivity()
    
    x.forEach(activity => {
        console.log(`${activity.user} -> [${activity.relative} days ago] ${activity.episode}`);
    });*/

    let x = await grab.updateLocalMeta()

}

init()