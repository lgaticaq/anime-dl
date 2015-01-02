"use strict"

spawn = require("child_process").spawn
urllib = require "urllib"
cheerio = require "cheerio"
_ = require "lodash"
inquirer = require "inquirer"
url = "http://jkanime.net/"

searchAnime = (search, cb) ->
  urllib.request "#{url}buscar/#{search}",
    method: "GET"
  , (err, data, response) ->
    if not err and response.statusCode is 200
      $ = cheerio.load data.toString()
      animes = []
      $(".listpage .titl").each ->
        animes.push
          value: $(this).attr("href")
          name: $(this).text()
      cb err, animes
    else
      cb err, null

getUrlVideo = (animeUrl, chapter, cb) ->
  urllib.request "#{animeUrl}#{chapter}",
    method: "GET"
  , (err, data, response) ->
    if not err and response.statusCode is 200
      $ = cheerio.load data.toString()
      try
        value = $(".player_conte param")[19].attribs.value
        url = value.split("file=")[1].split("/&provider")[0]
      catch err
        url = null
      cb err, url
    else
      cb err, null

options =
  type: "input"
  name: "search"
  message: "Enter a anime name"
inquirer.prompt options, (answer) ->
  searchAnime answer.search, (err, animes) ->
    options =
      type: "list"
      name: "anime"
      message: "Select a anime"
      choices: animes
    inquirer.prompt options, (answer) ->
      animeUrl = answer.anime
      options =
        type: "input"
        name: "chapter"
        message: "Entre a number chapter"
        default: "1"
      inquirer.prompt options, (answer) ->
        getUrlVideo animeUrl, answer.chapter, (err, url) ->
          prc = spawn("mpv",  [url])
          console.log "mpv #{url}"
          prc.on "close", (code) ->
            console.log "process exit code #{code}"
