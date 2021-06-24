function setSource() {
    const code = document.getElementById("source").value
    const video = document.getElementById("vod")
    const url = `/auto/${code}`

    video.src = url
}