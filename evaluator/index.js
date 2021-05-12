const eval = require('./src/browser')

async function init() {
    await eval.init()
    await eval.executeAt("https://streamkiste.tv/include/fetch.php")

    //"body": "page=2&type=cat&wq=filme&wsq=&sq=&year=&sortby="
    for (var i = 0; i < 100; i++) {
        const html = await eval.getMovies({
            page: i,
            type: "cat",
            wq: "filme",
            wsq: "",
            sq: "",
            year: "",
            sortby: ""
        })

        console.log(html);
    }
}

init()