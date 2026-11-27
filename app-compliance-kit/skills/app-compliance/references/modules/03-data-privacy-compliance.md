# 03 – Data Privacy Compliance (DSGVO-Grundgerüst)

## Zweck
Interne Pflichten der DSGVO: Verzeichnis der Verarbeitungstätigkeiten (Art. 30), Datenschutz-Folgenabschätzung-Check (Art. 35), Privacy by Design/Default (Art. 25), Betroffenenrechte-Prozess (Art. 12–22), TOMs (Art. 32), Drittlandtransfer (Kap. V), ggf. Benennung DSB/EU-Vertreter. Basis für 01, 05, 07, 08, 09, 10.

## Auto-Erkennung
Datenmodell/Migrationen (PII-Spalten, Art.-9-Daten), Dienste+Regionen, Auth-Methoden, Verschlüsselung (TLS, at-rest), Backups, Logging, Rollen/Rechte, Export-/Löschfunktionen.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| scope | Verarbeitung nur EU/EWR-Personen oder weltweit? | Auswahl | Profil | ja |
| roles | Rolle: Verantwortlicher, Auftragsverarbeiter oder beides (z. B. B2B-SaaS)? | Auswahl | Profil | ja |
| special | Besondere Kategorien (Gesundheit, Biometrie, Religion …) oder Daten Minderjähriger? | Mehrfach | Schema | ja |
| scale | Umfang: Anzahl Betroffene, systematische Überwachung, Profiling, KI-Scoring? | Auswahl | – | ja (DSFA) |
| dpo | DSB-Pflicht (≥20 Personen ständig mit automatisierter Verarbeitung, oder Kerntätigkeit Überwachung/Art. 9)? | Ja/Nein/Prüfen | Profil | ja |
| eu_rep | Sitz außerhalb EU, aber EU-Kunden → Vertreter Art. 27? | Ja/Nein | Profil | bedingt |
| transfers | Drittlandübermittlungen und Garantien je Dienst | je Dienst | Dienste | ja |
| rights | Wer bearbeitet Betroffenenanfragen, Kanal, Frist (1 Monat)? | Freitext | Profil | ja |
| toms | Vorhandene Maßnahmen bestätigen (MFA, Verschlüsselung, Backups, Zugriffsrechte, Logging, Pseudonymisierung) | Mehrfach, vorbefüllt | Code | ja |
| dsfa | Aus Kriterien-Check: DSFA nötig? | Ergebnis + Bestätigung | – | ja |

## Plan & Umsetzung
1. `.compliance/ropa.md` bzw. `ropa.csv`: je Verarbeitung Zweck, Kategorien Betroffener/Daten, Empfänger, Drittland, Fristen, TOMs, Rechtsgrundlage.
2. `.compliance/dsfa-check.md`: Schwellwerte nach Art. 35 / DSK-Muss-Liste prüfen; bei „ja“ DSFA-Gerüst (Beschreibung, Notwendigkeit, Risiken, Maßnahmen).
3. `.compliance/toms.md`: technische/organisatorische Maßnahmen mit Fundstelle im Code.
4. Transfer-Register (TIA-Notiz je Drittland-Dienst: Mechanismus DPF/SCC, Zusatzmaßnahmen).
5. Betroffenenrechte-Endpunkte: Auskunft/Export (JSON/CSV), Berichtigung im Profil, Löschung (07), Widerspruch, Einschränkung, Übertragbarkeit; Prozessdoku inkl. Identitätsprüfung und Fristen.
6. Privacy by Default: datensparsame Defaults (Tracking aus, Profile privat), Pseudonymisierung/IP-Kürzung.
7. Technische Härtungsmängel an Modul 11 übergeben.

## Verifikation
- ROPA deckt alle Tabellen mit PII und alle Dienste ab (Abgleich mit Schema/Dienste).
- Export-Endpoint liefert alle Nutzerdaten, Test mit Testnutzer.
- DSFA-/DSB-Entscheidung dokumentiert und begründet.

## Hinweise
Aufsichtsbehörde der Hauptniederlassung bestimmen und in 01 nennen. UK: UK GDPR/DPA 2018, ICO-Registrierung/Gebühr prüfen. CH: nDSG (Verzeichnis, DSFA, Meldepflicht). US: CCPA/CPRA (Opt-out, Auskunft 45 Tage). Entwurf, keine Rechtsberatung.
