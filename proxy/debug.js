const axios = require("axios")
var http = require('https');
const { resolve } = require("path");



async function init() {
    const validURL = "https://node--liana.vivo.sx/vod/zH1E0oW7pqHEiQXRHM3pjw/1621946468/0004076560"
    const invalid = "https://node--liana.vivo.sx/vod/AdEMDpUciUJ45M1MaKJMdA/1621826608/0004076560"

    const status = await req(invalid)
    console.log(status);
}

async function req(url) {
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

init()