'use strict'

const http = require('http')
const cheerio = require('cheerio')
const querystring = require('querystring')
const Fuse = require('fuse.js')

const userAgent =
  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'

const requestOptions = uri => {
  return {
    headers: { 'User-Agent': userAgent },
    hostname: 'jkanime.net',
    port: 80,
    path: uri,
    method: 'GET'
  }
}

const getOriginalLinks = uri => {
  return new Promise((resolve, reject) => {
    const options = requestOptions(uri)
    const req = http.request(options, res => {
      resolve(res.headers.location)
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

const getLinksByUrl = uri => {
  return new Promise((resolve, reject) => {
    const options = requestOptions(uri)
    const req = http.request(options, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status Code: ${res.statusCode}`))
      } else {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => {
          rawData += chunk
        })
        res.on('end', () => {
          try {
            const $ = cheerio.load(rawData)
            const validRegex = /\/([\w\d-_]+)\/(\d+)/
            const title = $('.vervideo').text().split(' - ')[0]
            const _exec = validRegex.exec(uri).slice(1, 3)
            const codeName = _exec[0]
            const chapter = _exec[1]
            const regex = /https:\/\/jkanime\.net\/jk\.php\?u=stream\/jkmedia\/([0-9a-f]{32}\/[0-9a-f]{32}\/1\/[0-9a-f]{32})\//
            const promises = $('.player_conte')
              .map(function () {
                return $(this).attr('src')
              })
              .get()
              .filter(x => regex.test(x))
              .map(x =>
                getOriginalLinks(`/stream/jkmedia/${regex.exec(x)[1]}/`)
              )
            Promise.all(promises)
              .then(urls => {
                resolve({
                  title: title,
                  codeName: codeName,
                  chapter: chapter,
                  urls: urls
                })
              })
              .catch(reject)
          } catch (err) {
            reject(err)
          }
        })
      }
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

const getLastChapter = name => {
  return new Promise((resolve, reject) => {
    const options = requestOptions(`/${name}/`)
    const req = http.request(options, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status Code: ${res.statusCode}`))
      } else {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => {
          rawData += chunk
        })
        res.on('end', () => {
          try {
            const $ = cheerio.load(rawData)
            const text = $('.listnavi a').last().text()
            const result = parseInt(/\d+\s-\s(\d+)/.exec(text)[1], 10)
            resolve(result)
          } catch (err) {
            reject(err)
          }
        })
      }
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

const searchAnime = keyword => {
  return new Promise((resolve, reject) => {
    const options = requestOptions(
      `/buscar/${querystring.escape(keyword).replace(/%20/g, '_')}/1/`
    )
    const req = http.request(options, res => {
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', chunk => {
        rawData += chunk
      })
      res.on('end', () => {
        try {
          const $ = cheerio.load(rawData)
          const result = $('.listpage .titl')
            .map(function () {
              return {
                codeName: /http:\/\/jkanime\.net\/([\w\d_-]+)\//.exec(
                  $(this).attr('href')
                )[1],
                name: $(this).text()
              }
            })
            .get()
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

const fuseSearch = (data, keyword) => {
  const options = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    keys: ['name']
  }
  const fuse = new Fuse(data, options)
  return fuse.search(keyword)
}

const getName = keyword => {
  keyword = keyword.trim()
  return searchAnime(keyword).then(animes => {
    if (animes.length === 0) {
      throw new Error(`Not found anime with keyword "${keyword}"`)
    }
    const results = fuseSearch(animes, keyword)
    if (results.length === 0) throw new Error('Not found')
    return results[0].codeName
  })
}

const makeUrl = (keyword, chapter) => {
  let _name
  return getName(keyword)
    .then(name => {
      _name = name
      return getLastChapter(name)
    })
    .then(last => {
      if (!/\d+/.test(chapter)) throw new Error('Not a valid chapter')
      chapter = parseInt(chapter, 10)
      if (chapter > last) throw new Error(`Only chapters from 1 to ${last}`)
      return `/${_name}/${chapter}/`
    })
}

const getLinksByNameAndChapter = (name, chapter) => {
  return makeUrl(name, chapter).then(getLinksByUrl)
}

module.exports = {
  searchAnime: searchAnime,
  makeUrl: makeUrl,
  getLinksByUrl: getLinksByUrl,
  getLinksByNameAndChapter: getLinksByNameAndChapter,
  getOriginalLinks: getOriginalLinks,
  getLastChapter: getLastChapter
}
