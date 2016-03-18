# anime-dl

[![npm version](https://img.shields.io/npm/v/anime-dl.svg?style=flat-square)](https://www.npmjs.com/package/anime-dl)
[![npm downloads](https://img.shields.io/npm/dm/anime-dl.svg?style=flat-square)](https://www.npmjs.com/package/anime-dl)
[![Build Status](https://img.shields.io/travis/lgaticaq/anime-dl.svg?style=flat-square)](https://travis-ci.org/lgaticaq/anime-dl)
[![dependency Status](https://img.shields.io/david/lgaticaq/anime-dl.svg?style=flat-square)](https://david-dm.org/lgaticaq/anime-dl#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/anime-dl.svg?style=flat-square)](https://david-dm.org/lgaticaq/anime-dl#info=devDependencies)
[![Join the chat at https://gitter.im/lgaticaq/anime-dl](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg?style=flat-square)](https://gitter.im/lgaticaq/anime-dl?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Search and get anime video url

## Installation

```bash
npm i -S anime-dl
```

## Use

[Try on Tonic](https://tonicdev.com/npm/anime-dl)
```js
import anime from 'anime-dl'

const keyword = 'one piece';
anime.searchAnime(keyword).then(console.log);
/*{
  title: 'One Piece',
  codeName: 'one-piece',
  chapter: '732',
  urls: [
    'http://jkanime.net/stream/jkmedia/83b83090f08cbe7823cb0ed531f8cc72/0f40333b749a2a6d1bc5706accd73329/1/1de4451f8844a9c171830d25ff1cebbb/',
    'http://jkanime.net/stream/jkmedia/83b83090f08cbe7823cb0ed531f8cc72/4f501d26373b56e0fe0351c1a6154bd4/1/1de4451f8844a9c171830d25ff1cebbb/',
    'http://jkanime.net/stream/jkmedia/83b83090f08cbe7823cb0ed531f8cc72/ea38fc252cc488c0c1149875b8694f87/1/1de4451f8844a9c171830d25ff1cebbb/'
  ]
}*/
```

const uri = 'http://jkanime.net/one-piece/732/';
anime.searchAnime(uri).then(console.log);
/*[
  { url: 'http://jkanime.net/one-piece/', name: 'One Piece' },
  { url: 'http://jkanime.net/one-piece-taose-kaizoku-ganzack/', name: 'One Piece: Taose! Kaizoku Ganzack' },
  { url: 'http://jkanime.net/one-piece-romance-dawn/', name: 'One Piece: Romance Dawn' },
  { url: 'http://jkanime.net/one-piece-strong-world-episode-0/', name: 'One Piece: Strong World Episode 0' },
  { url: 'http://jkanime.net/one-piece-recap/', name: 'One Piece Recap' },
  { url: 'http://jkanime.net/one-piece-episode-of-nami/', name: 'One Piece: Episode of Nami' },
  { url: 'http://jkanime.net/one-piece-episode-of-luffy-hand-island-no-bouken/', name: 'One Piece: Episode of Luffy - Hand Island no Bouken' },
  { url: 'http://jkanime.net/dream-9-toriko-one-piece-dragon-ball-z-super-collaboration-special/', name: 'Toriko & One Piece & Dragon Ball Z Super Collaboration' },
  { url: 'http://jkanime.net/one-piece-film-z/', name: 'One Piece Film Z' },
  { url: 'http://jkanime.net/one-piece-special-glorious-island/', name: 'One Piece Special: Glorious Island' }
]*/
```
