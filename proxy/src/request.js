const axios = require("axios")

module.exports = {
    check: async url => {
        return new Promise(resolve => {
            http.get(url, function(res) {
                res.setEncoding();
        
                res.on('data', function(chunk) {
                    if (chunk.includes("403") == false) {
                        resolve(true)
                    }
                    
                    res.destroy();
                    resolve(false)
                });
        
                res.on("err", err => {
                    console.log(err);
                    resolve(false)
                })
            });
        })
    }
}