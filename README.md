# Trampolinehopp 🤸

Et 2D trampolinespill der en gutt hopper på en trampoline og du styrer triksene hans.
Hele spillet er én enkelt, selvstendig HTML-fil – ingen bygg, ingen avhengigheter.

## Spill det live
👉 **https://trampolinehopp.pages.dev**

## Slik spiller du
- **Pil opp / mellomrom** – hopp / pump for høyde
- **Pil venstre / høyre** – snurr (salto fram / bak)
- Land rett for rene triks, bygg kombo, tjen penger, lås opp baner og ranks.

## 🌐 Online topplister
Trykk **🏆 Leaderboards** for å se alle topplistene samlet i ett vindu (alle er ekte online,
lagret i en delt Cloudflare D1-database):
- **☀️ Big Air – Dagens** (nullstilles ved norsk midnatt) og **🏅 Big Air – Gjennom tidene** (flest grader spunnet)
- **📊 Høyest nivå** – de 10 med høyest nivå
- **💰 Rikeste spillere** – de 10 med mest penger
- **🔥 Lengste kombo** – de 10 med lengst kombo

API-endepunkter (Cloudflare Pages Functions): `functions/api/scores.js` (`{today, allTime}`),
`levels.js`, `money.js`, `combos.js`. Hver tar `GET` (topp 10) og `POST` (lagre beste per navn).
Kjører du lokalt (uten API) faller spillet pent tilbake til en lokal eksempel-liste.

## 💾 Lagret fremgang (per konto)
Logger du inn, lagres **hele fremgangen din** (penger, nivå, samlet framgang, eide baner,
låste opp triks/ranks/merch, rekorder og ting du har plassert ut) knyttet til kontoen din.
Da overlever den både refresh og bytte av enhet.

- Endepunkt: `functions/api/progress.js` – `GET /api/progress?navn=…` henter, `POST` lagrer
  hele fremgangen som én JSON-blob i tabellen `progress` (én rad per bruker).
- Lagres automatisk mens du spiller (debounced), jevnlig, og når du lukker fanen.
- localStorage brukes som offline-kopi, så ingenting går tapt uten nett.
- **NB:** Etter en `git pull` må D1-skjemaet oppdateres med den nye tabellen:
  `npx wrangler d1 execute <DB> --remote --file schema.sql` (kjør `--local` for lokal test).

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
