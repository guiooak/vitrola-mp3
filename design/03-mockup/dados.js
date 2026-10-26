// Dados de exemplo do mockup: uma biblioteca fictícia lida das pastas escolhidas.
//
// Estrutura das pastas (como o usuário organiza no celular):
//   Music/<Gênero>/<Artista>/artista.jpg          ← foto do artista
//   Music/<Gênero>/<Artista>/<Álbum>/capa.jpg     ← capa do álbum
//   Music/<Gênero>/<Artista>/<Álbum>/01 - Faixa.mp3
//
// No mockup as imagens são simuladas. Para testar com imagens de verdade,
// coloque o arquivo em design/03-mockup/imagens/ e preencha "url" no artista
// ou no álbum (ex.: url: 'imagens/milton.jpg').
(function () {
  const d = (m, s) => m * 60 + s;

  // foto: nome do arquivo de imagem na pasta do artista (null = pasta sem foto)
  const artistas = [
    { id: 'milton', nome: 'Milton Nascimento', pasta: 'Music/MPB/Milton Nascimento', foto: 'artista.jpg' },
    { id: 'novosbaianos', nome: 'Novos Baianos', pasta: 'Music/MPB/Novos Baianos', foto: 'artista.jpg' },
    { id: 'elis', nome: 'Elis Regina', pasta: 'Music/MPB/Elis Regina', foto: 'artista.jpg' },
    { id: 'chico', nome: 'Chico Buarque', pasta: 'Music/MPB/Chico Buarque', foto: 'artista.jpg' },
    { id: 'timmaia', nome: 'Tim Maia', pasta: 'Music/MPB/Tim Maia', foto: 'artista.jpg' },
    { id: 'caetano', nome: 'Caetano Veloso', pasta: 'Music/MPB/Caetano Veloso', foto: 'artista.jpg' },
    { id: 'gil', nome: 'Gilberto Gil', pasta: 'Music/MPB/Gilberto Gil', foto: 'artista.jpg' },
    // Sem foto na pasta: mostra o substituto com iniciais
    { id: 'titas', nome: 'Titãs', pasta: 'Music/Rock/Titãs', foto: null },
    { id: 'desconhecido', nome: 'Artista desconhecido', pasta: null, foto: null },
  ];

  // capa: nome do arquivo de imagem na pasta do álbum (null = pasta sem capa)
  const albuns = [
    { id: 'clube', titulo: 'Clube da Esquina', artista: 'milton', ano: 1972, capa: 'capa.jpg',
      faixas: [['Tudo Que Você Podia Ser', d(2, 58)], ['Cais', d(3, 45)], ['O Trem Azul', d(4, 5)], ['Nada Será Como Antes', d(3, 24)],
        ['Cravo e Canela', d(2, 31)], ['Um Girassol da Cor do Seu Cabelo', d(4, 13)], ['San Vicente', d(2, 47)], ['Clube da Esquina Nº 2', d(3, 39)]] },
    { id: 'acabou', titulo: 'Acabou Chorare', artista: 'novosbaianos', ano: 1972, capa: 'capa.jpg',
      faixas: [['Brasil Pandeiro', d(4, 0)], ['Preta Pretinha', d(6, 41)], ['Tinindo Trincando', d(2, 53)], ['Swing de Campo Grande', d(2, 49)],
        ['Acabou Chorare', d(3, 46)], ['Mistério do Planeta', d(3, 32)]] },
    { id: 'elistom', titulo: 'Elis & Tom', artista: 'elis', ano: 1974, capa: 'capa.jpg',
      faixas: [['Águas de Março', d(3, 32)], ['Pois É', d(2, 55)], ['Só Tinha de Ser com Você', d(4, 19)], ['Corcovado', d(3, 31)],
        ['Triste', d(2, 38)], ['Inútil Paisagem', d(2, 38)]] },
    { id: 'construcao', titulo: 'Construção', artista: 'chico', ano: 1971, capa: 'capa.jpg',
      faixas: [['Deus Lhe Pague', d(3, 19)], ['Cotidiano', d(2, 50)], ['Desalento', d(2, 46)], ['Construção', d(6, 24)],
        ['Cordão', d(2, 30)], ['Valsinha', d(2, 0)]] },
    { id: 'timmaia', titulo: 'Tim Maia', artista: 'timmaia', ano: 1970, capa: 'capa.jpg',
      faixas: [['Azul da Cor do Mar', d(3, 57)], ['Primavera', d(2, 59)], ['Coroné Antonio Bento', d(2, 35)], ['Eu Amo Você', d(3, 3)]] },
    { id: 'transa', titulo: 'Transa', artista: 'caetano', ano: 1972, capa: 'capa.jpg',
      faixas: [['You Don\'t Know Me', d(3, 48)], ['Nine Out of Ten', d(4, 56)], ['Triste Bahia', d(9, 43)], ['It\'s a Long Way', d(6, 6)],
        ['Mora na Filosofia', d(6, 10)], ['Neolithic Man', d(4, 51)], ['Nostalgia', d(1, 17)]] },
    { id: 'refavela', titulo: 'Refavela', artista: 'gil', ano: 1977, capa: 'capa.jpg',
      faixas: [['Ilê Ayê', d(3, 46)], ['Aqui e Agora', d(4, 30)], ['Refavela', d(3, 53)], ['Sandra', d(4, 24)], ['Babá Alapalá', d(3, 58)]] },
    { id: 'expresso', titulo: 'Expresso 2222', artista: 'gil', ano: 1972, capa: 'capa.jpg',
      faixas: [['Back in Bahia', d(4, 10)], ['O Canto da Ema', d(3, 25)], ['Expresso 2222', d(3, 23)], ['Oriente', d(6, 9)]] },
    // Sem capa na pasta: usa a capa gerada pelo app
    { id: 'cabeca', titulo: 'Cabeça Dinossauro', artista: 'titas', ano: 1986, capa: null,
      faixas: [['Cabeça Dinossauro', d(2, 20)], ['AA UU', d(3, 1)], ['Polícia', d(2, 6)], ['Homem Primata', d(3, 20)], ['Família', d(3, 30)]] },
    // Arquivos soltos, sem metadados nem pasta de artista/álbum
    { id: 'diversos', titulo: 'Sem álbum', artista: 'desconhecido', ano: null, capa: null, semMetadados: true, pasta: 'Music/Diversos',
      faixas: [['gravacao_show_2019', d(5, 12)], ['ensaio_violao', d(2, 44)], ['faixa 07', d(3, 9)]] },
  ];

  // Caminho da pasta de cada álbum: <pasta do artista>/<Álbum (ano)>
  const artistaPorId = Object.fromEntries(artistas.map(a => [a.id, a]));
  albuns.forEach(a => {
    if (!a.pasta) a.pasta = `${artistaPorId[a.artista].pasta}/${a.titulo} (${a.ano})`;
    a.artistaNome = artistaPorId[a.artista].nome;
  });

  // Lista plana de músicas, com id estável
  const musicas = [];
  albuns.forEach(a => a.faixas.forEach(([titulo, dur], i) => {
    musicas.push({
      id: `${a.id}-${i + 1}`, titulo, duracao: dur, numero: i + 1,
      album: a.id, artista: a.artistaNome, artistaId: a.artista, pasta: a.pasta,
      arquivo: (a.semMetadados ? titulo : `${String(i + 1).padStart(2, '0')} - ${titulo}`) + '.mp3',
      tocadas: (titulo.length * 7 + i * 13) % 41,
    });
  }));

  // Todas as pastas do armazenamento (para o seletor do sistema)
  const pastasSistema = new Set(['Alarms', 'Android', 'DCIM', 'Documents', 'Download', 'Podcasts', 'Ringtones',
    'WhatsApp', 'WhatsApp/Media', 'WhatsApp/Media/WhatsApp Audio', 'WhatsApp/Media/WhatsApp Voice Notes']);
  albuns.forEach(a => { const p = a.pasta.split('/'); p.forEach((_, i) => pastasSistema.add(p.slice(0, i + 1).join('/'))); });

  // Pastas que o usuário escolheu (SAF)
  const pastasEscolhidas = [{ id: 'music', nome: 'Music', local: 'Memória interna', caminho: 'Music' }];

  const playlists = [
    { id: 'domingo', nome: 'Domingo de manhã', musicas: ['elistom-1', 'clube-5', 'timmaia-2', 'acabou-5', 'construcao-6', 'refavela-4'] },
    { id: 'estrada', nome: 'Pé na estrada', musicas: ['acabou-1', 'clube-3', 'transa-4', 'cabeca-2', 'expresso-3'] },
  ];

  const favoritas = ['elistom-1', 'clube-1', 'acabou-2', 'construcao-4'];
  const albunsFavoritos = ['clube', 'transa'];

  window.DADOS = { artistas, albuns, musicas, pastasSistema: [...pastasSistema], pastasEscolhidas, playlists, favoritas, albunsFavoritos };
})();
