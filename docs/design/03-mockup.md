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
| 6 | **Artista** | Álbuns em rolagem lateral e todas as músicas. |
| 7 | **Pasta** | Navegação pela estrutura de pastas, com o nome real dos arquivos. |
| 8 | **Busca** | Busca instantânea ignorando acentos ("aguas" acha "Águas de Março"), buscas recentes e artistas para explorar. |
| 9 | **Playlists** | Automáticas (Favoritas, Mais tocadas, Adicionadas recentemente) e as do usuário, com capa em mosaico. |
| 10 | **Playlist** | Tocar, Aleatório, renomear e excluir (com desfazer). |
| 11 | **Ajustes** | Adicionar e remover pastas (com desfazer), incluir subpastas, procurar músicas novas, timer, retomar de onde parou, pausar ao tirar o fone, dica de bateria e tema. |
| 12 | **Tocando agora** | A capa vira o selo do disco. O braço desce ao tocar e sobe ao pausar, e o disco desacelera. O fundo ganha um toque da cor da capa. Favoritar, aleatório, repetir (todas / uma) e barra de progresso arrastável. |
| 13 | **Fila** | O que já tocou, o que toca agora e o que vem a seguir. Pular para uma música ou tirá-la da fila. |
| 14 | **Menu da música** | Tocar a seguir, adicionar à fila, adicionar à playlist, favoritar, ir para álbum ou artista, e detalhes do arquivo. |
| 15 | **Timer para dormir** | 15 / 30 / 45 / 60 min ou "no fim desta música", com contagem no player e nos ajustes. |
| 16 | **Biblioteca vazia** | Estado sem nenhuma pasta escolhida. |

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
