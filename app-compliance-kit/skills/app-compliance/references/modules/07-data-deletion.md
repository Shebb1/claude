# 07 – Data Deletion (Löschung, Auskunft, Betroffenenrechte)

## Zweck
Recht auf Löschung (Art. 17), Auskunft/Export (Art. 15/20), Berichtigung (Art. 16): technisch umsetzbar, vollständig (inkl. Backups, Drittsysteme, Logs) und nachweisbar. Abhängig von 08 (Aufbewahrungsfristen) und 10 (Drittsysteme).

## Auto-Erkennung
Schema + Fremdschlüssel (alle Tabellen mit `user_id`), Datei-Storage, Logs, Caches, Search-Index, Analytics-Profile, Zahlungs-/CRM-/Mail-Systeme, vorhandene „Konto löschen“-Funktion, Export-Funktion, Soft-Delete-Spalten.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| self_service | Selbstbedienung im Konto oder per Anfrage? | Beides (Empfohlen) / nur Konto / nur Mail | Code | ja |
| scope | Datenorte bestätigen (DB-Tabellen, Storage, Logs, Backups, Dienste) | Liste vorbefüllt | Schema | ja |
| strategy | Löschstrategie | Hard Delete / Anonymisierung / Soft Delete mit Frist-Purge | – | ja |
| retention_conflict | Daten mit Aufbewahrungspflicht (Rechnungen etc.) | Sperren statt löschen (Verweis 08) | 08 | ja |
| grace | Karenzzeit nach Löschwunsch (Wiederherstellung) | 0/7/14/30 Tage | – | ja |
| verify | Identitätsprüfung (Login, E-Mail-Bestätigung) | Optionen | Code | ja |
| third | Löschung bei Drittanbietern (Stripe, Mail, Analytics) automatisieren? | je Dienst: API/Manuell | Dienste | ja |
| backups | Backup-Rotation (Löschung wirkt spätestens nach X Tagen) | Zahl | Hosting | ja |
| export | Exportformat | JSON (Empfohlen) / CSV / ZIP | – | ja |
| owner | Verantwortliche Person und Frist (1 Monat) | Freitext | Profil | ja |
| content | Nutzerinhalte in geteilten Bereichen: löschen/anonymisieren? | Option | Code | bedingt |

## Plan & Umsetzung
1. Daten-Inventar je Nutzer (`.compliance/data-map.md`: Tabelle/Dienst → Löschaktion).
2. Lösch-Job/Funktion: Transaktional, idempotent, protokolliert (nur Hash/ID + Zeitpunkt, keine PII im Log); Kaskaden/Anonymisierung (`ON DELETE CASCADE` bzw. Pseudonymisierung bei Referenzen); Dateien/Avatare/Embeddings/Search-Index inklusive.
3. UI „Konto löschen“ (Re-Auth, Bestätigung, Hinweis auf aufbewahrungspflichtige Daten), Mail-Bestätigung, Karenzzeit-Cron.
4. Export-Endpoint (alle Nutzerdaten, maschinenlesbar) mit Rate-Limit und Auth.
5. Drittsysteme: Löschaufrufe (Stripe-Customer, Mail-Lists, Analytics) oder Runbook für manuelle Löschung (`engineering:documentation`).
6. Betroffenenanfragen-Prozess: Eingangskanal, Ticket/Log, Fristüberwachung, Vorlagen für Antworten.
7. Bei Supabase: RLS/Funktionen prüfen, Migration nur nach Freigabe; Auth-User + Storage mitlöschen.

## Verifikation
- Integrationstest: Testnutzer anlegen, Daten erzeugen, löschen → keine Zeilen/Dateien mehr (Query-Check aller Tabellen mit `user_id`), Export vorher vollständig.
- Neue Tabelle ohne Eintrag in Data-Map → CI-Check (Skript, das Schema gegen Data-Map prüft).
- Backups: dokumentierte maximale Nachlaufzeit.

## Hinweise
Löschung gegen Aufbewahrung: Daten sperren, Zugriff beschränken (Art. 17(3)(b)). Destruktive Migrationen/Skripte immer erst nach Freigabe; niemals auf Produktion testen. Entwurf, keine Rechtsberatung.
