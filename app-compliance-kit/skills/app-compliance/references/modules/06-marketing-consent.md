# 06 – Marketing Consent (Newsletter, E-Mail-Werbung, Double-Opt-in)

## Zweck
Rechtssichere Einwilligung für Werbe-E-Mails/Push/SMS (§ 7 UWG, Art. 6(1)(a) DSGVO, ePrivacy): Double-Opt-in, Nachweis, Abmeldung mit einem Klick, Trennung von Transaktionsmails.

## Auto-Erkennung
Newsletter-Formulare, Checkbox „Marketing“ bei Registrierung, Mail-Dienst (`resend`, `mailchimp`, `brevo`, `loops`, `klaviyo`, `convertkit`), Tabellen `subscribers`/`newsletter`, Unsubscribe-Routen, Push/SMS-Libs, bestehende Mailtemplates.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| channels | Kanäle | Mehrfach: E-Mail, Push, SMS, WhatsApp | Code | ja |
| provider | Versanddienst | erkannt/Freitext | Code | ja |
| collection | Erhebungspunkte | Newsletter-Formular, Registrierung, Checkout, Lead-Magnet … | Code | ja |
| doi | Double-Opt-in | Ja (Empfohlen) / Nein | Code | ja |
| existing_customer | Bestandskundenausnahme § 7(3) UWG nutzen? (nur eigene ähnliche Produkte, Hinweis bei Erhebung, Widerspruch jederzeit) | Ja/Nein | – | nein |
| consent_text | Einwilligungstext je Formular | Entwurf zur Freigabe | – | ja |
| content | Inhalt/Häufigkeit (konkret benennen, Koppelungsverbot beachten) | Freitext | – | ja |
| unsub | Abmeldeweg | Link in jeder Mail + List-Unsubscribe-Header + Kontoeinstellung | Code | ja |
| import | Gibt es alte Kontaktlisten ohne Nachweis? | Ja/Nein (Hinweis: nicht verwenden ohne Nachweis) | – | ja |
| from | Absender, Impressumsangaben in Mails | Freitext | Profil | ja |

## Plan & Umsetzung
1. Tabelle `marketing_consents` (`id, email_hash/email, channel, status, source, text_version, ip_hash, requested_at, confirmed_at, withdrawn_at`).
2. Formular: Einwilligungstext + Link zur Datenschutzerklärung, Checkbox nicht vorangekreuzt, nicht an Vertragsabschluss koppeln.
3. DOI-Flow: Anmelde-Mail mit Bestätigungslink (signiertes Token, Ablauf 24–48 h), erst nach Klick `confirmed`; Erinnerung optional einmalig; Rate-Limit + Bot-Schutz.
4. Abmeldung: One-Click-Link + `List-Unsubscribe`/`List-Unsubscribe-Post`-Header; sofortige Wirkung; Suppression-Liste, die auch nach Kontolöschung als Hash erhalten bleibt.
5. Versand-Gate im Code: Marketing nur an `confirmed` ohne `withdrawn`; Transaktionsmails strikt getrennt.
6. Mailtemplates mit Impressumsangaben; Texte mit `marketing:email-sequence` / `design:ux-copy`; SPF/DKIM/DMARC-Hinweise (Zustellbarkeit, Modul 11).
7. Dienst-Konfiguration (Double-Opt-in-Feature des Anbieters) und AVV (09) prüfen.

## Verifikation
- E2E: Anmeldung → DOI-Mail (Testmailbox) → Bestätigung → Status `confirmed`; Abmeldung → keine weiteren Mails.
- Kein Versand an unbestätigte/abgemeldete Adressen (Unit-Test des Gates).
- Consent-Datensatz enthält Text-Version und Zeitstempel.

## Hinweise
DE: Werbe-E-Mail ohne Einwilligung ist abmahnfähig. UK: PECR. US: CAN-SPAM (Abmeldung, Postadresse). Entwurf, keine Rechtsberatung.
