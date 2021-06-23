const cheerio = require("cheerio")
const axios = require("axios")
const fs = require("fs")

const knex = require("../db/connection")
const { resolve } = require("path")
const db = knex.getDB()


const outpath = "./out/diff.json"

// color codes for logs
const logs = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
}

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

const getEpCountLocal = (title) => {
    return new Promise(async resolve => {
        let show = await db("shows").where({title:title})
        let episodes = await db("episodes").where({ID_show:show[0].ID})
            .catch(err => {
                console.log(err);
            })
        
        if(episodes != undefined && show != undefined) {
            resolve(episodes.length)
        }   
        else {
            resolve(false)
        }
    })
    
}

const getShowUrl = (title) => {
    return new Promise(async resolve => {
        let all = await getAllShowsWeb()
        let found = false
        all.forEach(show => {
            if(show.title.toLowerCase() == title.toLowerCase()) {
                found=true
                resolve(`https://bs.to/${show.href}`)
            }
        })
        if(!found) {
            resolve(false)
        }
    })
}

const getEpCountWeb = (title) => {
    return new Promise(async resolve => {
        let episodecount = 0


        let url = await getShowUrl(title)
        let markup = await fetchHTML(url)

        let $ = cheerio.load(markup)

        let clearfix = $(".clearfix")

        let seasonsUL 

        for(elem of clearfix) {
            if(elem.name == "ul"){
                seasonsUL = elem
            }
        }

        let children = seasonsUL.children
        let seasons = []

        for(elem of children) {
            if(elem.name == "li") {
                seasons.push(elem)
            }
        }

        for(season of seasons) {
            let seasonUrl = `https://bs.to/${season.children[0].attribs.href}`
            let markup = await fetchHTML(seasonUrl)

            let $ = cheerio.load(markup)

            let tr = $("tr")

            let seasonEpisodes = tr.length
            episodecount += seasonEpisodes
        }
        resolve(episodecount)
    })
}

const getAllShowsWeb = () => {
    return new Promise(async resolve => {
        let url = "https://bs.to/andere-serien"
        let content = await fetchHTML(url)

        let $ = cheerio.load(content)

        let allLinks = $("a")
        
        let showLinks = []
        for(let link of allLinks) {
            if(link.attribs.href !== undefined) {
                if(link.attribs.href.substr(0,6) == "serie/") {
                    if(link.attribs.title != undefined) {
                        showLinks.push(link.attribs)
                    }
                }
            }
        }
        resolve(showLinks)
    })
}

const getSeasons = (showUrl) => {
    return new Promise(async resolve => {
        let html = await fetchHTML(showUrl)

        if(!html) {
            resolve(false)
        }

        let $ = cheerio.load(html)

        let lis = $("li")

        let seasons = []
        for(li of lis) {
            if(li.attribs.class !== undefined) {
                seasons.push(li.attribs.class)
            }
        }
        resolve(seasons)
    })
}

const checkLocal = (title) => {
    return new Promise(async resolve => {
        let shows = await db("shows").where({title:title})
            .catch(err => {
                console.log("error at local Check!");
                console.log(err);
            })
            
        resolve(shows.length > 0)
    })
}

const getShowEpisodes = (url) => {
    return new Promise(async resolve => {
        let markup = await fetchHTML(url)
        let $ = cheerio.load(markup)

        let clearfix = $(".clearfix")

        let seasonsUL 

        for(elem of clearfix) {
            if(elem.name == "ul"){
                seasonsUL = elem
            }
        }

        let children = seasonsUL.children

        let seasons = []

        for(elem of children) {
            if(elem.name == "li") {
                seasons.push(elem)
            }
        }

        let out = []

        for(season of seasons) {
            let episodes = []
            let seasonUrl = `https://bs.to/${season.children[0].attribs.href}`
            let markup = await fetchHTML(seasonUrl)

            let $ = cheerio.load(markup)

            let tr = $("tr")

            for(elem of tr) {
                let epUrl = "https://bs.to/" + elem.children[1].children[0].attribs.href
                let epTitle = elem.children[1].children[0].attribs.title
                episodes.push({
                    href: epUrl,
                    title: epTitle
                })
            }
            out.push({
                episodes
            })
        }

        resolve(out)
    })
}



