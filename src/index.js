'use strict';

const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const querystring = require('querystring');
const Fuse = require('fuse.js');

const userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';

const getLinksByUrl = uri => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: uri,
      headers: {'User-Agent': userAgent}
    };
    cloudscraper.request(options, (err, response, body) => {
      if (err) return reject(err.error);
      if (response.statusCode !== 200) return reject(new Error(`Status code: ${response.statusCode}`));
      const $ = cheerio.load(body);
      const validRegex = /http:\/\/jkanime\.net\/([\w\d-_]+)\/(\d+)/;
      const title = $('.vervideo').text().split(' - ')[0];
      const _exec = validRegex.exec(uri).slice(1, 3);
      const codeName = _exec[0];
      const chapter = _exec[1];
      const regex = /https:\/\/jkanime\.net\/jk\.php\?u=stream\/jkmedia\/([0-9a-f]{32}\/[0-9a-f]{32}\/1\/[0-9a-f]{32})\//;
      const urls = $('.player_conte').map(function() {
        return $(this).attr('src');
      }).get().filter(x => regex.test(x)).map(x => `http://jkanime.net/stream/jkmedia/${regex.exec(x)[1]}/`);
      resolve({title: title, codeName: codeName, chapter: chapter, urls: urls});
    });
  });
};

const getLastChapter = name => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `http://jkanime.net/${name}`,
      headers: {'User-Agent': userAgent}
    };
    cloudscraper.request(options, (err, response, body) => {
      if (err) return reject(err.error);
      if (response.statusCode !== 200) return reject(new Error(`Status code: ${response.statusCode}`));
      const $ = cheerio.load(body);
      const text = $('.listnavi a').last().text();
      const result = parseInt(/\d+\s-\s(\d+)/.exec(text)[1], 10);
      resolve(result);
    });
  });
};

const searchAnime = keyword => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      url: `http://jkanime.net/buscar/${querystring.escape(keyword)}`,
      headers: {'User-Agent': userAgent}
    };
    cloudscraper.request(options, (err, response, body) => {
      if (err) return reject(err.error);
      if (response.statusCode !== 200) return reject(new Error(`Status code: ${response.statusCode}`));
      const $ = cheerio.load(body);
      const result = $('.listpage .titl').map(function() {
        return {
          codeName: /http:\/\/jkanime\.net\/([\w\d_-]+)\//.exec($(this).attr('href'))[1],
          name: $(this).text()
        };
      }).get();
      resolve(result);
    });
  });
};

const fuseSearch = (data, keyword) => {
  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ['name']
  };
  const fuse = new Fuse(data, options);
  return fuse.search(keyword);
};

const getName = keyword => {
  keyword = keyword.trim();
  return searchAnime(keyword).then(animes => {
    if (animes.length === 0) throw new Error(`Not found anime with keyword "${keyword}"`);
    const results = fuseSearch(animes, keyword);
    if (results.length === 0) throw new Error('Not found');
    return results[0].codeName;
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
