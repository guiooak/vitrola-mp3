// Sample data for the mockup: a fictional library read from the chosen folders.
//
// Folder layout (how the user organizes music on the phone):
//   Music/<Genre>/<Artist>/artist.jpg          ← artist photo
//   Music/<Genre>/<Artist>/<Album>/cover.jpg   ← album cover
//   Music/<Genre>/<Artist>/<Album>/01 - Track.mp3
//
// Images are simulated in the mockup. To try real images, put a file in
// design/03-mockup/images/ and set "url" on the artist or album
// (e.g. url: 'images/milton.jpg').
(function () {
  const d = (m, s) => m * 60 + s;

  // photo: image file name inside the artist folder (null = folder has no photo)
  const artists = [
    { id: 'milton', name: 'Milton Nascimento', folder: 'Music/MPB/Milton Nascimento', photo: 'artist.jpg' },
    { id: 'novosbaianos', name: 'Novos Baianos', folder: 'Music/MPB/Novos Baianos', photo: 'artist.jpg' },
    { id: 'elis', name: 'Elis Regina', folder: 'Music/MPB/Elis Regina', photo: 'artist.jpg' },
    { id: 'chico', name: 'Chico Buarque', folder: 'Music/MPB/Chico Buarque', photo: 'artist.jpg' },
    { id: 'timmaia', name: 'Tim Maia', folder: 'Music/MPB/Tim Maia', photo: 'artist.jpg' },
    { id: 'caetano', name: 'Caetano Veloso', folder: 'Music/MPB/Caetano Veloso', photo: 'artist.jpg' },
    { id: 'gil', name: 'Gilberto Gil', folder: 'Music/MPB/Gilberto Gil', photo: 'artist.jpg' },
    // No photo in the folder: shows the fallback
    { id: 'titas', name: 'Titãs', folder: 'Music/Rock/Titãs', photo: null },
    { id: 'unknown', name: 'Unknown artist', folder: null, photo: null },
  ];

  // cover: image file name inside the album folder (null = folder has no cover)
  const albums = [
    { id: 'clube', title: 'Clube da Esquina', artist: 'milton', year: 1972, cover: 'cover.jpg',
      tracks: [['Tudo Que Você Podia Ser', d(2, 58)], ['Cais', d(3, 45)], ['O Trem Azul', d(4, 5)], ['Nada Será Como Antes', d(3, 24)],
        ['Cravo e Canela', d(2, 31)], ['Um Girassol da Cor do Seu Cabelo', d(4, 13)], ['San Vicente', d(2, 47)], ['Clube da Esquina Nº 2', d(3, 39)]] },
    { id: 'acabou', title: 'Acabou Chorare', artist: 'novosbaianos', year: 1972, cover: 'cover.jpg',
      tracks: [['Brasil Pandeiro', d(4, 0)], ['Preta Pretinha', d(6, 41)], ['Tinindo Trincando', d(2, 53)], ['Swing de Campo Grande', d(2, 49)],
        ['Acabou Chorare', d(3, 46)], ['Mistério do Planeta', d(3, 32)]] },
    { id: 'elistom', title: 'Elis & Tom', artist: 'elis', year: 1974, cover: 'cover.jpg',
      tracks: [['Águas de Março', d(3, 32)], ['Pois É', d(2, 55)], ['Só Tinha de Ser com Você', d(4, 19)], ['Corcovado', d(3, 31)],
        ['Triste', d(2, 38)], ['Inútil Paisagem', d(2, 38)]] },
    { id: 'construcao', title: 'Construção', artist: 'chico', year: 1971, cover: 'cover.jpg',
      tracks: [['Deus Lhe Pague', d(3, 19)], ['Cotidiano', d(2, 50)], ['Desalento', d(2, 46)], ['Construção', d(6, 24)],
        ['Cordão', d(2, 30)], ['Valsinha', d(2, 0)]] },
    { id: 'timmaia', title: 'Tim Maia', artist: 'timmaia', year: 1970, cover: 'cover.jpg',
      tracks: [['Azul da Cor do Mar', d(3, 57)], ['Primavera', d(2, 59)], ['Coroné Antonio Bento', d(2, 35)], ['Eu Amo Você', d(3, 3)]] },
    { id: 'transa', title: 'Transa', artist: 'caetano', year: 1972, cover: 'cover.jpg',
      tracks: [['You Don\'t Know Me', d(3, 48)], ['Nine Out of Ten', d(4, 56)], ['Triste Bahia', d(9, 43)], ['It\'s a Long Way', d(6, 6)],
        ['Mora na Filosofia', d(6, 10)], ['Neolithic Man', d(4, 51)], ['Nostalgia', d(1, 17)]] },
    { id: 'refavela', title: 'Refavela', artist: 'gil', year: 1977, cover: 'cover.jpg',
      tracks: [['Ilê Ayê', d(3, 46)], ['Aqui e Agora', d(4, 30)], ['Refavela', d(3, 53)], ['Sandra', d(4, 24)], ['Babá Alapalá', d(3, 58)]] },
    { id: 'expresso', title: 'Expresso 2222', artist: 'gil', year: 1972, cover: 'cover.jpg',
      tracks: [['Back in Bahia', d(4, 10)], ['O Canto da Ema', d(3, 25)], ['Expresso 2222', d(3, 23)], ['Oriente', d(6, 9)]] },
    // No cover in the folder: uses the app-generated cover
    { id: 'cabeca', title: 'Cabeça Dinossauro', artist: 'titas', year: 1986, cover: null,
      tracks: [['Cabeça Dinossauro', d(2, 20)], ['AA UU', d(3, 1)], ['Polícia', d(2, 6)], ['Homem Primata', d(3, 20)], ['Família', d(3, 30)]] },
    // Loose files with no metadata and no artist/album folder
    { id: 'misc', title: 'Unknown album', artist: 'unknown', year: null, cover: null, noMetadata: true, folder: 'Music/Misc',
      tracks: [['live_show_2019', d(5, 12)], ['guitar_rehearsal', d(2, 44)], ['track 07', d(3, 9)]] },
  ];

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

  const favoriteSongs = ['elistom-1', 'clube-1', 'acabou-2', 'construcao-4'];
  const favoriteAlbums = ['clube', 'transa'];

  window.DATA = { artists, albums, songs, systemFolders: [...systemFolders], chosenFolders, playlists, favoriteSongs, favoriteAlbums };
})();
