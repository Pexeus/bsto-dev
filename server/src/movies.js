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
    let $ = cheerio.load(page)
    let a = $("a")
    let movies = []

    let l = 0

    for(elem of a) {
        let obj = {}
        if(elem.attribs.href != undefined && elem.attribs.title != undefined) {
            obj.url = baseUrl + elem.attribs.href
            obj.title = elem.attribs.title
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

    let cast = $(".movie-cast");
    l=0

    for(elem of cast) {
        movies[l].directors = elem.children[0].children[1].data.split(", ").join(";").substring(1) + ";"
        movies[l].actors = elem.children[1].children[1].data.split(", ").join(";").substring(1) + ";"
        l+=1
    }

    let info = $(".movie-info")
    l=0

    for(elem of info) {
        movies[l].imdb_rating = parseFloat(elem.children[0].children[0].data.replace(/ /g, ""))
        l+=1
    }

    let img = $("img")
    l=0

    for(elem of img) {
        movies[l].cover = elem.attribs["data-src"]
        l+=1
    }
    
    return movies
}

const getGenres = (url) => {
    return new Promise(async resolve => {
        let markup = await axios.get(url)
        let $ = cheerio.load(markup)

        console.log($(".categories"))
    
        resolve(true)
    })
}

const init = async () => {
    await getGenres("https://streamkiste.tv/movie/mumie-tal-des-todes-1993-0107618")
}

init()