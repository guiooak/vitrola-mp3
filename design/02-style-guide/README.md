# Style guide — Vitrola Mp3

| Arquivo | O que é |
|---|---|
| `style-guide.html` | O guia visual (abra no navegador): princípios, cores, tipografia, espaço, ícones, componentes, movimento, voz, acessibilidade e mapeamento para Compose. |
| `tokens.json` | **Fonte da verdade** de cores, tipografia, espaços, raios, sombras e movimento. |
| `tokens.css` / `tokens.js` | Gerados a partir do `tokens.json`. Não edite à mão. |
| `gerar_tokens.py` | Regenera os dois arquivos acima. |

Depois de mudar `tokens.json`:

```bash
python3 design/02-style-guide/gerar_tokens.py
```

Para ver com servidor local (as imagens da logo carregam melhor assim):

```bash
python3 -m http.server 8765 --directory design
```

Depois abra http://localhost:8765/02-style-guide/style-guide.html.

Documentação completa: [docs/design/02-style-guide.md](../../docs/design/02-style-guide.md).
