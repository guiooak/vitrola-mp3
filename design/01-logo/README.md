# Logo — Vitrola

Conceito escolhido: **A · Vinil clássico**.

| Arquivo | Uso |
|---|---|
| `logo-vinil.html` | Apresentação da logo (abra no navegador). Fonte da verdade dos desenhos. |
| `conceitos.html` | Os 4 conceitos iniciais, guardados como histórico. |
| `export/vitrola-simbolo.svg` | Símbolo detalhado, para 64px ou mais |
| `export/vitrola-simbolo-pequeno.svg` | Símbolo simplificado, para 48px ou menos |
| `export/vitrola-simbolo-mono.svg` | Uma cor (`currentColor`) |
| `export/vitrola-icone-app.svg` | Ícone com fundo creme arredondado |
| `export/android/ic_launcher_*.svg` | Camadas do ícone adaptativo (108×108): frente, fundo e monocromático |
| `export/android/ic_notification.svg` | Ícone branco da notificação |
| `export/vitrola-mp3-horizontal-{positivo,negativo}.svg` | Assinatura horizontal (símbolo + nome) |
| `export/vitrola-mp3-vertical-{positivo,negativo}.svg` | Assinatura vertical |
| `export/vitrola-mp3-nome-{positivo,negativo}.svg` | Só o nome |

"Positivo" é para fundos claros (nome em vinho) e "negativo" para fundos escuros (nome em creme).

Paleta base: Creme `#F3E9D2` · Vinho `#7A1F2B` · Mostarda `#E0A526` · Vinil `#1B1714` · Sulco `#3A322C` · Metal `#CFC8B8`.

Nome: **Vitrola** em Fraunces ExtraBold (800) e **Mp3** em Fraunces Medium (500), com eixo óptico 144. Nas assinaturas exportadas o texto já está em contorno e não depende da fonte instalada.

Os SVGs em `export/` são gerados a partir dos `<symbol>` de `logo-vinil.html`. Edite lá e rode `scripts/exportar.sh`.

Documentação completa: [docs/design/01-logo.md](../../docs/design/01-logo.md).
