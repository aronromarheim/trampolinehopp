# Trampolinehopp 🤸

Et 2D trampolinespill der en gutt hopper på en trampoline og du styrer triksene hans.
Hele spillet er én enkelt, selvstendig HTML-fil – ingen bygg, ingen avhengigheter.

## Spill det live
👉 **https://trampolinehopp.pages.dev**

## Slik spiller du
- **Pil opp / mellomrom** – hopp / pump for høyde
- **Pil venstre / høyre** – snurr (salto fram / bak)
- Land rett for rene triks, bygg kombo, tjen penger, lås opp baner og ranks.

## Kjøre lokalt
Du trenger bare en nettleser. For å serve filen lokalt:

```bash
python3 -m http.server 8123
```

Åpne så `http://localhost:8123` i nettleseren.

## Teknisk
- Ett HTML5 `<canvas>` + `requestAnimationFrame`-løkke
- All CSS og JavaScript ligger inline i `index.html`
- Norsk tekst og UI

---
🤖 Laget med hjelp fra [Claude Code](https://claude.com/claude-code)
