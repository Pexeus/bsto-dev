const axios = require("axios")
const HOST = "http://bstodb.staging.it-tf.ch/"

let loggerReady = true

module.exports = {
    status: async function() {
        return new Promise(async (resolve) => {
            axios.post(HOST + "status").then(response => {
                resolve(response.data)
            }).catch(err => {
                console.log(err)
            })
        })
    },
    dispatch: async function(data) {

        console.log("dispathing now:");
        console.log(data);

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