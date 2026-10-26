# Etapa 1 · Logo

**Status:** aprovada em 25/10/2026 · arquivos em [`design/01-logo/`](../../design/01-logo/)

<p>
  <img src="../../design/01-logo/export/vitrola-icone-app.svg" alt="Ícone do app" height="96">
  &nbsp;&nbsp;
  <img src="../../design/01-logo/export/vitrola-mp3-horizontal-positivo.svg" alt="Vitrola Mp3" height="96">
</p>

## Como chegamos aqui

Quatro conceitos foram explorados em [`conceitos.html`](../../design/01-logo/conceitos.html):

| | Conceito | Estilo | Resultado |
|---|---|---|---|
| **A** | Vinil clássico: disco, selo vinho, braço com agulha | Retrô literal | ✅ Escolhido |
| B | Disco play: anel com botão play no centro | Minimalista | Genérico demais |
| C | Gramofone em "V": a corneta forma a letra V | Retrô autoral | Lembrava uma taça |
| D | Selo retrô: emblema com o nome em volta | Vintage | Ilegível em tamanho pequeno |

**Por que o A:** é lido na hora como "toca-discos", combina com o nome e se conecta direto com a animação do app (o braço desce e o disco gira).

## O símbolo

Desenhado numa grade de 200×200:

- **Disco:** raio 70, deslocado para a esquerda e para baixo para abrir espaço ao braço. Sulcos com tons alternados e dois reflexos dão volume sem gradiente. A borda clara (`#6A5B50`) evita que o disco suma em fundos escuros.
- **Selo:** raio 25 (cerca de 1/3 do disco, como num LP), vinho, com anel mostarda e furo creme.
- **Braço:** do pivô (canto superior direito) até a agulha no terço externo do disco. Tem contrapeso, base mostarda, cápsula mostarda e sombra leve.

## Variações

| Variação | Quando usar | Arquivo |
|---|---|---|
| Detalhado | 64px ou mais | `export/vitrola-simbolo.svg` |
| Simplificado | 48px ou menos (menos sulcos, traços mais grossos, selo maior) | `export/vitrola-simbolo-pequeno.svg` |
| Monocromático | Ícone temático do Android 13+, usos de uma cor só | `export/vitrola-simbolo-mono.svg` |
| Ícone do app | Lojas, materiais (fundo creme arredondado) | `export/vitrola-icone-app.svg` |
| Ícone adaptativo | Android: camadas de frente, fundo e monocromática (108×108) | `export/android/ic_launcher_*.svg` |
| Notificação | Barra de status (branco) | `export/android/ic_notification.svg` |

No ícone adaptativo, o símbolo fica dentro da zona segura central (66 de 108 unidades) e foi testado nas máscaras círculo, squircle, arredondado e gota.

## Nome

O app se chama **Vitrola Mp3**.

- **Vitrola** em Fraunces ExtraBold (800), **Mp3** em Fraunces Medium (500), no mesmo tamanho, com eixo óptico 144. A diferença de peso cria hierarquia sem precisar de outra cor.
- Nos arquivos exportados, o texto está em contorno e não depende da fonte instalada.

| Assinatura | Arquivos |
|---|---|
| Horizontal | `export/vitrola-mp3-horizontal-{positivo,negativo}.svg` |
| Vertical | `export/vitrola-mp3-vertical-{positivo,negativo}.svg` |
| Só o nome | `export/vitrola-mp3-nome-{positivo,negativo}.svg` |

**Positivo** é para fundos claros (nome em vinho) e **negativo** para fundos escuros (nome em creme).

## Regras de uso

- **Área de respiro:** margem mínima em volta da logo igual ao raio do selo.
- **Fundos recomendados:** creme `#F3E9D2`, vinil `#1B1714` e vinho `#7A1F2B`.
- **Não fazer:** esticar ou girar a logo, trocar as cores do disco, usar a versão detalhada abaixo de 48px, ou pôr a assinatura positiva em fundo escuro.

## Paleta base

| Cor | Hex |
|---|---|
| Creme | `#F3E9D2` |
| Vinho | `#7A1F2B` |
| Mostarda | `#E0A526` |
| Vinil | `#1B1714` |
| Sulco | `#3A322C` |
| Metal | `#CFC8B8` |

## Como editar

Os desenhos ficam nos `<symbol>` de [`logo-vinil.html`](../../design/01-logo/logo-vinil.html), que é a fonte da verdade. Para mudar a logo, edite o HTML e regere os SVGs:

```bash
design/01-logo/scripts/exportar.sh
```

O script precisa de `python3`, `uv` e `curl`. Ele baixa a fonte Fraunces (licença OFL) do repositório do Google Fonts e converte o nome em contorno com `fonttools` + `uharfbuzz`.
