const { json } = require("express");
const express = require("express")
const fs = require("fs")

const router = express.Router()


router.get("/", (req, res) => {
    console.log(req.body);

    res.end(JSON.stringify({status: "online"}))
})

module.exports = router