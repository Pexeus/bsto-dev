const scraper = require("./src/scraper")
const express = require("express")
const axios = require("axios")

const app = express()
const port = 80
const sources = {}

app.get("/:code", async (req, res) => {
    const code = req.params.code
    let source = sources[code]
    let range = req.headers.range

    if (source == undefined) {
        source = await scraper.getSource(code)
        sources[code] = source
    }
    else {
        console.log(`Source cached: ${source}`);
    }

    if (range == undefined) {
        range = "bytes=0-0"
    }

    axios.get(source, {
        responseType: 'stream',
        headers: {
            Range: range
        }
    })
    .then((stream) => {
        console.log("piping now");
        res.writeHead(stream.status, stream.headers)
        stream.data.pipe(res)
    })
    .catch(err => {
        res.end(String(err))
    })
})

async function init() {
    await scraper.init()

    app.listen(port, async () => {
        console.log("listening on " + port);
    })
}

init()
