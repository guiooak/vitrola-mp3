# Etapa 2 · Style guide

**Status:** aprovado em 25/10/2026 · guia visual interativo em [`design/02-style-guide/style-guide.html`](../../design/02-style-guide/style-guide.html)

Este documento resume as regras. O HTML mostra tudo funcionando: componentes clicáveis, contraste calculado na hora, e temas claro e escuro.

## Fonte da verdade: tokens

Cores, tipografia, espaços, raios, sombras e movimento ficam em [`tokens.json`](../../design/02-style-guide/tokens.json). Os arquivos `tokens.css` (para o mockup) e `tokens.js` (para a página do guia) são gerados a partir dele:

```bash
python3 design/02-style-guide/gerar_tokens.py
```

Nunca edite `tokens.css` ou `tokens.js` à mão. No app, o mesmo `tokens.json` vai virar o tema do Compose (ver [Mapeamento para o app](#mapeamento-para-o-app)).

## Princípios

1. **Calor analógico:** creme, vinho e mostarda no lugar do cinza frio.
2. **A música em primeiro lugar:** a capa e o disco são as estrelas, e a interface recua.
3. **Simples como pôr um disco:** tarefas comuns em no máximo dois toques.
4. **Para todo mundo:** contraste AA, toque de 48dp, respeito ao "reduzir movimento".

## Cores

### Escalas primitivas

| Passo | Vinho | Mostarda | Neutro quente |
|---|---|---|---|
| 0 | | | `#FFFDF8` |
| 50 | `#FBEDEF` | `#FDF6E3` | `#FAF6EE` |
| 100 | `#F5D5DA` | `#FAE9B8` | `#F3E9D2` (creme) |
| 200 | `#E9A9B3` | `#F4D27A` | `#E6DAC0` |
| 300 | `#D67887` | `#ECBD48` | `#CFC8B8` (metal) |
| 400 | `#BC4A5D` | `#E0A526` (marca) | `#A89F90` |
| 500 | `#9E2F42` | `#C08A17` | `#7D7468` |
| 600 | `#7A1F2B` (marca) | `#9A6D10` | `#5A5148` |
| 700 | `#631824` | `#74510C` | `#3A322C` (sulco) |
| 800 | `#4B121B` | `#4F3708` | `#26201C` |
| 900 | `#330B12` | `#2E2005` | `#1B1714` (vinil) |
| 950 | | | `#120F0D` |

### Cores com função

Os componentes usam **só estas**, nunca as primitivas direto.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `fundo` | `#FAF6EE` | `#120F0D` | Fundo das telas |
| `superficie` | `#FFFDF8` | `#1B1714` | Cards, listas, folhas |
| `superficie-2` | `#F3E9D2` | `#26201C` | Mini player, campos, áreas agrupadas |
| `superficie-3` | `#E6DAC0` | `#3A322C` | Trilhas, divisões fortes |
| `texto` | `#1B1714` | `#F3E9D2` | Texto principal |
| `texto-2` | `#5A5148` | `#CFC8B8` | Texto secundário (artista) |
| `texto-3` | `#6E655A` | `#A89F90` | Legendas, placeholders |
| `borda` | `#E6DAC0` | `#3A322C` | Divisores |
| `borda-forte` | `#A89F90` | `#5A5148` | Contornos de controles |
| `primaria` | `#7A1F2B` | `#D67887` | Ação principal, item ativo |
| `sobre-primaria` | `#FFFDF8` | `#330B12` | Texto sobre a primária |
| `primaria-container` | `#F5D5DA` | `#631824` | Botão tonal, aba ativa |
| `sobre-primaria-container` | `#4B121B` | `#F5D5DA` | Texto sobre o container |
| `destaque` | `#E0A526` | `#ECBD48` | Tocar, controle da barra, equalizador |
| `sobre-destaque` | `#1B1714` | `#2E2005` | Texto sobre o destaque |
| `destaque-container` | `#FAE9B8` | `#4F3708` | Ícones de pasta, avisos leves |
| `sobre-destaque-container` | `#4F3708` | `#FAE9B8` | Texto sobre o container de destaque |
| `erro` | `#B3261E` | `#F2B8B5` | Erros, ações destrutivas |
| `sucesso` | `#2E7D4F` | `#7FD1A0` | Confirmações |
| `acao-aviso` | `#E0A526` | `#7A1F2B` | Ação dentro do snackbar |
| `disco` / `sulco` / `metal` | — | — | Desenho do vinil e do braço |
| `veu` | 45% vinil | 60% preto | Fundo atrás de diálogos |

### Regras

- Todo texto passa em **AA (4,5:1)** e todo ícone em **3:1**, nos dois temas. A página do guia mostra a conta.
- **Mostarda nunca é cor de texto** sobre fundo claro. Ela é só preenchimento, com texto escuro em cima.
- O app **não usa cor dinâmica** (Material You). A identidade é fixa, mas o ícone temático do Android 13+ continua acompanhando o papel de parede.

## Tipografia

| Família | Papel | Pesos |
|---|---|---|
| **Fraunces** | Marca: títulos, nome de álbum, "tocando agora". Só a partir de 22sp. | 600–800 |
| **Outfit** | Interface: listas, botões, tempos | 400–600 |

| Estilo | Fonte | Tamanho/altura | Uso |
|---|---|---|---|
| `display` | Fraunces 800 | 40/44 | Boas-vindas |
| `titulo` | Fraunces 700 | 28/34 | Nome do álbum, títulos de tela |
| `titulo-m` | Fraunces 600 | 22/28 | Música no player, diálogos |
| `subtitulo` | Outfit 600 | 18/24 | Seções |
| `corpo` | Outfit 400 | 16/24 | Textos |
| `corpo-p` | Outfit 400 | 14/20 | Artista, detalhes |
| `rotulo` | Outfit 500 | 14/20 | Botões, títulos na lista |
| `legenda` | Outfit 400 | 12/16 | Tempos, contagens |
| `sobrelinha` | Outfit 600 | 11/16, maiúsculas | Rótulos de seção |

Tempos e contagens usam números de largura fixa (`tabular-nums`), para não "pularem" enquanto a música toca.

## Espaço e forma

- **Espaçamento** (grade de 4dp): 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64
- **Raios:** `xs` 6 · `p` 10 · `m` 14 · `g` 20 · `gg` 28 · `total` (pílula)
- **Elevação:** 3 níveis de sombra quente (marrom, não preto). No tema escuro, a elevação aparece mais pela cor da superfície.

## Ícones

**Material Symbols Rounded**, peso 400, 24dp. Contorno no estado normal e preenchido no item ativo (aba atual, favorito marcado). Os controles de reprodução usam a versão preenchida.

## Componentes

Todos estão interativos no guia.

| Componente | Regras principais |
|---|---|
| **Botões** | Primário (vinho): no máximo um por tela. Tonal: secundário. Destaque (mostarda): "tocar", com moderação. Contorno e texto: baixo peso. Altura 48dp, forma de pílula. |
| **Controles do player** | Play de 72dp que vira quadrado arredondado ao tocar. Aleatório e repetir ativos ficam em vinho com um ponto. Repetir alterna desligado → todas → uma. |
| **Barra de progresso** | Trilha de 6dp, preenchimento vinho e controle mostarda (como a cápsula do braço). Tempos com números de largura fixa. |
| **Disco "tocando agora"** | A capa do álbum vira o selo do disco, que gira a 33⅓ rpm (1,8s por volta) e desacelera ao pausar. |
| **Filtros** | Chips Músicas / Álbuns / Artistas / Pastas. O selecionado fica vinho e ganha ✓. |
| **Item de música** | Capa 48dp, título, artista, duração e menu. A música atual tem título vinho e equalizador animado sobre a capa. |
| **Capa padrão** | Para MP3 sem capa: gerada a partir do nome do álbum, com cor da paleta, sulcos e iniciais em Fraunces. Determinística: o mesmo álbum sempre recebe a mesma capa. |
| **Foto do artista** | Imagem da pasta do artista, em círculo (listas, busca) ou em faixa larga (página do artista). Sem foto, usa a capa do primeiro álbum. Detalhes em [03-mockup.md](03-mockup.md#fotos-de-artista-e-capas-de-álbum). |
| **Mini player** | Fixo acima da navegação, com disco girando, título, play e próxima, e progresso em linha fina no topo. |
| **Navegação inferior** | 4 abas com indicador em pílula. As abas são provisórias e serão definidas no mockup. |
| **Busca, pastas, ajustes** | Campo em pílula. Linhas de 64dp com ícone em quadrado. Switch para opções. |
| **Escaneamento** | Barra com listras animadas e contagem "412 / 664". |
| **Aviso e diálogo** | O snackbar usa a cor `acao-aviso`. Diálogos destrutivos explicam a consequência ("os arquivos continuam no seu celular"). |
| **Estado vazio** | Disco vazio ilustrado, título amigável e a ação principal. |

## Movimento

| Token | Valor | Uso |
|---|---|---|
| `rapida` | 150ms | Toques, hover, troca de estado |
| `media` | 300ms | Switches, abas, morph do play |
| `longa` | 500ms | Mini player → tela cheia |
| `braco` | 700ms | Braço da vitrola descendo e subindo |
| `volta-disco` | 1800ms | Uma volta do disco (33⅓ rpm) |

Curvas: `padrao` (0.2, 0, 0, 1) · `entrada` (0.05, 0.7, 0.1, 1) · `saida` (0.3, 0, 0.8, 0.15) · `braco` (0.4, 0.1, 0.2, 1).

O movimento imita o físico: o disco tem peso e o braço desce devagar. Nada pisca nem quica. Com **"reduzir movimento"** ligado no celular, o disco fica parado e as transições viram um esmaecimento rápido.

## Voz e tom

Português do Brasil, frases curtas, tom de amigo que entende de música. A metáfora da vitrola aparece em momentos especiais (estado vazio, boas-vindas), nunca em botões.

| Situação | ✓ Assim | ✕ Não assim |
|---|---|---|
| Botão de pasta | Escolher pasta | Selecionar diretório de mídia |
| Biblioteca vazia | Nenhum disco na vitrola | Erro: nenhum arquivo encontrado |
| Escaneando | Procurando músicas… 412 de 664 | Indexando arquivos (62%) |
| Arquivo com problema | Não deu para tocar "faixa 07.mp3". Pulamos para a próxima. | Exceção de decodificação de mídia |
| Permissão perdida | Perdemos o acesso à pasta "Music". Escolha de novo para continuar. | URI permission revoked |

## Acessibilidade

- Contraste AA em texto (4,5:1) e ícones (3:1), nos dois temas.
- Alvo de toque de no mínimo 48dp.
- Descrição para leitor de tela em todo botão só com ícone ("Próxima música").
- Respeitar "reduzir movimento".
- Tamanhos em sp. O layout aguenta fonte em 200%, usando reticências quando preciso.
- O estado nunca depende só de cor (ponto em aleatório e repetir, ✓ no chip).

## Mapeamento para o app

| Token | Jetpack Compose (Material 3) |
|---|---|
| `primaria` / `sobre-primaria` | `colorScheme.primary` / `onPrimary` |
| `primaria-container` | `colorScheme.primaryContainer` |
| `destaque` / `destaque-container` | `colorScheme.secondary` / `secondaryContainer` |
| `fundo`, `superficie`, `superficie-2`, `superficie-3` | `background`, `surface`, `surfaceContainer`, `surfaceContainerHigh` |
| `texto` / `texto-2` | `onSurface` / `onSurfaceVariant` |
| `borda` / `borda-forte` | `outlineVariant` / `outline` |
| `tipo-*` | `Typography(...)` com `FontFamily` Fraunces e Outfit |
| `raio-*` | `Shapes(...)` |
| `disco`, `sulco`, `metal`, `duracao-*`, `curva-*` | Objeto próprio `VitrolaTokens` via `CompositionLocal` |
