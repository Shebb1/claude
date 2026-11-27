# Projektprofil `.compliance/profile.json`

Gemeinsamer Speicher aller Module, damit nichts doppelt gefragt wird. Wird im Zielprojekt angelegt (nicht in diesem Plugin). **Keine Secrets, keine Zugangsdaten, keine Kundendaten.** Empfehlung: einchecken, damit Teams denselben Stand nutzen (nach Rückfrage).

```json
{
  "schema": 1,
  "updated": "YYYY-MM-DD",
  "controller": {
    "legal_name": "", "legal_form": "", "address": {"street":"","zip":"","city":"","country":""},
    "email": "", "phone": "", "register": {"court":"","number":""}, "vat_id": "",
    "representative": "", "responsible_content": "", "dpo": {"required": null, "name":"", "email":""},
    "eu_representative": ""
  },
  "product": {
    "name": "", "url": "", "type": "saas|shop|community|content|marketplace|tool",
    "audience": "b2c|b2b|both", "minors": false, "markets": ["DE","EU"], "languages": ["de"],
    "hosting": {"provider":"","region":""}
  },
  "data": {
    "categories": [], "special_categories": [], "sources": [], "purposes": [],
    "ai_processing": false
  },
  "services": [
    {"name":"","purpose":"","category":"auth|db|payments|analytics|ads|mail|monitoring|ai|storage|embed|other",
     "data":[],"region":"","transfer_mechanism":"adequacy|scc|dpf|none","dpa_signed":null,"consent_required":null,"found_in":"file:line"}
  ],
  "legal_basis": {"<purpose>": "art6_1a|art6_1b|art6_1c|art6_1f|…"},
  "retention": {"<datacategory>": {"period":"","basis":""}},
  "consent": {"cmp":"", "categories":["necessary","statistics","marketing"], "log_table":""},
  "payments": {"provider":"","model":"one_time|subscription|usage","trial":false,"currencies":[],"vat_handling":""},
  "licensing": {"project_license":"","ip_owner":"","ai_tools":[]},
  "security": {"contact":"security@…","incident_owner":""},
  "modules": {
    "01-privacy-policy": {"status":"missing|partial|done|n/a","last_run":"","open_todos":[],"files":[]}
  },
  "detected": {"stack":{}, "findings":[]}
}
```

## Regeln
- Jeder Wert hat Vorrang in dieser Reihenfolge: **Nutzerantwort > vorhandenes Dokument > Code-Erkennung > Default**.
- Unbekannt = `null` oder `""`, nie raten. Beim Erzeugen von Texten werden leere Pflichtfelder zu `TODO(owner): <Feld>`.
- Beim Ändern bestehender Werte den alten Wert im Chat nennen und bestätigen lassen.
- `status`: `missing` (nichts), `partial` (Teile oder veraltet), `done` (umgesetzt und verifiziert), `n/a` (nicht relevant, mit Begründung in `open_todos`).
- Zusätzlich `.compliance/CHECKLIST.md`: Checkboxliste je Modul mit Fristen, Zuständigen und manuellen Aufgaben.
