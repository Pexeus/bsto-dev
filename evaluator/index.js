const eval = require('./src/browser')

const out = require("./out.json")
const fs = require('fs')

const getAllPages = async () => {
    await eval.init()
    await eval.executeAt("https://streamkiste.tv/include/fetch.php")

    for (let i = out.length + 1; i < 917; i++) {
        let html = await eval.getMovies({
            page: i,
            type: "cat",
            wq: "filme",
            wsq: "",
            sq: "",
            year: "",
            sortby: ""
        })
        let tmp = out.pages
        tmp.push(html)

        fs.writeFileSync("out.json", {
            length: tmp.length,
            pages: tmp
        })
    }
}





async function init() {
    await eval.init()
    await eval.executeAt("https://streamkiste.tv/include/fetch.php")




    //"body": "page=2&type=cat&wq=filme&wsq=&sq=&year=&sortby="
    for (var i = 1; i < 917; i++) {
        const html = await eval.getMovies({
            page: i,
            type: "cat",
            wq: "filme",
            wsq: "",
            sq: "",
            year: "",
            sortby: ""
        })

        console.log(html)
    }
}

getAllPages()