const anime = require('anime-dl');

const uri = 'http://jkanime.net/one-piece/732/';
const data = await anime.getUrlVideo(uri);
