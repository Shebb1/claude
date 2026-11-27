# 09 – Data Processing Agreements (Auftragsverarbeitungsverträge, AVV/DPA)

## Zweck
Mit jedem Dienstleister, der personenbezogene Daten in deinem Auftrag verarbeitet, einen AVV nach Art. 28 DSGVO abschließen; Drittlandtransfer absichern (SCC/DPF); ggf. selbst als Auftragsverarbeiter eigenen AVV für B2B-Kunden bereitstellen.

## Auto-Erkennung
Dienste-Liste (discovery §2) mit Rolle (Auftragsverarbeiter vs. eigener Verantwortlicher, z. B. Zahlungsdienste teils eigenständig), Region, bekannter DPA-Seiten der Anbieter (Stripe, Supabase, Vercel, Google, Resend, Sentry, OpenAI/Anthropic etc.), vorhandene Dokumente in `legal/dpa/`.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| processors | Dienste bestätigen, je Dienst Rolle | Auftragsverarbeiter / Eigenverantwortlich / Gemeinsam Verantwortliche | Dienste | ja |
| status_<dienst> | AVV-Status | Abgeschlossen (Datum/Ablage) / Online-DPA akzeptiert / Offen / Nicht nötig | Profil | ja |
| transfer_<dienst> | Drittland? Mechanismus | EU-Region / DPF-zertifiziert / SCC / keiner | Dienste | ja |
| subprocessors | Unterauftragsverarbeiter-Liste verfolgen? | Ja/Nein | – | nein |
| own_role | Bist du selbst Auftragsverarbeiter für B2B-Kunden? | Ja/Nein | Profil | ja |
| own_dpa | Eigenen AVV bereitstellen? | Vorlage erzeugen / Kundenvorlage / nein | – | bedingt |
| storage | Ablageort der Verträge | Pfad/System | – | ja |

## Plan & Umsetzung
1. Register `.compliance/processors.md|csv`: Dienst, Zweck, Daten, Region, Rolle, AVV-Datum/Link/Ablage, Mechanismus, TIA-Notiz, Ansprechpartner, Review-Datum.
2. Je Dienst Aktionsliste „AVV online akzeptieren“ (Link zum offiziellen DPA des Anbieters über Context7/Doku recherchieren, **nicht** per Claude abschließen – Zustimmung gibt ein Mensch).
3. Wo möglich EU-Region wählen und in Konfiguration setzen (z. B. Supabase/Vercel-Region, Mail-EU-Endpunkt); Konfig-Änderungen mit Freigabe.
4. Eigener AVV (falls B2B-Auftragsverarbeiter): Vorlage nach Art. 28(3) mit Gegenstand, Dauer, Art/Zweck, Datenkategorien, Betroffene, Weisungen, TOMs-Anhang (aus 03), Unterauftragnehmer-Liste, Löschung/Rückgabe, Audit-Rechte. Seite `/dpa` oder Download.
5. Verknüpfung: Dienste im Register ↔ 10 ↔ Datenschutzerklärung 01.
6. Review-Termin (jährlich) in `CHECKLIST.md`.

## Verifikation
- Jeder Dienst mit PII hat Registereintrag mit AVV-Status; offene markiert und in Checkliste.
- Abgleich neuer Dependencies (CI-Hinweis: neue SDKs → Registerpflege).

## Hinweise
Reine Eigenverantwortliche (z. B. Zahlungsabwickler Stripe für eigene Zwecke) brauchen ggf. keinen AVV, aber Informationspflicht. Verträge nie im Namen des Nutzers abschließen. Entwurf, keine Rechtsberatung.
