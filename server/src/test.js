const knex = require("../db/connection")

const db = knex.getDB()

let info = require("./info")
let grab = require("./grabber")

const init = async () => {
    let meta = await grab.metaWeb("Welpenakademie")
    console.log(meta);
}

init()