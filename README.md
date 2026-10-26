<p align="center">
  <img src="design/01-logo/export/vitrola-mp3-horizontal-positivo.svg" alt="Vitrola Mp3" height="96">
</p>

# Vitrola Mp3

Player de música para Android que toca os MP3 guardados no próprio celular. Funciona offline, não pede conta e só lê as pastas que você escolher.

> **Status:** em design. Logo ✅ · Style guide ✅ · Mockup HTML ⏳ · App Android ⏳

## Ideia

- **Só as suas pastas:** você escolhe as pastas de música e nada fora delas entra na biblioteca (áudios do WhatsApp, por exemplo).
- **Toca em segundo plano:** a música continua com a tela apagada ou em outro app, com controles na notificação, na tela de bloqueio e no fone.
- **Cara de vitrola:** no "tocando agora", a capa do álbum vira o selo de um disco de vinil que gira.

## Como o projeto está sendo feito

O design vem antes do código. Cada etapa só começa depois que a anterior é aprovada:

1. **Logo:** feita, em [`design/01-logo/`](design/01-logo/)
2. **Style guide:** feito, em [`design/02-style-guide/`](design/02-style-guide/)
3. **Mockup HTML:** telas navegáveis no navegador para validar o fluxo e as interações
4. **App Android:** planejamento e construção, só depois do mockup aprovado

## Estrutura

```
design/
  01-logo/          páginas da logo, SVGs exportados e scripts de exportação
  02-style-guide/   style guide, tokens de design e gerador
docs/
  decisoes.md       registro das decisões de produto e técnica
  design/           documentação de cada etapa de design
```

## Ver o design no navegador

```bash
python3 -m http.server 8765 --directory design
```

Depois abra:
- Logo: http://localhost:8765/01-logo/logo-vinil.html
- Style guide: http://localhost:8765/02-style-guide/style-guide.html

## Documentação

- [Decisões do projeto](docs/decisoes.md)
- [Design: logo](docs/design/01-logo.md)
- [Design: style guide](docs/design/02-style-guide.md)