const compare = (limit) => {
    return new Promise(async resolve => {
        let all = await getAllShowsWeb()
        let fetchNew = []
        let index = 1
        for(show of all) {
            console.log(`> ${logs.green}[${index}]${logs.reset} checking show ${logs.green}'${show.title}'${logs.reset}`)
            let exists = await checkLocal(show.title)
            if(exists) {
                let web = await getEpCountWeb(show.title)
                let local = await getEpCountLocal(show.title)
                console.log(`> ${logs.green}[${index}]${logs.reset} local count: ${logs.cyan}\t${local}${logs.reset}`)
                console.log(`> ${logs.green}[${index}]${logs.reset} web count: ${logs.yellow}\t${web}${logs.reset}`)
                if(web != local) {
                    let obj = {
                        title: show.title,
                        url: `https://bs.to/${show.href}`
                    }
                    fetchNew.push(obj)
                }
            }
            else {
                console.log(`> ${logs.green}[${index}]${logs.reset} show ${logs.red}'${show.title}'${logs.reset} not found`)
                let obj = {
                    title: show.title,
                    url: `https://bs.to/${show.href}`
                }
                fetchNew.push(obj)
            }
            index += 1

            if(limit != undefined && limit != 0 && index == limit) {
                resolve(fetchNew)
                break
            }
        }
        resolve(fetchNew)
    })
}

function statusLocal(title) {
    return new Promise(async resolve => {
        const result = {
            episodes: 0
        }

        const exists = await checkLocal(title)

        if (exists) {
            result.episodes = await getEpCountLocal(title)
        }

        resolve(result)
    })
}

function statusRemote(title) {
    return new Promise(async resolve => {
        const result = {
            episodes: await getEpCountWeb(title)
        }

        resolve(result)
    })
}

function fetchMetaWeb(url) {
    return new Promise(async resolve => {
        let response = await axios.get(url)
        let $ = cheerio.load(response)

        resolve($)
    })
}

function cleanText(str) {
    for (var i = 0, n = str.length; i < n; i++) {
        if (str.charCodeAt( i ) > 255) {
            str = str.replace(str[i], "")
        }
    }

    return str
}

