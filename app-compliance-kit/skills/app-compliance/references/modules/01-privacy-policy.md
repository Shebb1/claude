# 01 – Privacy Policy (Datenschutzerklärung) + Impressum

## Zweck
Transparenzpflichten Art. 13/14 DSGVO erfüllen; Anbieterkennzeichnung (§ 5 DDG, DE) ergänzen. Abhängig von: 10 (Dienste), 05 (Rechtsgrundlagen), 08 (Fristen).

## Auto-Erkennung
Vorhandene Seiten (`datenschutz`, `privacy`, `impressum`), Dienste-Liste (discovery §2), Datenkategorien, Formulare, Cookies, Hosting-Region, Kontakt aus README/Footer/`package.json`.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| controller | Name/Rechtsform, Anschrift, E-Mail, Telefon, Vertretungsberechtigte | Freitext | Impressum, Footer, Profil | ja |
| register | Handelsregister/USt-Id/Wirtschafts-Id | Freitext, „keine“ | Profil | bei Firma |
| dpo | Datenschutzbeauftragter nötig/benannt? | Ja/Nein/Unsicher (Hilfe: ≥20 Personen mit regelmäßiger Datenverarbeitung, DE) | Profil | ja |
| markets | Zielmärkte/Sprachen | Mehrfach: DE, EU, CH, UK, US, Sonstige | Profil | ja |
| purposes | Zwecke bestätigen (Accounts, Zahlungen, Support, Analytics, Newsletter …) | Mehrfach, vorbefüllt | Code | ja |
| recipients | Empfänger/Auftragsverarbeiter bestätigen | Liste aus Phase 0 | Code | ja |
| transfers | Drittlandübermittlung (USA etc.) und Garantie | adequacy/DPF/SCC | Dienste | ja |
| logs | Server-Logs, Speicherdauer | Freitext | Hosting | ja |
| automated | Automatisierte Entscheidungen/Profiling/KI | Ja/Nein | Code | ja |
| minors | Richtet sich an unter 16? | Ja/Nein | Profil | ja |
| languages | Sprachen der Texte | Mehrfach | i18n | ja |
| placement | Footer-Link, Registrierungs-Hinweis | Optionen | Router | nein |

## Plan & Umsetzung
1. Seiten `/datenschutz` (+ `/privacy` bei EN), `/impressum` im Router anlegen bzw. erweitern, i18n berücksichtigen.
2. Footer-Links auf jeder Seite, Link im Registrierungs-/Checkout-/Newsletter-Formular, aus dem Cookie-Banner (04).
3. Text aus den Bausteinen unten generieren, nur mit bestätigten Daten. Versionsstand + Änderungsdatum anzeigen; alte Versionen in `legal/versions/` aufbewahren.
4. Datenschutz-Kontaktadresse und Betroffenenrechte-Prozess verlinken (07).
5. `sitemap`/SEO: Seiten indexierbar lassen (Impressum/Datenschutz dürfen indexiert sein), `lang`-Attribut setzen.

## Textbausteine (Gliederung)
1 Verantwortlicher · 2 DSB · 3 Überblick Verarbeitungen · 4 Hosting & Server-Logs · 5 Registrierung/Konto · 6 Kontaktformular/Support · 7 Zahlungen · 8 Newsletter (06) · 9 Cookies/Tracking/Consent (04) · 10 Drittanbieter je Dienst (Zweck, Daten, Rechtsgrundlage, Empfänger, Drittland, Speicherdauer) · 11 Drittlandtransfer · 12 Speicherdauer (08) · 13 Betroffenenrechte Art. 15–21, Widerruf der Einwilligung, Beschwerde bei Aufsichtsbehörde · 14 Pflicht zur Bereitstellung · 15 Automatisierte Entscheidung/KI · 16 Datensicherheit · 17 Änderungen · Stand.
Pro Verarbeitung: Zweck → Rechtsgrundlage (05) → Daten → Empfänger → Speicherdauer.

## Verifikation
- Jeder erkannte Dienst/Cookie kommt im Text vor und umgekehrt (Skript/Grep abgleichen).
- Keine `TODO(owner)` mehr in der veröffentlichten Seite (oder bewusst gelistet).
- Links funktionieren (Playwright), Seiten ohne Login erreichbar, mobil lesbar.
- `design:accessibility-review` für die Seite, `design:ux-copy` für Verständlichkeit.

## Hinweise
CH: nDSG-Hinweise; UK: UK GDPR + ICO; US/CA: CCPA/CPRA „Do Not Sell/Share“-Abschnitt und Kategorien, falls US-Kunden. Entwurf, keine Rechtsberatung.
