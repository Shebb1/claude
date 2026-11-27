# 15 – Payments & Subscriptions

## Zweck
Rechtssichere und technisch korrekte Bezahlabläufe: Preisangaben, Checkout-Pflichten (Button-Lösung), Widerrufsrecht, Abo-Kündigung, Rechnungen/Steuern, Zahlungsdaten (PCI-DSS über Anbieter), Webhooks, Dunning, Erstattungen.

## Auto-Erkennung
`stripe`, `paddle`, `lemonsqueezy`, `paypal`, `mollie`, `revenuecat`; Webhook-Routen; Preis-/Plan-Konfiguration; Checkout-Seiten; Kundenportal; Tabellen `subscriptions`/`orders`/`invoices`; Steuerlogik (Stripe Tax, MOSS/OSS); vorhandene Widerrufs-/Erstattungstexte.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| provider | Zahlungsanbieter; Merchant-of-Record (Paddle/Lemon Squeezy übernehmen Steuern) oder eigener Händler (Stripe)? | Auswahl | Code | ja |
| model | Modell | Einmalkauf / Abo / Nutzungsbasiert / Freemium / Testphase | Code | ja |
| audience | B2C, B2B, beides (Verbraucherrechte nur B2C) | Auswahl | 02 | ja |
| products | Produkte/Pläne, Preise, Währung, brutto/netto | Tabelle | Code | ja |
| digital | Digitale Inhalte/Dienstleistung: Erlöschen des Widerrufsrechts mit ausdrücklicher Zustimmung | Ja/Nein | – | B2C |
| trial | Testphase/Rabatte, automatische Verlängerung und Hinweis | Optionen | Code | bedingt |
| cancel | Kündigung | Online-Button im Konto (Empfohlen, § 312k BGB: Kündigungsbutton) | Code | Abo |
| renewal | Laufzeit/Verlängerungsintervall, Erinnerungsmail vor Verlängerung | Optionen | – | Abo |
| refund | Erstattungspolitik | Freitext | – | ja |
| tax | Umsatzsteuer: Kleinunternehmer, OSS, Reverse Charge, Rechnungsstellung | Optionen | Profil | ja |
| invoice | Rechnungen automatisch (Pflichtangaben, fortlaufende Nummer) | Ja/Nein | Code | ja |
| methods | Zahlungsarten | Mehrfach | Code | ja |
| dunning | Fehlgeschlagene Zahlungen: Retries/Sperrung | Optionen | Code | Abo |
| fraud | SCA/3-D-Secure, Betrugsschutz | Anbieter-Standard | Anbieter | ja |

## Plan & Umsetzung
1. Checkout: Endpreis inkl. USt (B2C, PAngV), Versand-/Zusatzkosten, Laufzeit/Verlängerung sichtbar, Link AGB (02) + Widerrufsbelehrung, **Button „zahlungspflichtig bestellen“** (§ 312j BGB), Bestellübersicht vor Abschluss, Bestätigungsmail (Textform) mit Vertragsdaten/AGB/Widerrufsbelehrung.
2. Widerruf (B2C): Belehrung + Muster-Formular, Checkbox für vorzeitigen Beginn/Erlöschen bei digitalen Leistungen (ausdrückliche Zustimmung + Bestätigung), Speicherung Zustimmung.
3. Abo: Kündigungsbutton im Konto + Bestätigung (§ 312k BGB), Kundenportal-Link, Erinnerung vor Verlängerung (Empfohlen), Pause/Downgrade optional.
4. Technik: Server-seitige Preisermittlung, **Webhook-Signaturprüfung**, idempotente Verarbeitung, Rechte erst nach `paid`-Event, Statusmaschine (trialing/active/past_due/canceled), Dunning, Proration, Tests im Testmodus (Stripe-Testkarten); keine Kartendaten selbst speichern (Hosted Checkout/Elements).
5. Rechnungen/Steuern: Anbieter-Features (Stripe Tax/Invoices) konfigurieren, Pflichtangaben (§ 14 UStG), Aufbewahrung (08), Steuer-IDs-Erfassung B2B.
6. Daten: Zahlungsdaten-Löschkonzept mit Aufbewahrung (07/08), Anbieter im Register (09/10), Datenschutztext (01).
7. Secrets (API-Keys, Webhook-Secrets) nur in Env, Rotation (11).

## Verifikation
- E2E im Testmodus: Kauf, Zahlungsfehler, Kündigung, Erstattung, Webhook-Replay (idempotent), falsche Signatur → 400.
- Checkout-Screenshot-Check: Button-Text, Preisangaben, Links vorhanden.
- Rechnung enthält Pflichtangaben; Zustimmung Widerrufsverzicht gespeichert.

## Hinweise
Verbraucherrecht EU: Widerruf 14 Tage; digitale Inhalte Erlöschen nur bei Zustimmung. Dark Patterns/versteckte Abos sind abmahn- und bußgeldfähig. Steuer/MoR-Entscheidung mit Steuerberater klären. Live-Zahlungen, Preise und Produktivschlüssel nie ohne Freigabe ändern. Entwurf, keine Rechtsberatung.
