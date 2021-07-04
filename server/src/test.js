const knex = require("../db/connection")

const db = knex.getDB()

let info = require("./info")
let grab = require("./grabber")

const init = async () => {
    let meta = await grab.metaWeb("Power Rangers R.P.M.")
    console.log(meta);
}

init()