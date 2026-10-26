# Decisões do projeto

Registro das decisões de produto e técnica, com o motivo de cada uma. As mais novas ficam no fim.

---

### D1 · Objetivo: uso pessoal, pronto para a Play Store
**25/10/2026**

O app nasce para uso pessoal, mas pode ir para a Play Store depois. Por isso, desde o início:
- o nome do pacote é definitivo;
- o Android alvo (`targetSdk`) é recente;
- a chave de assinatura é guardada com backup;
- o app não pede permissões amplas e não coleta dados.

### D2 · Nome e identificador
**25/10/2026**

- Nome: **Vitrola Mp3**
- Pacote (`applicationId`): **`com.guioak.vitrolamp3`**. O Android não aceita hífen, por isso não ficou `vitrola-mp3`.

### D3 · Biblioteca só das pastas escolhidas (SAF)
**25/10/2026**

O usuário escolhe uma ou mais pastas pelo seletor do sistema (`ACTION_OPEN_DOCUMENT_TREE`), e o app guarda a permissão de forma permanente (`takePersistableUriPermission`).

- **Por quê:** evitar que áudios indesejados (WhatsApp, gravações) entrem na biblioteca. O app também não precisa da permissão ampla `READ_MEDIA_AUDIO`, o que é melhor para a privacidade e para a Play Store.
- **Consequência:** escanear via SAF é mais lento que via MediaStore. O índice fica salvo em um banco local (Room) e cada novo escaneamento só verifica o que mudou (`lastModified`). Os metadados são lidos com `MediaMetadataRetriever`.
- **Alternativa descartada:** filtrar o MediaStore por caminho. É mais rápido, mas exige acesso a todos os áudios do aparelho.

### D4 · Reprodução contínua em segundo plano
**25/10/2026**

Um serviço `MediaSessionService` (Media3) roda em primeiro plano, do tipo `mediaPlayback`, e a interface só envia comandos para ele.

- **Inclui:** wake lock, audio focus (pausa em ligações), pausa ao desconectar o fone, notificação com controles, tela de bloqueio, fone Bluetooth e retomar de onde parou.
- **Atenção:** fabricantes como Xiaomi e Samsung podem matar apps em segundo plano. Vale orientar o usuário a liberar o app da otimização de bateria.

### D5 · Stack técnica proposta
**25/10/2026**

Kotlin · Jetpack Compose · Media3 (ExoPlayer) · Room · Hilt · WorkManager · Android 8+ (`minSdk 26`). O app aceita qualquer formato que o ExoPlayer toca (MP3, FLAC, M4A, OGG, WAV).

### D6 · Design antes do código
**25/10/2026**

Ordem de trabalho: **logo → style guide → mockup HTML → app Android**. Cada etapa só começa com a anterior aprovada, e cada uma é documentada em [`docs/design/`](design/).

### D7 · Logo: vinil clássico
**25/10/2026**

Entre quatro conceitos, foi escolhido o disco com braço (conceito A). Detalhes em [01-logo.md](design/01-logo.md).

### D8 · Identidade fixa, sem cor dinâmica
**25/10/2026**

O app usa a paleta da marca (creme, vinho, mostarda) nos temas claro e escuro, sem Material You. Só o ícone temático do Android 13+ segue o papel de parede. Detalhes em [02-style-guide.md](design/02-style-guide.md).

### D9 · Tokens como fonte da verdade
**25/10/2026**

`design/02-style-guide/tokens.json` define cores, tipografia, espaços e movimento. O mockup usa o CSS gerado a partir dele, e o app vai gerar o tema do Compose a partir do mesmo arquivo.

### D10 · Fluxo de git
**25/10/2026**

Projeto pessoal: commits e push direto na `main`, sem branches nem pull requests.

### D11 · Estrutura de navegação do app
**25/10/2026**

Definida no mockup ([03-mockup.md](design/03-mockup.md)):
- 4 abas (Biblioteca, Playlists, Buscar, Ajustes), com o mini player fixo acima delas;
- a biblioteca é uma tela só, com filtros Músicas / Álbuns / Artistas / Pastas;
- a gestão de pastas (adicionar e remover) fica em Ajustes;
- ações destrutivas sempre têm confirmação ou "Desfazer".
- a busca mostra sempre três seções (Artistas, Álbuns, Músicas), incluindo os itens ligados aos resultados diretos (pedido do usuário).

**Status:** aguardando validação do mockup.
