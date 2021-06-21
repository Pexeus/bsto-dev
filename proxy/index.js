const express = require("express")
const axios = require("axios")
const cp = require("child_process")

const scraper = require("./src/scraper")
const request = require("./src/request")
const { resolve } = require("path")

const app = express()
const port = 87
const sources = {}

app.get("/:code", async (req, res) => {
    try {
        const code = req.params.code
        let source = sources[code]
        let range = req.headers.range

        await scraper.init()

        console.log("Proxying " + code);

        if (source != undefined) {
            const status = await request.check(source)
            console.log(status);
        }

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

        console.log("Piping from: " + source);

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
    }
    catch(err) {
        console.log(err)
        res.end(String(err))
    }
})

function execute(cmd) {
    return new Promise(resolve => {
        const command = cmd.split(" ")[0]
        const args = cmd.split(" ")
        args.splice(0, 1)

        console.log(command, args);

        const process = cp.spawn(command, args)
        resolve(true)

        process.stdout.on("data", data => {
            console.log(`${cmd}: ${data}`);
        });
        
        process.stderr.on("data", data => {
            console.log(`${cmd}: ${data}`);
        });
        
        process.on('error', (error) => {
            console.log(`${cmd}: ${error.message}`);
        });
        
        process.on("close", code => {
            console.log(`child process exited with code ${code}`);
        });
    })
}

async function init() {
    app.listen(port, async () => {
        console.log("listening on " + port);
    })
}

init()
