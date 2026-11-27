# 14 – Open-Source Licences

## Zweck
Lizenzen aller Abhängigkeiten erfassen, Konflikte mit dem Geschäftsmodell erkennen (z. B. GPL/AGPL in proprietärem SaaS/Distribution), Pflichten erfüllen (Namensnennung, Lizenztexte, NOTICE), eigene Projektlizenz festlegen.

## Auto-Erkennung
Lockfiles/Manifeste, Lizenzfelder (`license-checker`, `pip-licenses`, `cargo license`, `go-licenses`, `composer licenses`, ersatzweise `package.json#license` aus `node_modules`), Frontend-Bundle-Auslieferung (Distribution an Nutzer?), eigene `LICENSE`, vendored Code, Fonts/Icons/Bilder/Medien (Lizenzen!).

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| distribution | Wie wird Software bereitgestellt? | Nur gehostetes SaaS / Auslieferung Frontend-Code an Browser / App-Store-Binary / On-Prem | Profil | ja |
| model | Projekt: proprietär, Open Source, Source-available? | Auswahl | Profil | ja |
| project_license | Projektlizenz | MIT / Apache-2.0 / AGPL-3.0 / Proprietär (All rights reserved) / Andere | LICENSE | ja |
| policy | Erlaubte Lizenzfamilien | Permissiv (MIT, BSD, Apache, ISC) Empfohlen / zusätzlich Weak Copyleft (LGPL, MPL) / Copyleft ok | – | ja |
| conflicts | Gefundene Konflikte/unklare Lizenzen: Ersetzen, Dual-License, Kommerzlizenz, akzeptieren? | je Paket | Scan | bedingt |
| assets | Fonts, Icons, Bilder, Videos, Templates: Lizenznachweise vorhanden? | je Asset | Scan | ja |
| notices | Lizenzseite `/open-source` ausliefern? | Ja/Nein | – | ja |
| ci | Automatischer Lizenz-Check in CI | Ja/Nein | CI | nein |

## Plan & Umsetzung
1. Inventar `THIRD_PARTY_LICENSES.md` bzw. `THIRD_PARTY_NOTICES.txt` automatisiert generieren (Tool des Ökosystems, Script in `package.json`/Makefile).
2. Konfliktanalyse: Matrix Lizenz × Bereitstellungsart (z. B. AGPL im SaaS = Quellcode-Angebotspflicht; GPL im ausgelieferten Bundle = Copyleft; LGPL dynamisch linken; CC-BY-NC = kommerziell unzulässig; „no license“ = nicht nutzbar). Konflikte mit Optionen zur Freigabe vorlegen.
3. Austausch/Entfernen von Paketen nur nach Freigabe, Tests danach.
4. `LICENSE` für das Projekt anlegen/prüfen (SPDX-Identifier in `package.json`), `NOTICE` bei Apache-2.0-Abhängigkeiten.
5. Seite `/open-source` (aus Inventar), Link im Footer/„Über“; im Build ausgeliefert, damit Namensnennung gewährleistet ist.
6. CI-Job (`license-checker --failOn`, `pip-licenses --fail-on`, `reuse lint` optional) mit Allowlist aus `policy`.
7. Assets: Quellen/Lizenzen in `ASSETS_LICENSES.md`; Schriften/Icons selbst hosten nur gemäß Lizenz.

## Verifikation
- Inventar enthält alle direkten und transitiven Abhängigkeiten, keine „UNKNOWN“ ohne Klärung.
- CI schlägt bei nicht erlaubter Lizenz fehl (Probe mit Testpaket).
- `/open-source` erreichbar und vollständig.

## Hinweise
Lizenzinterpretation ist Rechtsfrage: Bei Konflikten (AGPL/GPL, Dual-Licensing) Anwalt hinzuziehen. Entwurf, keine Rechtsberatung.
