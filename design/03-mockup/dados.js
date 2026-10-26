// Dados de exemplo do mockup: uma biblioteca fictícia lida das pastas escolhidas.
// Durações em segundos. "pasta" é o caminho relativo dentro do armazenamento.
(function () {
  const d = (m, s) => m * 60 + s;

  const albuns = [
    { id: 'clube', titulo: 'Clube da Esquina', artista: 'Milton Nascimento', ano: 1972, pasta: 'Music/MPB/Clube da Esquina',
      faixas: [['Tudo Que Você Podia Ser', d(2, 58)], ['Cais', d(3, 45)], ['O Trem Azul', d(4, 5)], ['Nada Será Como Antes', d(3, 24)],
        ['Cravo e Canela', d(2, 31)], ['Um Girassol da Cor do Seu Cabelo', d(4, 13)], ['San Vicente', d(2, 47)], ['Clube da Esquina Nº 2', d(3, 39)]] },
    { id: 'acabou', titulo: 'Acabou Chorare', artista: 'Novos Baianos', ano: 1972, pasta: 'Music/MPB/Acabou Chorare',
      faixas: [['Brasil Pandeiro', d(4, 0)], ['Preta Pretinha', d(6, 41)], ['Tinindo Trincando', d(2, 53)], ['Swing de Campo Grande', d(2, 49)],
        ['Acabou Chorare', d(3, 46)], ['Mistério do Planeta', d(3, 32)]] },
    { id: 'elistom', titulo: 'Elis & Tom', artista: 'Elis Regina', ano: 1974, pasta: 'Music/MPB/Elis & Tom',
      faixas: [['Águas de Março', d(3, 32)], ['Pois É', d(2, 55)], ['Só Tinha de Ser com Você', d(4, 19)], ['Corcovado', d(3, 31)],
        ['Triste', d(2, 38)], ['Inútil Paisagem', d(2, 38)]] },
    { id: 'construcao', titulo: 'Construção', artista: 'Chico Buarque', ano: 1971, pasta: 'Music/MPB/Construção',
      faixas: [['Deus Lhe Pague', d(3, 19)], ['Cotidiano', d(2, 50)], ['Desalento', d(2, 46)], ['Construção', d(6, 24)],
        ['Cordão', d(2, 30)], ['Valsinha', d(2, 0)]] },
    { id: 'timmaia', titulo: 'Tim Maia', artista: 'Tim Maia', ano: 1970, pasta: 'Music/MPB/Tim Maia 1970',
      faixas: [['Azul da Cor do Mar', d(3, 57)], ['Primavera', d(2, 59)], ['Coroné Antonio Bento', d(2, 35)], ['Eu Amo Você', d(3, 3)]] },
    { id: 'transa', titulo: 'Transa', artista: 'Caetano Veloso', ano: 1972, pasta: 'Music/MPB/Transa',
      faixas: [['You Don\'t Know Me', d(3, 48)], ['Nine Out of Ten', d(4, 56)], ['Triste Bahia', d(9, 43)], ['It\'s a Long Way', d(6, 6)],
        ['Mora na Filosofia', d(6, 10)], ['Neolithic Man', d(4, 51)], ['Nostalgia', d(1, 17)]] },
    { id: 'refavela', titulo: 'Refavela', artista: 'Gilberto Gil', ano: 1977, pasta: 'Music/MPB/Refavela',
      faixas: [['Ilê Ayê', d(3, 46)], ['Aqui e Agora', d(4, 30)], ['Refavela', d(3, 53)], ['Sandra', d(4, 24)], ['Babá Alapalá', d(3, 58)]] },
    { id: 'cabeca', titulo: 'Cabeça Dinossauro', artista: 'Titãs', ano: 1986, pasta: 'Music/Rock/Cabeça Dinossauro',
      faixas: [['Cabeça Dinossauro', d(2, 20)], ['AA UU', d(3, 1)], ['Polícia', d(2, 6)], ['Homem Primata', d(3, 20)], ['Família', d(3, 30)]] },
    // Arquivos soltos, sem metadados de álbum: mostram como o app trata o "desconhecido"
    { id: 'diversos', titulo: 'Sem álbum', artista: 'Artista desconhecido', ano: null, pasta: 'Music/Diversos', semMetadados: true,
      faixas: [['gravacao_show_2019', d(5, 12)], ['ensaio_violao', d(2, 44)], ['faixa 07', d(3, 9)]] },
  ];

  // Lista plana de músicas, com id estável
  const musicas = [];
  albuns.forEach(a => a.faixas.forEach(([titulo, dur], i) => {
    musicas.push({
      id: `${a.id}-${i + 1}`, titulo, duracao: dur, numero: i + 1,
      album: a.id, artista: a.artista, pasta: a.pasta,
      arquivo: (a.semMetadados ? titulo : `${String(i + 1).padStart(2, '0')} - ${titulo}`) + '.mp3',
      tocadas: (titulo.length * 7 + i * 13) % 41,
    });
  }));

  // Pastas que o usuário escolheu (SAF)
  const pastasEscolhidas = [{ id: 'music', nome: 'Music', local: 'Memória interna', caminho: 'Music' }];

  // Pastas que aparecem no seletor do sistema
  const armazenamento = {
    '': ['Alarms', 'Android', 'DCIM', 'Documents', 'Download', 'Music', 'Podcasts', 'Ringtones', 'WhatsApp'],
    'Music': ['Diversos', 'MPB', 'Rock'],
    'Music/MPB': ['Acabou Chorare', 'Clube da Esquina', 'Construção', 'Elis & Tom', 'Refavela', 'Tim Maia 1970', 'Transa'],
    'Music/Rock': ['Cabeça Dinossauro'],
    'WhatsApp': ['Media'],
    'WhatsApp/Media': ['WhatsApp Audio', 'WhatsApp Voice Notes'],
    'Download': [],
    'Podcasts': [],
  };

  const playlists = [
    { id: 'domingo', nome: 'Domingo de manhã', musicas: ['elistom-1', 'clube-5', 'timmaia-2', 'acabou-5', 'construcao-6', 'refavela-4'] },
    { id: 'estrada', nome: 'Pé na estrada', musicas: ['acabou-1', 'clube-3', 'transa-4', 'cabeca-2', 'refavela-1'] },
  ];

  const favoritas = ['elistom-1', 'clube-1', 'acabou-2', 'construcao-4'];

  window.DADOS = { albuns, musicas, pastasEscolhidas, armazenamento, playlists, favoritas };
})();
