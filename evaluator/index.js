const eval = require('./src/browser')

const out = require("./out.json")
const fs = require('fs')

const max = 917

const getAllPages = async () => {
    await eval.init()
    await eval.executeAt("https://streamkiste.tv/include/fetch.php")

    fs.writeFileSync("./out.json", JSON.stringify({"length":0,"pages":[]}))

    let tmp = out.pages

    for (let i = out.length + 1; i < max+1; i++) {
        let perc = (i / max) * 100
        perc = Math.round(perc * 10) / 10
        console.clear()
        console.log(`working on page ${i} of ${max} (${perc}%)`)
        let html = await eval.getMovies({
            page: i,
            type: "cat",
            wq: "filme",
            wsq: "",
            sq: "",
            year: "",
            sortby: ""
        })

        html = html.replace(/\n/g, "") 

        tmp.push(html)

    }
    fs.writeFileSync("./out.json", JSON.stringify({
        length: tmp.length,
        pages: tmp
    }))
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