module.exports = {
    compare: () => {
        return new Promise(async resolve => {
            const input = await compare()
            
            resolve(input)
        })
    },
    showsWeb: () => {
        return new Promise(async resolve => {
            const shows = await getAllShowsWeb()
            
            resolve(shows)
        })
    },
    compareShow: show => {
        return new Promise(async resolve => {
            console.log(`[ Checking ] ${show.title}`);

            const local = await statusLocal(show.title)
            const remote = await statusRemote(show.title)
            
            if (local.episodes == remote.episodes) {
                resolve(false)
            }

            resolve(true)
        })
    },
    episdesWeb(title) {
        return new Promise(async resolve => {
            const url = await getShowUrl(title)
            const episodes = await getShowEpisodes(url)

            resolve(episodes)
        })
    },
    metaWeb(showTitle) {
        return new Promise(async resolve => {
            let all = await getAllShowsWeb()
            all.forEach(async show => {
                if(show.title == showTitle) {
                    show.href = "https://bs.to/" + show.href
                    let html = await fetchHTML(show.href)
                    let $ = cheerio.load(html)

                    let out = {}

                    let spleft = $("#sp_left").get([0])
                    let spright = $("#sp_right").get([0])
                    
                    let children = spleft.children
                    
                    for(child of children) {
                        if(child.name == "p") {
                           out.desc = cleanText(child.children[0].data)
                        }
                    }

                    let rightchildren = spright.children
                    
                    for(rightchild of rightchildren) {
                        if(rightchild.name == "img") {
                            out.cover = "https://bs.to"+rightchild.attribs.src
                        }
                    }

                    let infos = $(".infos").get([0])
                    let i=0
                    for(elem of infos.children) {
                        if(elem.name !== undefined) {
                            if(i==0) {
                                // genres
                                let genres = []
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name == "p") {
                                        let values = innerElem.children
                                        let values_fixed = []
                                        
                                        for(y of values) {
                                            if(y.name !== undefined) {
                                                values_fixed.push(y)
                                            }
                                        }
                                        for(z of values_fixed) {
                                            genres.push(z.children[0].data)
                                        }
                                    }
                                }
                                out.genres = genres.join(";") + ";"
                            }
                            else if(i==1) {
                                // from + to year
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name == "p") {
                                        let values = innerElem.children
                                        let values_fixed = []
                                        
                                        for(y of values) {
                                            if(y.name !== undefined) {
                                                values_fixed.push(y)
                                            }
                                        }
                                        for(z of values_fixed) {
                                            if(values_fixed.length == 1) {
                                                if(values_fixed[0].children[0].data != undefined) {
                                                    let dates = values_fixed[0].children[0].data.split(" - ")
                                                    out.fromYear = parseInt(dates[0])
                                                    out.toYear = parseInt(dates[1]) || 0
                                                }
                                                else {
                                                    out.toYear = undefined
                                                    out.fromYear = undefined
                                                }
                                            }
                                        }
                                    }
                                }
                                
                            }
                            else if(i == 2) {
                                // actors
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name !== undefined) {
                                        if(innerElem.name == "p") {
                                            let values = innerElem.children
                                            let actsStr = ""
                                            for(x of values) {
                                                if(x.name !== undefined) {
                                                    if(x.name == "span") {
                                                        let acts = x.children
                                                        for(y of acts) {
                                                            actsStr += y.data
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            if(actsStr.split(",").join(";") == "undefined") {
                                                out.actors = "undefined"
                                            }
                                            else {
                                                out.actors = cleanText(actsStr.split(",").join(";") + ";")
                                            }
                                        }
                                    }
                                }
                            }
                            else if(i==3) {
                                // producers
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name !== undefined) {
                                        if(innerElem.name == "p") {
                                            let values = innerElem.children
                                            let prodStr = ""
                                            for(x of values) {
                                                if(x.name !== undefined) {
                                                    if(x.name == "span") {
                                                        let prod = x.children
                                                        for(y of prod) {
                                                            prodStr += y.data
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            
                                            if(prodStr.split(",").join(";") == "undefined") {
                                                out.producers = undefined
                                            }
                                            else {
                                                out.producers = cleanText(prodStr.split(",").join(";") + ";")
                                            }
                                        }
                                    }
                                }
                            }
                            else if(i==4) {
                                // directors
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name !== undefined) {
                                        if(innerElem.name == "p") {
                                            let values = innerElem.children
                                            let dirStr = ""
                                            for(x of values) {
                                                if(x.name !== undefined) {
                                                    if(x.name == "span") {
                                                        let dir = x.children
                                                        for(y of dir) {
                                                            dirStr += y.data
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            
                                            if(dirStr.split(",").join(";") == "undefined") {
                                                out.directors = undefined
                                            }
                                            else {
                                                out.directors = cleanText(dirStr.split(",").join(";") + ";")
                                            }
                                        }
                                    }
                                }
                            }
                            else if(i==5) {
                                // authors
                                let ch = elem.children

                                for(innerElem of ch) {
                                    if(innerElem.name !== undefined) {
                                        if(innerElem.name == "p") {
                                            let values = innerElem.children
                                            let authStr = ""
                                            for(x of values) {
                                                if(x.name !== undefined) {
                                                    if(x.name == "span") {
                                                        let auth = x.children
                                                        for(y of auth) {
                                                            authStr += y.data
                                                        }
                                                        
                                                    }
                                                }
                                            }
                                            
                                            if(authStr.split(",").join(";") == "undefined") {
                                                out.authors = undefined
                                            }
                                            else {
                                                out.authors = cleanText(authStr.split(",").join(";") + ";")
                                            }
                                        }
                                    }
                                }
                            }
                            i+=1
                        }
                    }

                    resolve(out)
                    
                }
            })
        })
    },
    metaLocal(showTitle) {
        return new Promise(async resolve => {
            let show = await db("shows").where({title:showTitle})
            if(show.length == 0) {
                resolve({status:false,message:"show not found"})
            }

            let meta = await db("metadata").where({SID:show[0].ID})
            let out = {status:true,id:meta[0].SID}

            delete meta[0].ID
            delete meta[0].SID

            out.data = meta[0]

            resolve(out)
        })
    },
    compareMeta(showTitle, index) {
        return new Promise(async resolve => {
            let web = await this.metaWeb(showTitle)
            let local = await this.metaLocal(showTitle)
            if(web != local.data) {
                console.log(`${logs.magenta}[${index}]${logs.reset} ${logs.red}'${showTitle}'${logs.reset} ...`)
                resolve(false)
            }
            else {
                console.log(`${logs.magenta}[${index}]${logs.reset} ${logs.green}'${showTitle}'${logs.reset} ...`)
                resolve(true)
            }
            resolve(true)
        })
    },
    updateLocalMeta() {
        return new Promise(async resolve => {
            let localShows = await db("shows")

            for(show of localShows) {
                let compare = await this.compareMeta(show.title, show.ID)

                if(!compare) {
                    // show meta needs to be updated
                }
            }
            resolve(true)
        })
    }
}