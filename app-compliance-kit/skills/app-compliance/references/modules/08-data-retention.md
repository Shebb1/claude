# 08 – Data Retention (Speicherdauer & Aufbewahrung)

## Zweck
Pro Datenkategorie Speicherdauer festlegen (Speicherbegrenzung Art. 5(1)(e)), gesetzliche Aufbewahrungsfristen berücksichtigen und automatisiert durchsetzen (Purge-Jobs). Liefert Fristen an 01 und Regeln an 07.

## Auto-Erkennung
Tabellen mit Zeitstempeln (`created_at`, `last_login`), Logs/Retention-Settings (Hosting, Sentry, Analytics), Backups, vorhandene Cron-/Queue-Jobs, `deleted_at`, Rechnungs-/Bestelltabellen.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| categories | Datenkategorien bestätigen | Liste | Schema | ja |
| period_<kat> | Speicherdauer je Kategorie | z. B. Konto: bis Löschung+X; Logs: 7/30/90 Tage; Support: 3 Jahre; Rechnungen/Buchungsbelege: 8 Jahre (DE seit 2025, Buchungsbelege) bzw. 10 Jahre für Bücher/Jahresabschluss; Handels-/Geschäftsbriefe 6 Jahre | Standardliste | ja |
| inactivity | Inaktive Konten löschen/warnen? | Nach X Monaten | – | nein |
| basis | Grund je Frist (Zweckerreichung, Gesetz, Verjährung 3 Jahre, Einwilligung) | Auswahl | – | ja |
| logs | Log-Retention Server/App/Monitoring | Tage | Hosting | ja |
| backups | Backup-Aufbewahrung | Tage | Hosting | ja |
| purge | Durchsetzung: Cron/DB-Job/Plattform-Setting | Auswahl | Code | ja |
| legal_hold | Sperrung bei Streit/Prüfung (Legal Hold) nötig? | Ja/Nein | – | nein |

Hinweis: Fristenwerte sind Richtwerte; vor Festlegung Steuerberater/Anwalt bestätigen lassen (Rechtslage DE ändert sich, z. B. durch Bürokratieentlastungsgesetze).

## Plan & Umsetzung
1. `.compliance/retention-policy.md`: Tabelle Kategorie → Dauer → Grund → Löschmethode → Verantwortlich.
2. Profil `retention` füllen; 01 (Speicherdauer-Abschnitt) daraus ergänzen.
3. Technische Durchsetzung: Purge-Jobs (Cron/Queue/Supabase `pg_cron`), Log-Retention in Plattformen setzen (Vercel/Sentry/Analytics), TTL-Indizes, Anonymisierung nach Frist; Jobs idempotent, mit Dry-Run, Protokoll ohne PII.
4. Aufbewahrungspflichtige Daten bei Kontolöschung sperren (Flag `retention_locked_until`, Zugriff beschränkt) statt löschen (→07).
5. Kalender/Checkliste für manuelle Dinge (Backup-Rotation, Papierunterlagen).

## Verifikation
- Dry-Run-Report der Purge-Jobs gegen Testdaten; Testfälle für Grenzfälle (Frist abgelaufen/nicht, Sperre).
- Jede Datenkategorie hat Frist (Abgleich mit Data-Map aus 07).
- Plattform-Retention-Settings dokumentiert (Screenshot/Konfig-Verweis).

## Hinweise
Kürzeste zulässige Frist wählen; „unbegrenzt“ ist nicht begründbar. Entwurf, keine Rechtsberatung.
