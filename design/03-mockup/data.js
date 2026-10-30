// Sample data for the mockup: a fictional library read from the chosen folders.
//
// Folder layout (how the user organizes music on the phone):
//   Music/<Genre>/<Artist>/folder.jpg          ← artist photo
//   Music/<Genre>/<Artist>/<Album>/folder.jpg  ← album cover
//   Music/<Genre>/<Artist>/<Album>/01 - Track.mp3
//
// Image rule (D19), applied to each folder: use folder.jpg / folder.jpeg / folder.png
// (any case); if there is none, use the folder's only image; otherwise no image.
//
// Images are simulated in the mockup. To try real images, put a file in
// design/03-mockup/images/ and set "url" on the artist or album
// (e.g. url: 'images/milton.jpg').
(function () {
  const d = (m, s) => m * 60 + s;

  // images: image files inside the artist folder; the photo is picked by the D19 rule
  const artists = [
    { id: 'milton', name: 'Milton Nascimento', folder: 'Music/MPB/Milton Nascimento', images: ['folder.jpg'] },
    { id: 'novosbaianos', name: 'Novos Baianos', folder: 'Music/MPB/Novos Baianos', images: ['folder.jpg'] },
    { id: 'elis', name: 'Elis Regina', folder: 'Music/MPB/Elis Regina', images: ['folder.jpg'] },
    { id: 'chico', name: 'Chico Buarque', folder: 'Music/MPB/Chico Buarque', images: ['folder.jpg'] },
    { id: 'timmaia', name: 'Tim Maia', folder: 'Music/MPB/Tim Maia', images: ['tim-maia.jpg'] }, // only image → used,
    { id: 'caetano', name: 'Caetano Veloso', folder: 'Music/MPB/Caetano Veloso', images: ['folder.jpg'] },
    { id: 'gil', name: 'Gilberto Gil', folder: 'Music/MPB/Gilberto Gil', images: ['folder.jpg'] },
    // No image in the folder: shows the fallback
    { id: 'titas', name: 'Titãs', folder: 'Music/Rock/Titãs', images: [] },
    { id: 'unknown', name: 'Unknown artist', folder: null, images: [] },
  ];

  // images: image files inside the album folder; the cover is picked by the D19 rule
  const albums = [
    { id: 'clube', title: 'Clube da Esquina', artist: 'milton', year: 1972, images: ['folder.jpg'],
      tracks: [['Tudo Que Você Podia Ser', d(2, 58)], ['Cais', d(3, 45)], ['O Trem Azul', d(4, 5)], ['Nada Será Como Antes', d(3, 24)],
        ['Cravo e Canela', d(2, 31)], ['Um Girassol da Cor do Seu Cabelo', d(4, 13)], ['San Vicente', d(2, 47)], ['Clube da Esquina Nº 2', d(3, 39)]] },
    { id: 'acabou', title: 'Acabou Chorare', artist: 'novosbaianos', year: 1972, images: ['folder.jpg'],
      tracks: [['Brasil Pandeiro', d(4, 0)], ['Preta Pretinha', d(6, 41)], ['Tinindo Trincando', d(2, 53)], ['Swing de Campo Grande', d(2, 49)],
        ['Acabou Chorare', d(3, 46)], ['Mistério do Planeta', d(3, 32)]] },
    { id: 'elistom', title: 'Elis & Tom', artist: 'elis', year: 1974, images: ['Folder.PNG', 'back.jpg'], // name match wins, any case
      tracks: [['Águas de Março', d(3, 32)], ['Pois É', d(2, 55)], ['Só Tinha de Ser com Você', d(4, 19)], ['Corcovado', d(3, 31)],
        ['Triste', d(2, 38)], ['Inútil Paisagem', d(2, 38)]] },
    { id: 'construcao', title: 'Construção', artist: 'chico', year: 1971, images: ['folder.jpg'],
      tracks: [['Deus Lhe Pague', d(3, 19)], ['Cotidiano', d(2, 50)], ['Desalento', d(2, 46)], ['Construção', d(6, 24)],
        ['Cordão', d(2, 30)], ['Valsinha', d(2, 0)]] },
    { id: 'timmaia', title: 'Tim Maia', artist: 'timmaia', year: 1970, images: ['folder.jpg'],
      tracks: [['Azul da Cor do Mar', d(3, 57)], ['Primavera', d(2, 59)], ['Coroné Antonio Bento', d(2, 35)], ['Eu Amo Você', d(3, 3)]] },
    { id: 'transa', title: 'Transa', artist: 'caetano', year: 1972, images: ['transa-front.jpg'], // only image → used
      tracks: [['You Don\'t Know Me', d(3, 48)], ['Nine Out of Ten', d(4, 56)], ['Triste Bahia', d(9, 43)], ['It\'s a Long Way', d(6, 6)],
        ['Mora na Filosofia', d(6, 10)], ['Neolithic Man', d(4, 51)], ['Nostalgia', d(1, 17)]] },
    { id: 'refavela', title: 'Refavela', artist: 'gil', year: 1977, images: ['folder.jpg'],
      tracks: [['Ilê Ayê', d(3, 46)], ['Aqui e Agora', d(4, 30)], ['Refavela', d(3, 53)], ['Sandra', d(4, 24)], ['Babá Alapalá', d(3, 58)]] },
    { id: 'expresso', title: 'Expresso 2222', artist: 'gil', year: 1972, images: ['folder.jpg'],
      tracks: [['Back in Bahia', d(4, 10)], ['O Canto da Ema', d(3, 25)], ['Expresso 2222', d(3, 23)], ['Oriente', d(6, 9)]] },
    // Two images and no folder.*: ambiguous → app-generated cover
    { id: 'cabeca', title: 'Cabeça Dinossauro', artist: 'titas', year: 1986, images: ['booklet-1.jpg', 'booklet-2.jpg'],
      tracks: [['Cabeça Dinossauro', d(2, 20)], ['AA UU', d(3, 1)], ['Polícia', d(2, 6)], ['Homem Primata', d(3, 20)], ['Família', d(3, 30)]] },
    // Loose files with no metadata and no artist/album folder
    { id: 'misc', title: 'Unknown album', artist: 'unknown', year: null, images: [], noMetadata: true, folder: 'Music/Misc',
      tracks: [['live_show_2019', d(5, 12)], ['guitar_rehearsal', d(2, 44)], ['track 07', d(3, 9)]] },
  ];

  // D19: folder.(jpg|jpeg|png), any case → otherwise the only image in the folder → otherwise none
  const IMAGE = /\.(jpe?g|png)$/i;
  function pickFolderImage(images) {
    const named = images.find(f => /^folder\.(jpe?g|png)$/i.test(f));
    if (named) return { file: named, reason: 'name' };
    const all = images.filter(f => IMAGE.test(f));
    return all.length === 1 ? { file: all[0], reason: 'only' } : null;
  }
  artists.forEach(a => { const pick = pickFolderImage(a.images); a.photo = pick && pick.file; a.photoReason = pick && pick.reason; });
  albums.forEach(a => { const pick = pickFolderImage(a.images); a.cover = pick && pick.file; a.coverReason = pick && pick.reason; });

  // Album folder path: <artist folder>/<Album (year)>
  const artistById = Object.fromEntries(artists.map(a => [a.id, a]));
  albums.forEach(a => {
    if (!a.folder) a.folder = `${artistById[a.artist].folder}/${a.title} (${a.year})`;
    a.artistName = artistById[a.artist].name;
  });

  // Flat song list with stable ids
  const songs = [];
  albums.forEach(a => a.tracks.forEach(([title, duration], i) => {
    songs.push({
      id: `${a.id}-${i + 1}`, title, duration, number: i + 1,
      album: a.id, artist: a.artistName, artistId: a.artist, folder: a.folder,
      file: (a.noMetadata ? title : `${String(i + 1).padStart(2, '0')} - ${title}`) + '.mp3',
      plays: (title.length * 7 + i * 13) % 41,
    });
  }));

  // Every folder in storage (for the system folder picker)
  const systemFolders = new Set(['Alarms', 'Android', 'DCIM', 'Documents', 'Download', 'Podcasts', 'Ringtones',
    'WhatsApp', 'WhatsApp/Media', 'WhatsApp/Media/WhatsApp Audio', 'WhatsApp/Media/WhatsApp Voice Notes']);
  albums.forEach(a => { const p = a.folder.split('/'); p.forEach((_, i) => systemFolders.add(p.slice(0, i + 1).join('/'))); });

  // Folders the user picked (SAF)
  const chosenFolders = [{ id: 'music', name: 'Music', location: 'Internal storage', path: 'Music' }];

  const playlists = [
    { id: 'sunday', name: 'Sunday morning', songs: ['elistom-1', 'clube-5', 'timmaia-2', 'acabou-5', 'construcao-6', 'refavela-4'] },
    { id: 'road', name: 'Road trip', songs: ['acabou-1', 'clube-3', 'transa-4', 'cabeca-2', 'expresso-3'] },
  ];

  // Lyrics (D21): <same name>.lrc → <same name>.txt → lyrics embedded in the audio file → none.
  // The texts are invented placeholders; the real lyrics of these songs are copyrighted.
  const VERSE_1 = ['Morning light across the window', 'Coffee cooling on the sill', 'Someone hums a song from somewhere', 'And the street is standing still'];
  const CHORUS = ['Turn it over, let it play', 'Side by side, we\'ll find our way', 'Every groove a little road', 'Every song a place to stay'];
  const VERSE_2 = ['Rain is tapping on the rooftop', 'Like a drummer keeping time', 'Old guitar beside the doorway', 'Waiting for another rhyme'];
  const BRIDGE = ['Slow it down, the needle\'s falling', 'Hear the crackle, hear the hum', 'Every ending is a turning', 'Of the record yet to come'];

  // A synced .lrc with the usual LRC features: header tags, offset, an empty line (instrumental
  // gap), word-level timestamps, and the chorus written once with three timestamps per line.
  const SYNCED_LRC = `[ar:Elis Regina]
[ti:Águas de Março]
[al:Elis & Tom]
[by:Vitrola Mp3 mockup]
[offset:+300]
[00:06.00]
[00:12.40]${VERSE_1[0]}
[00:17.10]${VERSE_1[1]}
[00:22.00]${VERSE_1[2]}
[00:27.30]${VERSE_1[3]}
[00:44.00][01:46.00][02:58.00]${CHORUS[0]}
[00:48.60][01:50.60][03:02.60]${CHORUS[1]}
[00:53.20][01:55.20][03:07.20]${CHORUS[2]}
[00:57.90][01:59.90][03:11.90]${CHORUS[3]}
[01:04.00]
[01:14.50]${VERSE_2[0]}
[01:20.00]<01:20.00>Like <01:20.40>a <01:20.70>drummer <01:21.40>keeping <01:22.00>time
[01:25.30]${VERSE_2[2]}
[01:30.80]${VERSE_2[3]}
[02:05.00]
[02:20.00]${BRIDGE[0]}
[02:26.40]${BRIDGE[1]}
[02:32.60]${BRIDGE[2]}
[02:38.80]${BRIDGE[3]}
[03:18.00]`;

  // LRC text stored inside the MP3's lyrics tag (some taggers do this): shown synced.
  const EMBEDDED_LRC = ['Streetlights blinking in the distance', 'Pages turning on their own', 'Half a melody remembered', 'Half a melody unknown']
    .flatMap((l, i) => [`[00:${String(10 + i * 6).padStart(2, '0')}.00]${l}`, `[01:${String(10 + i * 6).padStart(2, '0')}.00]${l}`]).join('\n');

  const stanzas = (...s) => s.map(x => x.join('\n')).join('\n\n');
  const lyrics = {
    'elistom-1': { source: 'lrc', text: SYNCED_LRC },
    'elistom-2': { source: 'txt', text: stanzas(VERSE_1, CHORUS, VERSE_2, CHORUS) },
    'elistom-3': { source: 'embedded', text: stanzas(VERSE_2, BRIDGE) },
    'elistom-4': { source: 'embedded', text: EMBEDDED_LRC },
    // elistom-5 has no lyrics
    'elistom-6': { source: 'lrc', text: `[ar:Elis Regina]\n[ti:Inútil Paisagem]\n${stanzas(BRIDGE, CHORUS)}` }, // .lrc without timestamps → plain
  };

  const favoriteSongs = ['elistom-1', 'clube-1', 'acabou-2', 'construcao-4'];
  const favoriteAlbums = ['clube', 'transa'];

  window.DATA = { artists, albums, songs, systemFolders: [...systemFolders], chosenFolders, playlists, favoriteSongs, favoriteAlbums, lyrics };
})();
