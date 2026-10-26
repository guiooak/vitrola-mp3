# Etapa 3 · Mockup HTML

**Status:** pronto para validação (25/10/2026) · arquivos em [`design/03-mockup/`](../../design/03-mockup/)

Um app navegável no navegador para validar telas, fluxos e interações antes de escrever código Android. É "seco": HTML, CSS e um pouco de JavaScript para navegação, animações e um player simulado (o tempo passa, mas não sai som).

## Como abrir

```bash
python3 -m http.server 8765 --directory design
```

Abra http://localhost:8765/03-mockup/. Também funciona abrindo `design/03-mockup/index.html` direto no navegador.

- **No computador:** o app aparece num quadro de celular, com um **painel** ao lado para pular para qualquer tela, simular situações, trocar o tema e ler uma nota sobre a tela atual.
- **No celular:** o app ocupa a tela toda. O painel abre pela aba na borda esquerda.

## Telas

| # | Tela | O que validar |
|---|---|---|
| 1 | **Boas-vindas** | As três promessas (só as pastas escolhidas, toca com a tela apagada, nada sai do celular) e o botão "Escolher pasta de músicas". |
| 2 | **Seletor de pasta** | É a tela do **Android** (SAF), não do app, e tem estilo de sistema de propósito. A raiz e "Download" são bloqueadas, como no Android real. Depois vem o pedido "Permitir acesso". |
| 3 | **Escaneamento** | Progresso arquivo por arquivo e resumo final ("50 músicas em 9 álbuns"). Escolhendo "WhatsApp", aparece o caso sem músicas. |
| 4 | **Biblioteca** | Filtros Músicas / Álbuns / Artistas / Pastas. Tocar e Aleatório. Ordenação A–Z, recentes e mais tocadas. |
| 5 | **Álbum** | Capa grande, faixas numeradas, pasta de origem no rodapé. O álbum "Sem álbum" mostra como ficam arquivos sem metadados. |
| 6 | **Artista** | Foto grande do artista no topo, com o nome por cima, e depois álbuns e músicas. Sem foto, a capa do álbum vira um fundo desfocado. |
| 7 | **Pasta** | Navegação pela estrutura de pastas. Pastas de artista mostram a foto, pastas de álbum mostram a capa, e as imagens reconhecidas aparecem destacadas. |
| 8 | **Busca** | Resultados sempre em três seções separadas: **Artistas**, **Álbuns** e **Músicas**. Cada camada traz o que bate com o texto e o que está ligado a isso (ver [regras da busca](#regras-da-busca)). Ignora acentos ("aguas" acha "Águas de Março"). Mostra buscas recentes e artistas para explorar. |
| 9 | **Playlists** | Automáticas (Músicas favoritas, Álbuns favoritos, Mais tocadas, Adicionadas recentemente) e as do usuário, com capa em mosaico. |
| 10 | **Playlist** | Tocar, Aleatório, renomear e excluir (com desfazer). |
| 11 | **Ajustes** | Adicionar e remover pastas (com desfazer), incluir subpastas, procurar músicas novas, timer, retomar de onde parou, pausar ao tirar o fone, dica de bateria e tema. |
| 12 | **Tocando agora** | A capa vira o selo do disco. O braço desce ao tocar e sobe ao pausar, e o disco desacelera. O fundo ganha um toque da cor da capa. Favoritar, aleatório, repetir (todas / uma) e barra de progresso arrastável. |
| 13 | **Fila** | O que já tocou, o que toca agora e o que vem a seguir. Pular para uma música ou tirá-la da fila. |
| 14 | **Menu da música** | Tocar a seguir, adicionar à fila, adicionar à playlist, favoritar, ir para álbum ou artista, e detalhes do arquivo. |
| 15 | **Timer para dormir** | 15 / 30 / 45 / 60 min ou "no fim desta música", com contagem no player e nos ajustes. |
| 16 | **Biblioteca vazia** | Estado sem nenhuma pasta escolhida. |

## Fotos de artista e capas de álbum

O usuário organiza as músicas assim, com uma imagem em cada pasta:

```
Music/
  MPB/
    Gilberto Gil/
      artista.jpg              ← foto do artista
      Refavela (1977)/
        capa.jpg               ← capa do álbum
        01 - Ilê Ayê.mp3
```

**Nomes reconhecidos** (sem diferenciar maiúsculas; `.jpg`, `.jpeg`, `.png` ou `.webp`):

| Imagem | Nomes aceitos, em ordem de preferência |
|---|---|
| Foto do artista (na pasta do artista) | `artista`, `artist`, `foto`, `photo` |
| Capa do álbum (na pasta do álbum) | `capa`, `cover`, `folder`, `front`, `album` |

**Quando não há imagem** (o visual atual vira o substituto):

| | 1º | 2º | 3º |
|---|---|---|---|
| **Capa do álbum** | imagem na pasta do álbum | capa embutida no MP3 | capa gerada pelo app (cor da paleta + iniciais) |
| **Foto do artista** | imagem na pasta do artista | capa do primeiro álbum do artista, em círculo | capa gerada |

**Onde as imagens aparecem:**

| Lugar | Foto do artista | Capa do álbum |
|---|---|---|
| Biblioteca › Artistas | Grade de círculos (3 por linha) | — |
| Biblioteca › Álbuns, listas, fila, menus | — | Quadrada, cantos arredondados |
| Página do artista | Grande no topo (largura total, 320dp de altura), com o nome por cima e degradê para o fundo. Sem foto, a capa vira fundo desfocado | Álbuns em rolagem lateral |
| Página do álbum | Chip com foto pequena (28dp) e nome | Grande (220dp) |
| Tocando agora | Foto pequena (24dp) ao lado do nome | Selo do disco e cor de fundo |
| Busca | Círculos na seção Artistas | Seção Álbuns |
| Pastas | Pasta de artista com foto redonda | Pasta de álbum com capa |
| Notificação e tela de bloqueio | — | Miniatura |

**Recorte:** a capa é sempre quadrada, com recorte central. A foto do artista aparece em círculo e em faixa larga, e o recorte privilegia a parte de cima, onde costuma estar o rosto. Tamanho recomendado: capas com pelo menos 600×600px e fotos com pelo menos 1000px de largura.

**Ajuste:** em Ajustes, "Usar fotos e capas das pastas" liga e desliga o uso dessas imagens. Desligado, o app usa as capas embutidas ou as geradas.

**No mockup** as imagens são simuladas. Fotos e capas "fotográficas" indicam que há imagem na pasta, e o visual antigo indica o substituto. Titãs e "Cabeça Dinossauro" estão sem imagem para mostrar o substituto. Para testar com imagens reais, coloque os arquivos em `design/03-mockup/imagens/` e preencha `url` no artista ou álbum em `dados.js`.

## Favoritos

Músicas e álbuns podem ser favoritados com o **coração**.

| | Música | Álbum |
|---|---|---|
| **Onde favoritar** | Coração no "tocando agora", menu ⋮ da música, notificação | Coração ao lado de Tocar/Aleatório na página do álbum, menu ⋮ do álbum |
| **Indicador** | Coraçãozinho vinho ao lado da duração, nas listas | Selo com coração no canto da capa, nos cartões de álbum |
| **Onde aparecem** | Playlists › Músicas favoritas | Playlists › Álbuns favoritos (grade de capas) |
| **Aviso** | "Adicionada às músicas favoritas", com Desfazer | "Álbum adicionado aos favoritos", com Desfazer |

Favoritar um álbum **não** favorita as músicas dele: são duas listas independentes. O álbum "Sem álbum" (arquivos sem metadados) não pode ser favoritado.

## Regras da busca

A busca sempre mostra as três camadas, cada uma na sua seção e nesta ordem: **Artistas → Álbuns → Músicas**.

1. **Resultado direto:** artistas pelo nome, álbuns pelo título, músicas pelo título ou nome do arquivo. Ignora acentos e maiúsculas. O que **começa** com o texto vem antes do que só **contém**.
2. **Resultados ligados:** cada camada também traz o que está ligado aos resultados diretos das outras:
   - Artistas: os dos álbuns e músicas encontrados.
   - Álbuns: os dos artistas e músicas encontrados.
   - Músicas: as dos artistas e álbuns encontrados.
3. **Ordem:** os resultados diretos aparecem antes dos ligados.
4. **Músicas:** mostra as 6 primeiras e um botão "Ver todas as N músicas". O botão volta ao padrão quando o texto muda.
5. **Contagem:** cada seção mostra quantos itens tem.
6. **Nada encontrado:** só aparece quando nenhuma camada tem resultado direto.

Exemplo: buscar "águas" traz Elis Regina (artista), Elis & Tom (álbum) e Águas de Março (música).

## Simulações (painel)

| Simulação | O que mostra |
|---|---|
| Notificação de mídia | Controles na notificação do Android, sincronizados com o player |
| Tela de bloqueio | Controles com o celular bloqueado |
| Fechar e reabrir o app | "Retomar de onde parou": a última música fica pronta, com aviso e botão "Tocar" |
| Desconectar o fone | Pausa automática (ou não, se a opção estiver desligada) |
| Arquivo com problema | Pula para a próxima com o aviso "Não deu para tocar…" |
| Perder acesso à pasta | Diálogo pedindo para escolher a pasta de novo |
| Começar do zero | Volta às boas-vindas |

## Decisões tomadas no mockup

- **Navegação:** 4 abas (Biblioteca, Playlists, Buscar, Ajustes), com o mini player fixo acima delas.
- **Biblioteca:** uma aba só, com filtros em chips, no lugar de quatro abas separadas.
- **Gestão de pastas fica em Ajustes:** a aba "Pastas" da biblioteca é só para navegar.
- **Busca em camadas:** artistas, álbuns e músicas sempre em seções separadas, com os itens ligados entre si.
- **Ações destrutivas** (remover pasta, excluir playlist, tirar da fila) pedem confirmação quando não dá para desfazer, ou mostram "Desfazer" no aviso.
- **Arquivos sem metadados** aparecem pelo nome do arquivo, agrupados em "Sem álbum" e "Artista desconhecido".
- **Transparência:** o app sempre deixa visível de onde vem cada música (pasta no rodapé do álbum, "Detalhes do arquivo").

## Fora do mockup (fica para o app)

- Arrastar para reordenar a fila (o ícone aparece, mas não funciona)
- Som de verdade, leitura real de metadados e capas embutidas
- Gestos de deslizar (fechar o player arrastando para baixo, por exemplo)
- Android Auto, widget e equalizador

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura: painel, quadro do celular, barras e áreas de sobreposição |
| `mockup.css` | Estilos, usando só os tokens do style guide (`../02-style-guide/tokens.css`) |
| `mockup.js` | Navegação, telas, player simulado, folhas, diálogos, avisos e simulações |
| `dados.js` | Biblioteca de exemplo (9 álbuns, 50 músicas), pastas e playlists |
