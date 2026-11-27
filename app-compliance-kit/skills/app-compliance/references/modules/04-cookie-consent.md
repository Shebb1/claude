# 04 – Cookie Consent

## Zweck
Einwilligung für nicht notwendige Speicher-/Zugriffsvorgänge auf Endgeräten (§ 25 TDDDG, ePrivacy) und für Tracking nach DSGVO; Cookie-Banner mit Opt-in, Widerruf, Nachweis. Notwendige Cookies/Storage ohne Consent.

## Auto-Erkennung
Cookies/Storage (`document.cookie`, `localStorage`, `Set-Cookie`), Tracker/Embeds (discovery §2), vorhandenes CMP (`cookiebot`, `usercentrics`, `onetrust`, `klaro`, `vanilla-cookieconsent`, `osano`, eigenes `consent`), `<script src>` Drittdomains, Google Consent Mode, Fonts/CDN von Dritten.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| inventory | Gefundene Cookies/Tracker bestätigen, je Kategorie zuordnen (notwendig, Funktional, Statistik, Marketing) | Tabelle vorbefüllt | Code | ja |
| approach | Lösung | Eigenes Banner (Empfohlen: kein externer Anbieter) / Open-Source-CMP (Klaro, vanilla-cookieconsent) / Kommerzielles CMP | Code | ja |
| optout_tracking | Tracker ohne Consent möglich (z. B. Plausible/Umami cookielos, Matomo anonymisiert)? | je Dienst | Code | nein |
| embeds | Externe Embeds (YouTube, Maps …): Zwei-Klick-Lösung/Consent-Platzhalter? | Ja/Nein | Code | ja |
| gcm | Google-Dienste: Consent Mode v2 nötig? | Ja/Nein | Code | bedingt |
| languages | Banner-Sprachen | Mehrfach | i18n | ja |
| storage | Einwilligungsnachweis speichern (Cookie, DB-Log)? | Cookie + DB-Log (Empfohlen) / Nur Cookie | – | ja |
| lifetime | Gültigkeit der Entscheidung | 6 Monate (Empfohlen) / 12 Monate | – | ja |
| design | Position/Stil | Banner unten / Modal / Corner; Markenfarben aus Projekt | UI | nein |

## Plan & Umsetzung
1. Inventar finalisieren (`.compliance/cookies.md`: Name, Anbieter, Zweck, Dauer, Kategorie).
2. Banner-Komponente im Stack des Projekts: gleichwertige Buttons „Alle akzeptieren“, „Nur notwendige“/„Alle ablehnen“, „Einstellungen“ auf erster Ebene; keine vorausgewählten Kategorien; kein Cookiewall-/Nudging-Design; Fokus-/Tastaturbedienung (a11y).
3. **Blockieren bis Consent:** Tracker-Skripte nur nach Zustimmung laden (`<script type="text/plain" data-category>` oder dynamischer Import), Drittanbieter-Embeds per Platzhalter. Keine Requests an Tracker vor Consent (Network-Check).
4. Widerruf: Dauerhafter Link „Cookie-Einstellungen“ im Footer; Widerruf so einfach wie Einwilligung; Löschen gesetzter Cookies bei Entzug.
5. Nachweis: Consent-Log-Tabelle (`consent_logs: id, subject_hash, categories, version, timestamp, user_agent_hash`), Banner-Version bei Textänderung erhöhen → erneute Abfrage.
6. Self-host Fonts/Libs statt Google-CDN, um Consent-Bedarf zu vermeiden.
7. Cookie-Tabelle in Datenschutzerklärung (01) verlinken.

## Verifikation
- Playwright: Erstbesuch → keine Tracker-Requests/Cookies außer notwendigen; nach „Ablehnen“ weiterhin keine; nach „Akzeptieren“ Tracker aktiv; Widerruf entfernt sie.
- Banner per Tastatur/Screenreader bedienbar (`design:accessibility-review`).
- Entscheidung bleibt über Reload erhalten, Version-Bump löst erneut Banner aus.

## Hinweise
Rechtsgrundlage Tracking: Einwilligung Art. 6(1)(a). UK: PECR ähnlich. US: Opt-out/GPC-Signal beachten (CPRA). Kein Banner nötig, wenn ausschließlich technisch notwendige Speicherung ohne Dritte – trotzdem in 01 dokumentieren. Entwurf, keine Rechtsberatung.
