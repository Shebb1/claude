# 12 – Data Breach Procedure (Datenpannen-Prozess)

## Zweck
Vorbereiteter Ablauf für Datenschutzverletzungen: Erkennen, Eindämmen, Bewerten, Meldung an Aufsichtsbehörde binnen **72 Stunden** (Art. 33), Benachrichtigung Betroffener bei hohem Risiko (Art. 34), Dokumentation (Art. 33(5)). Technische Erkennungsbausteine einbauen.

## Auto-Erkennung
Logging/Monitoring (Sentry, Hosting-Logs), Alerting, Audit-Logs, Admin-Aktionen, vorhandene `SECURITY.md`/Runbooks, Aufsichtsbehörde (aus Sitz in Profil), Mail-Setup für Benachrichtigungen, Status-Page.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| authority | Zuständige Aufsichtsbehörde (aus Sitz ableiten, bestätigen) | z. B. BayLDA, LfDI BW … | Profil | ja |
| team | Incident-Verantwortliche (Leitung, Technik, Kommunikation, Recht), Vertretung, Erreichbarkeit | Freitext | Profil | ja |
| channels | Meldekanäle intern (Slack/Mail/Telefon) | Freitext | – | ja |
| detect | Erkennung: Alerts auf Login-Anomalien, Massen-Exporte, Fehlerraten, Secret-Scanning | Mehrfach | Code | ja |
| customers | B2B-Kunden: Meldepflicht als Auftragsverarbeiter (unverzüglich an Verantwortliche) | Ja/Nein, Frist laut AVV | 09 | bedingt |
| comms | Benachrichtigung Betroffener: Kanal (Mail/In-App), Vorlage | Optionen | – | ja |
| forensics | Log-Aufbewahrung für Forensik (Tage) | Zahl | 08 | ja |
| legal_it | Externe Unterstützung (Anwalt, IT-Forensik, Versicherung) | Freitext | – | nein |
| drills | Übung/Review-Rhythmus | halbjährlich/jährlich | – | nein |

## Plan & Umsetzung
1. `.compliance/incident-response.md` (Runbook): Phasen (Erkennen, Eindämmen, Bewerten, Melden, Kommunizieren, Beheben, Nachbereiten), Rollen, Checklisten, Entscheidungsbaum „Meldepflicht ja/nein, Risiko hoch?“ nach EDSA-Leitlinien, 72-h-Uhr ab Kenntnis, Mustertexte (Behördenmeldung mit Inhalten Art. 33(3), Betroffenenmitteilung, Kundeninfo).
2. Vorlagen: `incident-report-template.md`, Pannenregister `.compliance/breach-register.md` (auch nicht meldepflichtige Fälle).
3. Technisches: Audit-Log für sensible Aktionen, Alert-Regeln (Monitoring-Dienst), Funktion „alle Sessions/Tokens widerrufen“, Schlüsselrotations-Anleitung, Notfall-Wartungsmodus, Kontakt `security@` + `security.txt` (11).
4. Kontaktliste (Behörde-Online-Meldeformular-Link, interne Nummern) – Einträge ohne Secrets.
5. Nachbereitung: Blameless-Postmortem mit `engineering:incident-response`.
6. Übung als Tabletop-Szenario dokumentieren (z. B. „Datenbank-Dump öffentlich“).

## Verifikation
- Runbook vollständig, Rollen besetzt, keine `TODO(owner)` in Kontaktdaten.
- Alert-Test (künstliches Ereignis in Staging) erreicht Verantwortliche.
- Widerruf-aller-Sessions-Funktion getestet.

## Hinweise
Melden selbst nimmt Claude nicht vor; das tut ein Mensch. Meldefristen/Behörden variieren (CH: so rasch wie möglich an EDÖB; UK: ICO 72 h; US: Bundesstaatsgesetze, teils sektorspezifisch). Entwurf, keine Rechtsberatung.
