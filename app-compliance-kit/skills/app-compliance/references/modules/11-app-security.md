# 11 – App Security

## Zweck
Technische Sicherheitsmaßnahmen (Art. 32 DSGVO): Absicherung typischer Schwachstellen vibe-codierter Apps – Secrets, Auth, Autorisierung, Eingabevalidierung, Header, Abhängigkeiten, Datenbankregeln, Rate Limits, Backups, Logging.

## Auto-Erkennung
Discovery §6 plus: Auth-Flows, Middleware, API-Routen ohne Auth-Check, RLS-Status (Supabase: `get_advisors`, `list_tables`), `.env`-Handling, Security-Header, Dependency-Audit (`npm audit`/`pip-audit`), Secret-Scan (`run_secret_scanning` / gitleaks, falls verfügbar), CORS, Cookies (`HttpOnly`, `Secure`, `SameSite`), Passwort-Hashing, File-Uploads, SQL-Konstruktion per String, SSRF-/Redirect-Muster, Admin-Routen.

## Fragebogen
| id | Frage | Typ / Optionen | Quelle | Pflicht |
|---|---|---|---|---|
| env | Umgebungen (Dev/Staging/Prod), Deploy-Weg | Freitext | Hosting | ja |
| auth | Auth-Verfahren, MFA gewünscht/Pflicht für Admins? | Optionen | Code | ja |
| roles | Rollen/Berechtigungen und sensible Aktionen | Liste | Code | ja |
| sensitive | Sensible Daten (Zahlungen, Gesundheit, Dokumente) | Mehrfach | Schema | ja |
| findings | Fundliste aus Scan zur Priorisierung bestätigen | Tabelle P0–P3 | Scan | ja |
| scope_changes | Dürfen Header/Middleware/Auth-Logik/DB-Policies geändert werden? | Ja/Nur Vorschläge | – | ja |
| rotate | Gefundene geleakte Secrets: rotieren (manuell durch Owner) | Bestätigung | – | bedingt |
| rate | Rate-Limit/Bot-Schutz (Turnstile/hCaptcha) | Optionen | Code | nein |
| backups | Backups & Restore-Test | Optionen | Hosting | ja |
| monitoring | Fehler-/Security-Monitoring | Sentry u. a. (Dienst → 09/10) | Code | nein |
| disclosure | Sicherheitskontakt (security.txt, SECURITY.md) | E-Mail | Profil | ja |

## Plan & Umsetzung
1. **Priorisierte Befundliste** (P0 Secret-Leak, fehlende Auth/RLS, Injection; P1 Header, Cookies, Rate Limit; P2 Abhängigkeiten; P3 Härtung) → Plan zur Freigabe.
2. P0: Secrets aus Code/Historie entfernen (Env-Variablen, `.gitignore`, `.env.example`), **Owner rotiert Schlüssel** (Anleitung geben; Git-History nur nach Freigabe bereinigen).
3. Autorisierung serverseitig (jede API-Route/Server Action prüft Nutzer **und** Objektbesitz; RLS-Policies je Tabelle; kein Vertrauen in Client-Rollen).
4. Eingaben validieren (zod/pydantic), parametrisierte Queries, Ausgabe-Escaping, Upload-Prüfung (Typ/Größe/Speicherort), CSRF-Schutz bei Cookie-Sessions, sichere Redirects, SSRF-Schutz.
5. Header: CSP (restriktiv, passend zu 10), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, frame-ancestors; Cookies `HttpOnly; Secure; SameSite`.
6. Passwörter: argon2id/bcrypt, Passwort-Reset mit Token-Ablauf, Login-Rate-Limit, optional MFA.
7. Abhängigkeiten: Audit-Fixes, Dependabot/Renovate, Lockfile; CI-Schritte für Secret-Scan + Audit (`.github/workflows/security.yml`).
8. `SECURITY.md`, `/.well-known/security.txt`, Backup/Restore-Test dokumentieren, Logging ohne PII/Secrets.
9. Abschluss: `security-review` auf dem Diff, danach `code-review`.

## Verifikation
- Tests: nicht eingeloggt → 401; fremde Objekt-ID → 403/404; XSS-/SQLi-Payload wirkungslos.
- `curl -I` zeigt Header; Mozilla-Observatory-Äquivalent lokal prüfen; Cookie-Flags prüfen.
- Secret-Scan sauber, Audit ohne High/Critical (oder dokumentierte Ausnahme).

## Hinweise
Keine Angriffswerkzeuge gegen fremde Systeme; Tests nur gegen eigene Instanz. Pentest durch Fachfirma empfohlen vor Launch. NIS2/ISO27001 nur bei Betroffenheit (Hinweis geben). Entwurf, keine Rechtsberatung.
