# 02 – Terms & Conditions (AGB / Nutzungsbedingungen)

## Zweck
Vertragsgrundlage zwischen Anbieter und Nutzern; Haftung begrenzen, Nutzungsregeln, Kündigung, Gerichtsstand. Bei B2C in der EU gelten zwingende Verbraucherrechte (AGB-Recht §§ 305 ff. BGB, Widerruf, Gewährleistung), die nicht per AGB ausgehebelt werden können.

## Auto-Erkennung
Vorhandene AGB/ToS, Registrierungsflow (Checkbox?), Payments (15), User-generated Content (Uploads, Kommentare), Rollen/Pläne, KI-Features, API-Nutzung.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| audience | B2C, B2B oder beides? | Auswahl | Profil | ja |
| model | Geschäftsmodell | Kostenlos / Einmalkauf / Abo / Freemium / Marktplatz | Payments | ja |
| service | Leistungsbeschreibung in 2–3 Sätzen | Freitext | README | ja |
| ugc | Nutzer erzeugen Inhalte? Wer haftet, welche Lizenz an uns? | Ja/Nein; Lizenzumfang | Code | ja |
| prohibited | Verbotene Nutzung (Missbrauch, Scraping, illegale Inhalte) | Mehrfach, Vorschläge | – | ja |
| liability | Haftungsrahmen | Standard DE (Vorsatz/grobe Fahrlässigkeit unbeschränkt, leichte nur bei Kardinalpflichten) / Individuell | – | ja |
| law | Anwendbares Recht, Gerichtsstand | z. B. DE, Sitz des Anbieters (nur B2B/Kaufleute zulässig) | Profil | ja |
| term | Laufzeit, Kündigung, Probezeit, Verlängerung | Optionen | Payments | bei Abo |
| account | Kontoregeln: Mindestalter, Sperrung, Löschung | Optionen | Profil | ja |
| sla | Verfügbarkeitszusage/Support/Wartung | Keine / Best effort / SLA % | – | nein |
| ip | Rechte an Software/Marke/Inhalten | Freitext | 13/14 | ja |
| dispute | Online-Streitbeilegung/Verbraucherschlichtung (VSBG-Hinweis) | Teilnahme ja/nein | Profil | B2C |
| changes | Änderungsmechanik der AGB | Zustimmung/Widerspruchsfrist | – | ja |

## Plan & Umsetzung
1. Seite `/agb` bzw. `/terms`, Versionierung (`legal/versions/`), Datum.
2. Zustimmungsflow: Checkbox „Ich akzeptiere die AGB“ **nicht vorangekreuzt**, Link, Zeitstempel+Version in DB speichern (Tabelle `terms_acceptances: user_id, version, accepted_at, ip_hash`). Bei Versionsänderung erneute Zustimmung erzwingen (Middleware).
3. B2C-Abos: Widerrufsbelehrung + Muster-Widerrufsformular (15), Button-Lösung.
4. Footer-Link auf allen Seiten; im Checkout vor dem Kauf einbinden; AGB per E-Mail bestätigen (Textform).

## Textbausteine (Gliederung)
1 Geltungsbereich · 2 Vertragsgegenstand/Leistung · 3 Registrierung/Konto · 4 Pflichten der Nutzer, verbotene Nutzung · 5 Nutzerinhalte & Lizenz · 6 Preise/Zahlung (→15) · 7 Laufzeit/Kündigung · 8 Widerruf (B2C) · 9 Gewährleistung · 10 Haftung · 11 Verfügbarkeit/Wartung · 12 Geistiges Eigentum · 13 Datenschutz-Verweis · 14 Änderungen · 15 Schlussbestimmungen (salvatorische Klausel, Recht, Gerichtsstand, Streitbeilegung).

## Verifikation
- Checkbox nicht vorausgewählt, Registrierung ohne Zustimmung nicht möglich (E2E-Test).
- Version + Zeitstempel in DB gespeichert, Re-Consent bei neuer Version testen.
- Keine unwirksamen Klauseln: pauschale Haftungsausschlüsse, Haftungsbeschränkung für Kardinalpflichten, einseitige Preisänderung ohne Kündigungsrecht → als Warnung markieren.

## Hinweise
AGB-Recht ist kleinteilig und abmahnanfällig → Anwaltsprüfung dringend empfohlen. B2B: Gerichtsstandsklausel erlaubt. US: Arbitration/Class-Action-Waiver nur nach Fachprüfung. Entwurf, keine Rechtsberatung.
