var knex = require("knex")({
    client: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "sml12345",
        database: "bsto_dev"
    },
    pool: {
        min: 1,
        max: 20,
        propagateCreateError: false
    },
})

module.exports = {
    getDB() {
        return knex
    } 
}