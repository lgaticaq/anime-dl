"use strict"

gulp = require "gulp"
plugins = require("gulp-load-plugins")()
runSequence = require "run-sequence"
yargs = require("yargs")
  .alias("m", "message")

gulp.task "coffeelint", ->
  gulp.src("./src/index.coffee")
    .pipe plugins.coffeelint()
    .pipe plugins.coffeelint.reporter()

gulp.task "coffee", ["coffeelint"], ->
  gulp.src("./src/index.coffee")
    .pipe(plugins.coffee(bare: true).on("error", plugins.util.log))
    .pipe(plugins.header("#!/usr/bin/env node\n"))
    .pipe(gulp.dest("./lib"))

gulp.task "build", ["coffee"]

inc = (importance) ->
  gulp.src("./package.json")
    .pipe(plugins.bump(type: importance))
    .pipe(gulp.dest("./"))

gulp.task "patch", ->
  inc("patch")

gulp.task "feature", ->
  inc("minor")

gulp.task "release", ->
  inc("major")

gulp.task "commit", ->
  gulp.src("./*")
    .pipe(plugins.git.commit(yargs.argv.m, args: "--amend"))

gulp.task "tag", ->
  gulp.src(["./package.json"]).pipe(plugins.tagVersion())

gulp.task "push-tags", ->
  plugins.git.push "origin", "master", args: "--tags", (err) ->
    throw err if err

gulp.task "push", ->
  plugins.git.push "origin", "master", (err) ->
    throw err if err
