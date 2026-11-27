# 05 – Legal Basis (Rechtsgrundlagen der Verarbeitung)

## Zweck
Für jede Verarbeitung die tragfähige Rechtsgrundlage nach Art. 6 (und bei besonderen Daten Art. 9) bestimmen, dokumentieren und im Code/UX korrekt abbilden (z. B. Einwilligung nur wo nötig, Interessenabwägung dokumentiert).

## Auto-Erkennung
ROPA aus 03 (falls vorhanden), Zwecke aus Formularen/Features, Dienste-Liste, Datenkategorien, vorhandene Zuordnung in der Datenschutzerklärung.

## Fragebogen
Je erkanntem Zweck (z. B. Konto/Login, Vertragserfüllung, Zahlungsabwicklung, Support, Sicherheit/Logs, Analytics, Marketing, Newsletter, Betrugsprävention, Buchhaltung):
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| purpose_list | Zweckliste bestätigen/ergänzen | Mehrfach vorbefüllt | Code | ja |
| basis_<zweck> | Rechtsgrundlage | Art. 6(1)(a) Einwilligung · (b) Vertrag · (c) Rechtspflicht · (d) lebenswichtig · (e) öffentl. Aufgabe · (f) berechtigtes Interesse – Vorschlag mit Begründung vorbefüllt | Standardmatrix | ja |
| lia_<zweck> | Bei (f): Interesse, Erforderlichkeit, Abwägung, Widerspruchsmöglichkeit | Freitext (Entwurf von Claude) | – | bei (f) |
| art9 | Besondere Kategorien: Ausnahme Art. 9(2) (meist ausdrückliche Einwilligung) | Auswahl | Schema | bedingt |
| consent_scope | Wo nötig: Einwilligungstext, Granularität, Widerruf | Verweis 04/06 | – | bei (a) |
| kids | Minderjährige: Alterschwelle (DE 16) und Elterneinwilligung | Optionen | Profil | bedingt |

Standardmatrix (Vorschlag): Konto/Vertrag/Zahlung → (b); Buchhaltung/Steuer → (c) mit 6/10 Jahren; Sicherheits-Logs/Missbrauchsschutz → (f); Statistik mit Cookies/Tracking, Marketing-Pixel → (a); Newsletter an Neukunden → (a) bzw. § 7(3) UWG Bestandskunden; Produktverbesserung (cookielos, anonymisiert) → (f).

## Plan & Umsetzung
1. `.compliance/legal-basis.md` (Tabelle: Zweck, Daten, Basis, Begründung/LIA, Widerspruch/Widerruf).
2. In Profil `legal_basis` speichern; 01 daraus füllen.
3. Code-Abgleich: Einwilligungsbasierte Zwecke nur bei vorhandenem Consent-Flag ausführen (Feature-Gates); Zweckbindung: keine Weiterverwendung für andere Zwecke ohne neue Basis.
4. Widerspruchsmechanismen für (f)-Verarbeitungen (Art. 21) bereitstellen.

## Verifikation
- Jede Tabelle/Verarbeitung mit PII hat Zweck + Basis (Abgleich Schema ↔ Matrix).
- Einwilligungsbasierte Funktionen laufen nicht ohne Consent-Nachweis (Tests).
- Keine Basis „berechtigtes Interesse“ ohne dokumentierte Abwägung.

## Hinweise
Einwilligung nicht „vorsorglich“ zusätzlich zur Vertragsbasis einholen (verwirrt Betroffene). US-Märkte kennen kein Rechtsgrundlagen-Konzept (Notice/Opt-out). Entwurf, keine Rechtsberatung.
