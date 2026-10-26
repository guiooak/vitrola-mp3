<p align="center">
  <a href="https://guiooak.github.io/vitrola-mp3/"><strong>🌐 guiooak.github.io/vitrola-mp3</strong></a><br>
  <sub><a href="https://guiooak.github.io/vitrola-mp3/01-logo/logo-vinil.html">Manual da logo</a> · <a href="https://guiooak.github.io/vitrola-mp3/02-style-guide/style-guide.html">Style guide</a> · <a href="https://guiooak.github.io/vitrola-mp3/03-mockup/">Mockup</a></sub>
</p>

<p align="center">
  <img src="design/01-logo/export/vitrola-mp3-horizontal-positivo.svg" alt="Vitrola Mp3" height="96">
</p>

# Vitrola Mp3

Player de música para Android que toca os MP3 guardados no próprio celular. Funciona offline, não pede conta e só lê as pastas que você escolher.

> **Status:** em design. Logo ✅ · Style guide ✅ · Mockup HTML 🔍 em validação · App Android ⏳

## Ideia

- **Só as suas pastas:** você escolhe as pastas de música e nada fora delas entra na biblioteca (áudios do WhatsApp, por exemplo).
- **Toca em segundo plano:** a música continua com a tela apagada ou em outro app, com controles na notificação, na tela de bloqueio e no fone.
- **Cara de vitrola:** no "tocando agora", a capa do álbum vira o selo de um disco de vinil que gira.

## Como o projeto está sendo feito

O design vem antes do código. Cada etapa só começa depois que a anterior é aprovada:

1. **Logo:** feita, em [`design/01-logo/`](design/01-logo/)
2. **Style guide:** feito, em [`design/02-style-guide/`](design/02-style-guide/)
3. **Mockup HTML:** pronto para validação, em [`design/03-mockup/`](design/03-mockup/)
4. **App Android:** planejamento e construção, só depois do mockup aprovado

## Estrutura

```
design/
  01-logo/          páginas da logo, SVGs exportados e scripts de exportação
  02-style-guide/   style guide, tokens de design e gerador
  03-mockup/        app navegável para validar telas e interações
  index.html        landing page do site
docs/
  decisoes.md       registro das decisões de produto e técnica
  design/           documentação de cada etapa de design
```

## Site

O conteúdo da pasta `design/` é publicado no GitHub Pages pelo workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml), a cada push na `main` que altere o design:

- Landing page: https://guiooak.github.io/vitrola-mp3/
- Manual da logo: https://guiooak.github.io/vitrola-mp3/01-logo/logo-vinil.html
- Style guide: https://guiooak.github.io/vitrola-mp3/02-style-guide/style-guide.html
- Mockup: https://guiooak.github.io/vitrola-mp3/03-mockup/

## Ver o design no navegador (local)

```bash
python3 -m http.server 8765 --directory design
```

Depois abra:
- Landing page: http://localhost:8765/
- Logo: http://localhost:8765/01-logo/logo-vinil.html
- Style guide: http://localhost:8765/02-style-guide/style-guide.html
- Mockup: http://localhost:8765/03-mockup/

## Documentação

- [Decisões do projeto](docs/decisoes.md)
- [Design: logo](docs/design/01-logo.md)
- [Design: style guide](docs/design/02-style-guide.md)
- [Design: mockup](docs/design/03-mockup.md)
