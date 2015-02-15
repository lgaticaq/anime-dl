"use strict"

spawn = require("child_process").spawn
urllib = require "urllib"
cheerio = require "cheerio"
_ = require "lodash"
inquirer = require "inquirer"
url = "http://jkanime.net/"
version = require("../package").version
yargs = require("yargs")
  .usage("Show anime\n\nUsage: $0")
  .example("$0", "Choose interactive anime")
  .example(
    "$0 -t naruto-shippuden -c 380",
    "Show chapter 380 of Naruto Shippuden")
  .example(
    "$0 -t naruto-shippuden -c 380 -v",
    "Show chapter 380 of Naruto Shippuden in vlc")
  .alias("c", "chapter").describe("c", "Choose a chapter anime")
  .alias("t", "title").describe("t", "Choose a title anime")
  .alias("v", "vlc").describe("v", "Autoplay in vlc").boolean("v")
  .alias("k", "mpv").describe("k", "Autoplay in mpv (default)").boolean("k")
  .alias("m", "mplayer").describe("m", "Autoplay in mplayer").boolean("m")
  .alias("o", "omx").describe("o", "Autoplay in omxplayer").boolean("o")
  .alias("f", "file").describe("f", "Download to file")
  .version(version, "version").alias("version", "V")
  .help("help").alias("help", "h")

ANIME =
  title: ""
  codeName: ""
  chapter: ""

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
      ANIME.title = $(".vervideo").text().split(" - ")[0]
      ANIME.codeName = animeUrl.replace(url, "").replace("/", "")
      ANIME.chapter = parseInt chapter, 10
      try
        value = $(".player_conte param")[19].attribs.value
        url = value.split("file=")[1].split("/&provider")[0]
      catch err
        url = null
      cb err, url
    else
      cb err, null

runPlayer = (url, player) ->
  console.log "INFO"
  console.log "full title: #{ANIME.title}"
  console.log "title: #{ANIME.codeName}"
  console.log "chapter: #{ANIME.chapter}"
  console.log "url: #{url}\n\n"
  console.log "For see next chapter: #{yargs.argv["$0"]} -t " +
    "#{ANIME.codeName} -c #{ANIME.chapter + 1}"
  spawn player, [url],
    detached: true
    stdio: "ignore"

download = (url, file) ->
  console.log "INFO"
  console.log "full title: #{ANIME.title}"
  console.log "title: #{ANIME.codeName}"
  console.log "chapter: #{ANIME.chapter}"
  console.log "url: #{url}\n\n"
  console.log "For download next chapter: #{yargs.argv["$0"]} -t " +
    "#{ANIME.codeName} -c #{ANIME.chapter + 1} -f #{ANIME.codeName}_" +
    "#{ANIME.chapter + 1}.mp4"
  file = "#{ANIME.codeName}_#{ANIME.chapter}.mp4" if file is true
  spawn "wget", [url, "-O", file],
    detached: true
    stdio: "ignore"

if yargs.argv.t and yargs.argv.c
  animeUrl = "#{url}#{yargs.argv.title}/"
  player = "mpv"
  player = "mpv" if yargs.argv.k
  player = "mplayer" if yargs.argv.m
  player = "vlc" if yargs.argv.v
  player = "omxplayer" if yargs.argv.o
  getUrlVideo animeUrl, yargs.argv.chapter, (err, url) ->
    if err
      console.log "An error has occurred :("
      process.exit 1
    if yargs.argv.file
      file = yargs.argv.file
      download url, file
    else
      runPlayer url, player
else
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
          message: "Enter a number chapter"
          default: "1"
        inquirer.prompt options, (answer) ->
          getUrlVideo animeUrl, answer.chapter, (err, url) ->
            options =
              type: "list"
              name: "player"
              message: "Select player"
              default: "mpv"
              choices: ["mpv", "vlc", "mplayer"]
            inquirer.prompt options, (answer) ->
              runPlayer url, answer.player
