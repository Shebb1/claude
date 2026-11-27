# 13 – AI-Generated Code Ownership

## Zweck
Klarheit über Urheberrecht, Nutzungsrechte und Haftung bei KI-generiertem Code: Wer besitzt was, welche Tool-Bedingungen gelten, wie werden Dritt-Snippets/Lizenzkontamination vermieden, wie wird das dokumentiert (Due Diligence, Verkauf, Investoren, Kundenverträge).

## Auto-Erkennung
KI-Tool-Spuren (`CLAUDE.md`, `.cursor/`, `.claude/`, `AGENTS.md`, Copilot-Config, `Co-Authored-By` im `git log`), Generator-Plattformen (Lovable, Replit, v0, Bolt), Anteil Boilerplate/Template-Code, `LICENSE`, Mitwirkende (`git shortlog -sne`), Verträge mit Freelancern (Hinweise in Repo).

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| tools | Eingesetzte KI-Tools/Plattformen | Mehrfach, vorbefüllt | Spuren | ja |
| tos | Nutzungsbedingungen der Tools geprüft (Output-Rechte, Kommerznutzung, Training auf deinen Daten)? | Ja/Nein/Offen | – | ja |
| human | Menschlicher Anteil: Auswahl, Architektur, Prompts, Überarbeitung (für Schöpfungshöhe) | Beschreibung | Profil | ja |
| contributors | Weitere Mitwirkende (Angestellte, Freelancer, Agenturen): schriftliche Rechteübertragung vorhanden? | je Person Ja/Nein | git | ja |
| owner | Rechteinhaber (Person/Firma) | Freitext | Profil | ja |
| policy | KI-Nutzungsrichtlinie fürs Team einführen? | Ja/Nein | – | nein |
| secrets_in_prompts | Wurden vertrauliche Daten/Secrets in Prompts gegeben? | Ja/Nein/Unklar | – | ja |
| provenance | Herkunftsnachweis: Kennzeichnung KI-assistierter Commits | Ja/Nein | git | nein |

## Plan & Umsetzung
1. `.compliance/ai-code-ownership.md`: Tool-Inventar mit Bedingungen (Link, Datum, Output-Rechte), Beitragsmatrix, Rechteinhaber, Annahmen und Risiken.
2. Rechtskette: Vorlage für Rechteeinräumung/Contributor-Vereinbarung (Freelancer: ausschließliches, übertragbares Nutzungsrecht; Angestellte: § 69b UrhG) als **Entwurf** in `legal/templates/`.
3. Lizenzkontamination: Scan auf auffällige Fremdcode-Blöcke (Lizenz-Header, Copyright-Kommentare, `SPDX`), Abgleich mit 14; Empfehlung für Code-Referencing-Filter in Tools („Public code matching blocken“).
4. Team-Richtlinie `docs/ai-usage-policy.md`: keine Secrets/Kundendaten in Prompts, Review-Pflicht, Kennzeichnung (Commit-Trailer), Tests Pflicht.
5. Optional `NOTICE`/`CONTRIBUTING`-Ergänzung, Provenance-Hinweis in README, Git-Trailer-Regel.
6. Hinweis: Eigene Lizenzwahl (14) für das Projekt festlegen.

## Verifikation
- Dokument enthält Tool-Inventar, Rechteinhaber und Mitwirkende ohne offene Lücken.
- Lizenz-Header-Scan dokumentiert; Auffälligkeiten geklärt.

## Hinweise
Rechtslage ungeklärt/jurisdiktionsabhängig: In EU/DE schützt Urheberrecht nur menschliche Schöpfungen (rein KI-generierter Output evtl. schutzlos); US Copyright Office verlangt menschlichen Beitrag. Für Verkauf/Investment Anwalt einbinden. Entwurf, keine Rechtsberatung.
