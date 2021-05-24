const eval = require('./src/browser')

const fs = require('fs')

const max = 917

const getAllPages = async () => {
    const out = require("./out.json")
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

        if(html.substring(0,15) != "<!DOCTYPE html>") {
            tmp.push(html)
        }
        else {
            // request blocked
            // get new IP & try again
        }


        fs.writeFileSync("./out.json", JSON.stringify({
            length: tmp.length,
            pages: tmp
        }))
    }
}

const clearOut = () => {
    fs.writeFileSync("./out.json", JSON.stringify({
        length: 0,
        pages: []
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
//clearOut()
getAllPages()