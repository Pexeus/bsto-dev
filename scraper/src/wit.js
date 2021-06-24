const WitSpeech = require('node-witai-speech')
const fs = require("fs")
const http = require('http');

const remote = require("./remote")

module.exports = {
    toText: async function(url) {
        return new Promise (async (resolve) => {
            await getAudio(url)

            const data = await parseSpeech("payload.mp3")
            resolve(data)
        })
    },
    FileToText: async function(file) {
        return new Promise (async (resolve) => {
            let data 
            try {
                data = await parseSpeech(file)
            }
            catch {
                console.log("[wit] parsing failed");
                data = false
            }
            resolve(data)
        })
    } 
}

async function getAudio(url) {
    return new Promise (resolve => {
        const target = url.replace("https", "http")

        const file = fs.createWriteStream("payload.mp3");

        if (fs.existsSync(file)) {
            fs.unlink(file)
        }

        const request = http.get(target, async function(response) {
            response.pipe(file);

            setTimeout(() => {
                remote.log("> file downloaded")
                resolve(file)
            }, 1000);
        });
    })
}

function parseSpeech(file) {
    remote.log("> converting...")

    // Stream the file to be sent to the wit.ai
    var stream = fs.createReadStream(file);
    
    // The wit.ai instance api key
    var API_KEY = "2QEZVU5LI4VFGYAFMIYQCOU5LH63W2EL";
    
    // The content-type for this audio stream (audio/wav, ...)
    var content_type = "audio/mpeg3";
    
    return new Promise (async (resolve) => {
        WitSpeech.extractSpeechIntent(API_KEY, stream, content_type, 
            (err, res) => {
                if (err) return resolve(err);

                remote.log("> done!")
                resolve(res);
        });
    })
}