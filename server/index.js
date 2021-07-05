const epxress = require("express")
const cors = require("cors")
const app = epxress()

const port = 88

//importing routes
const queue = require("./routes/queue")
const logger = require("./routes/logger")
const update = require("./routes/update")
const grabber = require("./routes/grabber")

//using routes/middleware
app.use(epxress.json({limit: '50mb'}))
app.use(cors())


app.use(express.static("../panel/dist"))

app.use("/queue", queue)
app.use("/logger", logger)
app.use("/update", update)
app.use("/grabber", grabber)

app.get("/", (req, res) => {
    res.end("neoflix dev services are online")
})

app.listen(port, () => {
    console.clear()
    console.log("neoflix dev is online on " + port);
})