anime-dl
========

[![npm version](https://badge.fury.io/js/anime-dl.svg)](http://badge.fury.io/js/anime-dl)

CLI for show anime whit subs in spanish.

Requirements
------------

- [mpv](http://mpv.io/installation/)
- [wget](https://www.gnu.org/software/wget/)
- [vlc (optional)](http://www.videolan.org/vlc/#download)
- [mplayer2 (optional)](http://www.mplayer2.org/downloads/)
- [omxplayer (optional)](https://github.com/huceke/omxplayer/)


Install
-------

``` bash
[sudo] npm i -g anime-dl
```

Only GNU/Linux for the moment. Default player is mpv

Usage
-----

Interactive mode

``` bash
anime-dl
```

Show a chapter of a anime. Example of title: dragon-ball

``` bash
anime-dl -c [number] -t [title-anime]
```

Show a chapter of a anime in vlc

``` bash
anime-dl -c [number] -t [title-anime] -v
```

Download a chapter of a anime. Example of title: dragon-ball. Require wget

``` bash
anime-dl -c [number] -t [title-anime] -f video.mp4
```
