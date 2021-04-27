const axios = require("axios")
const HOST = "http://neoflix-dev.staging.it-tf.ch/"

let loggerReady = true

module.exports = {
    job: () => {
        return new Promise(async (resolve) => {
            console.log(HOST + "queue/job");

            axios.get(HOST + "queue/job").then(response => {
                resolve(response.data)
            }).catch(err => {
                console.log(err)
            })
        })
    },
    status: async function() {
        return new Promise(async (resolve) => {
            axios.post(HOST + "queue/status").then(response => {
                resolve(response.data)
            }).catch(err => {
                console.log(err)
            })
        })
    },
    dispatch: async function(data) {
        return new Promise(resolve => {
            axios.post(HOST + "show", data)
            .then(response => {
                resolve(response)
            })
        })
    },
    log: function(log) {
        console.log(log)

        if (loggerReady) {
            loggerReady = false
            axios.post(HOST + "logger/", {log: log})
            .then(response => {
                loggerReady = true

                if (response.data != "ok") {
                    console.log(response.data)
                }
            })
            .catch(err => {
                loggerReady = true
            })
        }

    }
}

async function debug() {
    axios.post(HOST + "status").then(response => {
        console.log(response.data)
    }).catch(err => {
        console.log(err.code)
    })
}