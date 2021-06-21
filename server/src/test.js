const knex = require("../db/connection")

const db = knex.getDB()

let info = require("./info")
let grab = require("./grabber")

const init = async () => {
    await grab.compare()
}

init()