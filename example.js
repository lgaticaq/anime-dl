const anime = require('anime-dl')

const name = 'one piece'
const chapter = 732
const data = await anime.getLinksByNameAndChapter(name, chapter)
