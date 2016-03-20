'use strict';

import rp from 'request-promise';
import cheerio from 'cheerio';
import querystring from 'querystring';

const userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

const getLinksByUrl = (uri) => {
  const validRegex = /http:\/\/jkanime\.net\/([\w\d-_]+)\/(\d+)/;
  const options = {
    uri: uri,
    transform: cheerio.load,
    headers: {'User-Agent': userAgent}
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

const getLastChapter = (name) => {
  const options = {
    uri: `http://jkanime.net/${name}`,
    transform: cheerio.load,
    headers: {'User-Agent': userAgent}
  };
  return rp(options)
    .then($ => {
      const text = $('.listnavi a').last().text();
      return parseInt(/\d+\s-\s(\d+)/.exec(text)[1], 10);
    });
};

const searchAnime = (keyword) => {
  const options = {
    uri: `http://jkanime.net/buscar/${querystring.escape(keyword)}`,
    transform: cheerio.load,
    headers: {'User-Agent': userAgent}
  };
  return rp(options)
    .then($ => {
      return $('.listpage .titl').map(function() {
        return {
          codeName: /http:\/\/jkanime\.net\/([\w\d-_]+)\//.exec($(this).attr('href'))[1],
          name: $(this).text()
        };
      }).get();
    });
};

const getName = (keyword) => {
  keyword = keyword.trim();
  return searchAnime(keyword).then(animes => {
    if (animes.length === 0) throw new Error(`Not found anime with keyword "${keyword}"`);
    return animes[0].codeName;
  });
};

const makeUrl = (keyword, chapter) => {
  let _name;
  return getName(keyword).then(name => {
    _name = name;
    return getLastChapter(name);
  }).then(last => {
    if (!/\d+/.test(chapter)) throw new Error('Not a valid chapter');
    chapter = parseInt(chapter, 10);
    if (chapter > last) throw new Error(`Only chapters from 1 to ${last}`);
    return `http://jkanime.net/${_name}/${chapter}`;
  });
};

const getLinksByNameAndChapter = (name, chapter) => {
  return makeUrl(name, chapter).then(getLinksByUrl);
};

module.exports = {
  searchAnime: searchAnime,
  makeUrl: makeUrl,
  getLinksByUrl: getLinksByUrl,
  getLinksByNameAndChapter: getLinksByNameAndChapter
};
