url = http://jkanime.net/
{{ url }}buscar/{{ search }}

$(".listpage .titl") => animes
$(".listnavi .listsiguiente") => next page

animeUrl = $({{ anime }}).attr("href")
animeName = animeUrl.split(url)[1].slice(0, -1)

$(".listpage li a") => chapters
$(".listnavi .listsiguiente") => next page

chapterUrl = $({{ chapter }}).attr("href")
chapterNumber = chapterUrl.split(animeUrl)[1].slice(0, -1)

$(".player_conte param")[4].value.substring(5, 139)
