const { exec } = require("child_process");

async function changeVPN() {
    return new Promise(resolve => {
        exec("sudo protonvpn connect -f", (err, stdout, stderr) => {
            if (err) {
                console.log(err)
            }
            if (stderr) {
                console.log(stderr)
            }
            console.log(stdout)

            if (!stderr && !err) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    })
}

async function disconnectVPN() {
    return new Promise(resolve => {
        exec("sudo protonvpn disconnect", (err, stdout, stderr) => {
            if (err) {
                console.log(err)
            }
            if (stderr) {
                console.log(stderr)
            }
            console.log(stdout)

            if (!stderr && !err) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        })
    })
}

module.exports ={
    reconnect: async function() {
        return new Promise(async resolve => {
            result = await changeVPN()
            resolve(result)
        })
    },
    disconnect: async function() {
        return new Promise(async resolve => {
            result = await disconnectVPN()
            resolve(result)
        })
    }
}