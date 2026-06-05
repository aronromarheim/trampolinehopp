# Trampolinehopp 🤸

Et 2D trampolinespill der en gutt hopper på en trampoline og du styrer triksene hans.
Hele spillet er én enkelt, selvstendig HTML-fil – ingen bygg, ingen avhengigheter.

## Spill det live
👉 **https://trampolinehopp.pages.dev**

## Slik spiller du
- **Pil opp / mellomrom** – hopp / pump for høyde
- **Pil venstre / høyre** – snurr (salto fram / bak)
- Land rett for rene triks, bygg kombo, tjen penger, lås opp baner og ranks.

## 🌐 Online highscore
Big Air-leaderboardet er ekte online: flest grader du spinner på et big air-hopp
lagres med navnet ditt på en delt topp-liste (Cloudflare D1-database).
- To lister: **☀️ Dagens highscore** (nullstilles ved norsk midnatt) og **🏆 Gjennom tidene**.
- API: `functions/api/scores.js` (`GET` = `{today, allTime}`, `POST` = lagre beste per navn / per dag)
- Kjører du lokalt (uten API) faller spillet pent tilbake til en lokal eksempel-liste.

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
