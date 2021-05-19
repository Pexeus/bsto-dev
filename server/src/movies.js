const axios = require("axios")
const cheerio = require("cheerio")

const knex = require("../db/connection")

const db = knex.getDB()

const baseUrl = "https://streamkiste.tv"


// function to fetch HTML content from url
const fetchHTML = (url) => {
    return new Promise(resolve => {
        axios.get(url)
        .then(resp => {
            resolve(resp.data)
        })
        .catch(err => {
            resolve(false)
        })
    })
}

const getMovieData = (page) => {
    return new Promise(async resolve => {
        let $ = cheerio.load(page)
        let a = $("a")
        let movies = []

        let l = 0

        for(elem of a) {
            let obj = {}
            if(elem.attribs.href != undefined && elem.attribs.title != undefined) {
                obj.url = baseUrl + elem.attribs.href
                obj.title = elem.attribs.title
                obj.genres = await getGenres(obj.url)
                movies.push(obj)
            }
        }
        let descs = $(".story")

        for(elem of descs) {
            movies[l].desc = elem.children[0].data
            l+=1
        }

        let release = $(".movie-release")
        l=0
        for(elem of release) {
            movies[l].release = parseInt(elem.children[0].data.split(" - ")[0])
            l+=1
        }

        let cast = $(".movie-cast")
        l=0
        
        for(elem of cast) {
            let y = 0
            for(chelem of elem.children) {
                if(chelem.name == "p") {
                    let data = chelem.children[1].data.substring(1).split(", ").join(";")+";"
                    if(y == 0) {
                        movies[l].directors = data
                    }
                    else if(y == 1) {
                        movies[l].actors = data
                    }
                    y+=1
                }
            }
            l+=1
        }

        let info = $(".movie-info")
        l=0

        for(elem of info) {
            let y=0
            for(chelem of elem.children) {
                if(chelem.name == "span") {
                    if(y==0) {
                        movies[l].imdb_rating = parseFloat(chelem.children[0].data)
                    }
                    y+=1
                }
            }
            l+=1
        }

        let img = $("img")
        l=0

        for(elem of img) {
            movies[l].cover = elem.attribs["data-src"]
            l+=1
        }
        
        resolve({length:movies.length,data:movies})
    })
}

const getGenres = (url) => {
    return new Promise(async resolve => {
        let markup = await fetchHTML(url)
        let $ = cheerio.load(markup)

        // get .categories element (wrapper for genres)
        let wrap = $(".categories").get(0)
        let genres = []

        // loop through child elems of .categories
        for(elem of wrap.children) {
            // check if elem is not undefined & elem is 'a' element
            if(elem.name != undefined && elem.name == "a") {
                // loop through children of 'a' elements
                for(childelem of elem.children) {
                    // check if elem is not a 'span' since the only elems here are either 
                    // 'span' or '#text', which we need
                    if(childelem.name != "span") {
                        // replace spaces from genres
                        let genre = childelem.data.replace(/ /g,"")
                        // only append to array if genre is not "Filme", since we have a seperate table for movies
                        if(genre != "Filme") {
                            genres.push(genre)
                        }
                    }
                }
            }
        }
        // return genres => "Genre1;Genre2;Genre3;"
        resolve(genres.join(";")+";")
    })
}

const init = async () => {
    let data = await getMovieData(test)

    console.log(data)
}

init()