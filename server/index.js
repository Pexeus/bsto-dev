const epxress = require("express")
const app = epxress()

const port = 88

app.get("/", (req, res) => {
    res.end("neoflix dev services are online")
})

app.listen(port, () => {
    console.log("bsto-dev is online on " + port);
}) 