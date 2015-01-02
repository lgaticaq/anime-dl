"use strict"

gulp = require "gulp"
plugins = require("gulp-load-plugins")()
runSequence = require "run-sequence"

gulp.task "coffeelint", ->
  gulp.src("./src/index.coffee")
    .pipe plugins.coffeelint()
    .pipe plugins.coffeelint.reporter()

gulp.task "coffee", ->
  gulp.src("./src/index.coffee")
    .pipe(plugins.coffee(bare: true).on("error", plugins.util.log))
    .pipe(plugins.header("#!/usr/bin/env node\n"))
    .pipe(gulp.dest("./lib"))

gulp.task "build", (cb) ->
  runSequence(
    "coffeelint"
    "coffee"
    cb
  )

inc = (importance) ->
  gulp.src("./package.json")
    .pipe(plugins.bump(type: importance))
    .pipe(gulp.dest("./"))
    .pipe(plugins.git.commit("bumps package version"))
    .pipe(plugins.filter("package.json"))
    .pipe(plugins.tagVersion())

gulp.task "patch", ->
  inc("patch")

gulp.task "feature", ->
  inc("minor")

gulp.task "release", ->
  inc("major")
