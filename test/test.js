'use strict'

const anime = require('../src')
const { expect } = require('chai')
const path = require('path')
const nock = require('nock')

describe('anime-dl', function () {
  this.timeout(20000)

  describe('invalid anime', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/asdf/1/')
        .replyWithFile(200, path.join(__dirname, 'not_found.html'))
    })

    it('should return a error for invalid chapter', done => {
      const name = 'asdf'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.eql('Not found anime with keyword "asdf"')
        done()
      })
    })
  })

  describe('invalid chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/psycho_pass/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/psycho-pass/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
    })

    it('should return a error for invalid chapter', done => {
      const name = 'psycho pass'
      const chapter = 'asdf'
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.eql('Not a valid chapter')
        done()
      })
    })

    it('should return a error for chapter outside in range', done => {
      const name = 'psycho pass'
      const chapter = 100000
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.match(/Only chapters from 1 to /)
        done()
      })
    })
  })

  describe('valid anime and chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/psycho_pass/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/psycho-pass/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net')
        .get('/psycho-pass/10/')
        .replyWithFile(200, path.join(__dirname, 'chapter.html'))
      nock('http://jkanime.net')
        .get(
          '/stream/jkmedia/5b90b1cddd69bab5ebf007b1742fb9fd/4f501d26373b56e0fe0351c1a6154bd4/1/1de4451f8844a9c171830d25ff1cebbb/'
        )
        .reply((uri, requestBody) => {
          return [
            201,
            '',
            {
              location:
                'https://www2.mp4upload.com:282/d/rgx3762vz3b4quuoykue6jcwkwyu7xsrj57jctgg65tu5hmtf53xlbb4/video.mp4'
            }
          ]
        })
    })

    it('should return valid data of a chapter of a anime', done => {
      const name = 'psycho pass'
      const chapter = 10
      anime
        .getLinksByNameAndChapter(name, chapter)
        .then(data => {
          expect(data.title).to.eql('Psycho-Pass')
          expect(data.codeName).to.eql('psycho-pass')
          expect(data.chapter).to.eql('10')
          expect(data.urls[0]).to.eql(
            'https://www2.mp4upload.com:282/d/rgx3762vz3b4quuoykue6jcwkwyu7xsrj57jctgg65tu5hmtf53xlbb4/video.mp4'
          )
          done()
        })
        .catch(err => done(err))
    })
  })

  describe('valid anime and chapter fuse search', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithFile(200, path.join(__dirname, 'chapter2.html'))
      nock('http://jkanime.net')
        .get(
          '/stream/jkmedia/5b90b1cddd69bab5ebf007b1742fb9fd/4f501d26373b56e0fe0351c1a6154bd4/1/1de4451f8844a9c171830d25ff1cebbb/'
        )
        .reply((uri, requestBody) => {
          return [
            201,
            '',
            {
              location:
                'https://www2.mp4upload.com:282/d/rgx3762vz3b4quuoykue6jcwkwyu7xsrj57jctgg65tu5hmtf53xlbb4/video.mp4'
            }
          ]
        })
    })

    it('should return valid data of a chapter of a anime', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime
        .getLinksByNameAndChapter(name, chapter)
        .then(data => {
          expect(data.title).to.eql('Mob Psycho 100')
          expect(data.codeName).to.eql('mob-psycho-100')
          expect(data.chapter).to.eql('1')
          expect(data.urls[0]).to.eql(
            'https://www2.mp4upload.com:282/d/rgx3762vz3b4quuoykue6jcwkwyu7xsrj57jctgg65tu5hmtf53xlbb4/video.mp4'
          )
          done()
        })
        .catch(err => done(err))
    })
  })

  describe('server error in get link', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithError('Server error')
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('bad status in get link', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net').get('/mob-psycho-100/1/').reply(301)
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('server error in get last chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithError('Server error')
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithError('Server error')
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('bad status in get last chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net').get('/mob-psycho-100/').reply(301)
      nock('http://jkanime.net').get('/mob-psycho-100/1/').reply(301)
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('server error in search', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithError('Server error')
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithError('Server error')
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithError('Server error')
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('bad status code in search', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net').get('/buscar/mob_psycho_100/1/').reply(301)
      nock('http://jkanime.net').get('/mob-psycho-100/').reply(301)
      nock('http://jkanime.net').get('/mob-psycho-100/1/').reply(301)
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('error in search name', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found_invalid.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithFile(200, path.join(__dirname, 'chapter2.html'))
    })

    it('should return an error', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('error in video link', () => {
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net')
        .get('/buscar/mob_psycho_100/1/')
        .replyWithFile(200, path.join(__dirname, 'found.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'))
      nock('http://jkanime.net')
        .get('/mob-psycho-100/1/')
        .replyWithFile(200, path.join(__dirname, 'chapter2.html'))
      nock('http://jkanime.net')
        .get(
          '/stream/jkmedia/5b90b1cddd69bab5ebf007b1742fb9fd/4f501d26373b56e0fe0351c1a6154bd4/1/1de4451f8844a9c171830d25ff1cebbb/'
        )
        .replyWithError('Server error')
    })

    it('should return valid data of a chapter of a anime', done => {
      const name = 'mob psycho 100'
      const chapter = 1
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })

  describe('error in getOriginalLinks', () => {
    const uri =
      '/stream/jkmedia/5b90b1cddd69bab5ebf007b1742fb9fd/4f501d26373b56e0fe0351c1a6154bd4/1/1de4451f8844a9c171830d25ff1cebbb/'
    beforeEach(() => {
      nock.disableNetConnect()
      nock('http://jkanime.net').get(uri).replyWithError('Server error')
    })

    it('should return valid data of a chapter of a anime', done => {
      anime.getOriginalLinks(uri).catch(err => {
        expect(err).to.be.an('error')
        done()
      })
    })
  })
})
