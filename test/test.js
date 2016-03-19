'use strict';

import anime from '../src';
import {expect} from 'chai';
import path from 'path';
import nock from 'nock';

describe('anime-dl', function() {
  this.timeout(20000);

  describe('invalid anime', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://jkanime.net')
        .get('/buscar/asdf')
        .replyWithFile(200, path.join(__dirname, 'not_found.html'));
    });

    it('should return a error for invalid chapter', done => {
      const name = 'asdf';
      const chapter = 1;
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.eql('Not found anime with keyword "asdf"');
        done();
      });
    });
  });

  describe('invalid chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://jkanime.net')
        .get('/buscar/one%20piece')
        .replyWithFile(200, path.join(__dirname, 'found.html'));
      nock('http://jkanime.net')
        .get('/one-piece')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'));
    });

    it('should return a error for invalid chapter', done => {
      const name = 'one piece';
      const chapter = 'asdf';
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.eql('Not a valid chapter');
        done();
      });
    });

    it('should return a error for chapter outside in range', done => {
      const name = 'one piece';
      const chapter = 100000;
      anime.getLinksByNameAndChapter(name, chapter).catch(err => {
        expect(err.message).to.match(/Only\ chapters\ from\ 1\ to\ /);
        done();
      });
    });
  });

  describe('valid anime and chapter', () => {
    beforeEach(() => {
      nock.disableNetConnect();
      nock('http://jkanime.net')
        .get('/buscar/one%20piece')
        .replyWithFile(200, path.join(__dirname, 'found.html'));
      nock('http://jkanime.net')
        .get('/one-piece')
        .replyWithFile(200, path.join(__dirname, 'chapters.html'));
      nock('http://jkanime.net')
        .get('/one-piece/100')
        .replyWithFile(200, path.join(__dirname, 'chapter.html'));
    });

    it('should return valid data of a chapter of a anime', done => {
      const name = 'one piece';
      const chapter = 100;
      anime.getLinksByNameAndChapter(name, chapter).then(data => {
        expect(data.title).to.eql('One Piece');
        expect(data.codeName).to.eql('one-piece');
        expect(data.chapter).to.eql('100');
        expect(data.urls[0]).to.match(/http:\/\/jkanime\.net\/stream\/jkmedia\/([0-9a-f]{32}\/[0-9a-f]{32}\/1\/[0-9a-f]{32})\//);
        done();
      }).catch(err => {
        if (err) throw err;
        expect(err).to.be.undefined;
        done();
      });
    });
  });
});
