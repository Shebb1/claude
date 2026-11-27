# 10 – Third-Party Disclosure (Offenlegung von Drittanbietern)

## Zweck
Alle Drittanbieter, SDKs, Embeds, APIs und KI-Dienste erfassen und gegenüber Nutzern offenlegen (Empfänger nach Art. 13), inkl. Drittlandtransfer; Datenabfluss minimieren (Self-Hosting, Proxy, Consent-Gating).

## Auto-Erkennung
Komplette Dienste-Erkennung (discovery §2) plus Netzwerk-Check: Playwright-Lauf gegen lokale/Preview-App, alle externen Hosts aus Requests sammeln; CSP/`next.config` Header; `<script>`, `<link>`, `<iframe>`, `@import url()`, Fonts; KI-APIs (Prompts mit Nutzerdaten?).

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| inventory | Gefundene Dienste/Hosts bestätigen und ergänzen (auch serverseitige, z. B. Webhooks) | Liste vorbefüllt | Code + Netzwerk | ja |
| purpose_<dienst> | Zweck und übermittelte Daten | Vorschlag | Code | ja |
| consent_<dienst> | Consent-pflichtig (Endgerätezugriff/Tracking)? | Ja/Nein | 04 | ja |
| region_<dienst> | Standort/Drittland | Auswahl | Dienste | ja |
| replace | Datensparende Alternative umsetzen (Self-Host Fonts, cookieloses Analytics, EU-Anbieter)? | je Dienst Ja/Nein | – | nein |
| ai_data | KI-Dienste: Werden Nutzerdaten/Prompts an Dritte gesendet, Training-Opt-out/Zero-Retention? | Optionen | Code | bedingt |
| display | Darstellung | Abschnitt in Datenschutzerklärung (Empfohlen) + Seite `/dienste` | – | ja |

## Plan & Umsetzung
1. Register aus 09 verwenden/erweitern (`.compliance/third-parties.md`: Dienst, Anbieter, Zweck, Daten, Rechtsgrundlage, Region, Speicherdauer, Consent, Link zur Anbieter-Datenschutzerklärung).
2. Datenschutzerklärung (01) um je Dienst einen Abschnitt ergänzen/aktualisieren.
3. Technische Maßnahmen: Google Fonts/Icons selbst hosten, Tracker hinter Consent (04), Embeds per Platzhalter, IP-Anonymisierung, Server-seitiger Proxy für sensible Aufrufe, CSP-Whitelist exakt auf erlaubte Hosts begrenzen.
4. KI-Dienste: Datenminimierung (keine PII in Prompts, Pseudonymisierung), Hinweis in UI, API-Einstellungen für Datenaufbewahrung dokumentieren (`claude-api` für Anthropic-Konfig); Nutzer informieren, wenn KI-generierte Inhalte/Interaktionen vorliegen (EU AI Act Transparenz bei Chatbots).
5. CI-Check: Neue externe Hosts/Dependencies erzeugen Warnung (Skript, das erlaubte Host-Liste prüft).

## Verifikation
- Playwright-Netzwerklog: Nur erwartete Hosts; vor Consent keine Marketing-/Analytics-Hosts.
- Jeder Host im Register und im Datenschutztext vorhanden.
- CSP verhindert nicht gelistete Hosts (Test).

## Hinweise
Eingebettete Inhalte (Social, Maps, Video) sind typischer Abmahngrund (Google-Fonts-Urteil LG München 2022). Entwurf, keine Rechtsberatung.
