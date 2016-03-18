'use strict';

import rp from 'request-promise';
import cheerio from 'cheerio';

const searchAnime = (keyword) => {
  const options = {
    uri: `http://jkanime.net/buscar/${keyword}`,
    transform: cheerio.load,
    headers: {'User-Agent': 'anime-dl'}
  };
  return rp(options)
    .then($ => {
      return $('.listpage .titl').map(function() {
        return {
          url: $(this).attr('href'),
          name: $(this).text()
        };
      }).get();
    });
};

const getUrlVideo = (uri) => {
  const validRegex = /http:\/\/jkanime\.net\/([\w\d-_]+)\/(\d+)/;
  const options = {
    uri: uri,
    transform: cheerio.load,
    headers: {'User-Agent': 'anime-dl'}
  };
  return rp(options)
    .then($ => {
      if (!validRegex.test(uri)) return null;
      const title = $('.vervideo').text().split(' - ')[0];
      const [codeName, chapter] = validRegex.exec(uri).slice(1, 3);
      const regex = /https:\/\/jkanime\.net\/jk\.php\?u=stream\/jkmedia\/([0-9a-f]{32}\/[0-9a-f]{32}\/1\/[0-9a-f]{32})\//;
      const urls = $('.player_conte').map(function() {
        return $(this).attr('src');
      }).get().filter(x => regex.test(x)).map(x => `http://jkanime.net/stream/jkmedia/${regex.exec(x)[1]}/`);
      return {title: title, codeName: codeName, chapter: chapter, urls: urls};
    });
};

module.exports = {
  searchAnime: searchAnime,
  getUrlVideo: getUrlVideo
};
