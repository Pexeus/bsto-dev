const app =require('express')()
const axios = require('axios')

app.get('/:msg', (req, res) => {
    const url = "https://node--liana.vivo.sx/vod/B0oBLqfLsveY7wW0Rewuqw/1621910057/0004076560"
    let range = req.headers.range

    if (range == undefined) {
        range = "bytes=0-0"
    }

    console.log("url: ", url);
    console.log("range: ", range);

    axios.get(url, {
        responseType: 'stream',
        headers: {
            Range: range
        }
    })
    .then((stream) => {
        res.writeHead(stream.status, stream.headers)
        stream.data.pipe(res)
    })
    .catch(err => {
        res.end(String(err))
    })
})

app.listen(87, () => {
    console.clear()
    console.log("online");
})