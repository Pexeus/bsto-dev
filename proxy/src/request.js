const axios = require("axios")

module.exports = {
    check: async url => {
        return new Promise(async resolve => {
            let status
    
            await axios.get(url)
                .catch(err => {
                    status = err.response.status
                })
                .then(data => {
                    if (data) {
                        status = data.status
                    }
                })
    
            if (String(status).includes("20")) {
                resolve(true)
            }
            
            resolve(false)
        })
    }
}