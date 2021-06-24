const express = require("express")
const axios = require("axios")
const cp = require("child_process")

const scraper = require("./src/scraper")
const request = require("./src/request")

const app = express()
const port = 87
const sources = {}

app.use("/", express.static("./client"))

app.get("/source/:code", async (req, res) => {
    const code = req.params.code
    let source = sources[code]

    console.log(code);

    if (source != undefined) {
        const status = await request.check(source)
        console.log(status);
    }

    if (source == undefined) {
        await scraper.init()
        source = await scraper.getSource(code)
        
        await execute("pkill chrome")
        await execute("pgrep chrome")

        sources[code] = source
    }
    
    console.log(console.log(`Source: ${source}`));

    res.end(source)
})

app.get("/auto/:code", async (req, res) => {
    const code = req.params.code
    let range = req.headers.range
    let source = sources[code]

    if (source == undefined) {
        await scraper.init()
        source = await scraper.getSource(code)
        
        await execute("pkill chrome")
        await execute("pgrep chrome")

        sources[code] = source
    }
    
    console.log(`Source: ${source}`)

    try {
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
        .catch(err => {
            res.end(String(err))
        })
    }
    catch(err) {
        console.log(err)
        res.end(String(err))
    }
})

app.get("/pipe", async (req, res) => {
    let range = req.headers.range
    const source = req.query.src

    try {
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
        .catch(err => {
            res.end(String(err))
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

        const process = cp.spawn(command, args)

        process.stdout.on("data", data => {
            console.log(`${data}`);
        });
        
        process.stderr.on("data", data => {
            console.log(`error: ${data}`);
        });
        
        process.on('error', (error) => {
            console.log(`error: ${error.message}`);
        });
        
        process.on("close", code => {
            resolve(true)
        });
    })
}

async function init() {
    await execute(`sudo fuser -k ${port}/tcp`)

    app.listen(port, async () => {
        console.clear()
        console.log("listening on " + port);
    })
}

init()
