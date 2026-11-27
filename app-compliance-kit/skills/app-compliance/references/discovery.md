# Projekt-Erkennung (Phase 0)

Ziel: Möglichst viele Fragebogenantworten **automatisch** ableiten. Nur lesen, nichts ändern. Ergebnis in `profile.json` unter `detected` ablegen (mit Fundstellen).

Unabhängige Scans parallel ausführen (mehrere Grep/Glob-Aufrufe in einer Antwort oder Subagent `Explore`).

## 1. Stack
| Suche | Schluss |
|---|---|
| `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lock` | Node; `dependencies` prüfen: next, react, vue, nuxt, svelte, astro, remix, express, fastify, nest |
| `requirements.txt`, `pyproject.toml` | Python: django, flask, fastapi |
| `composer.json`, `Gemfile`, `go.mod`, `pom.xml`, `*.csproj` | PHP/Laravel, Rails, Go, Java, .NET |
| `vercel.json`, `netlify.toml`, `fly.toml`, `Dockerfile`, `render.yaml`, `.replit`, `wrangler.toml`, `supabase/config.toml` | Hosting/Region → Drittlandtransfer (Modul 03/09/10) |
| `.github/workflows` | CI (Lizenz-, Secret-Scans einhängbar) |
| Router-Ordner (`app/`, `pages/`, `src/routes`, `routes/`) | Wo Rechtsseiten angelegt werden |
| i18n (`next-intl`, `i18next`, `locales/`, `messages/`) | Sprachen der Rechtstexte |
| UI-Lib (`tailwind`, `shadcn`, `mui`, `chakra`), `components/` | Stil für Banner/Seiten |

## 2. Datenflüsse & Dienste (Hinweise auf Drittanbieter)
Durchsuche Dependencies, Imports, `.env*`-**Schlüsselnamen** (nie Werte lesen/ausgeben), HTML/`<script src>`, CSP, Konfigs:

| Kategorie | Muster |
|---|---|
| Auth | `next-auth`, `@auth0`, `clerk`, `supabase.auth`, `firebase/auth`, `passport`, `lucia` |
| Datenbank/Backend | `supabase`, `firebase`, `prisma`, `drizzle`, `mongoose`, `pg`, `planetscale`, `convex` |
| Payments | `stripe`, `paddle`, `lemonsqueezy`, `paypal`, `mollie`, `adyen`, `klarna`, `revenuecat` |
| Analytics | `gtag`, `googletagmanager`, `ga4`, `plausible`, `umami`, `posthog`, `mixpanel`, `amplitude`, `matomo`, `hotjar`, `clarity`, `vercel/analytics` |
| Werbung/Pixel | `fbq`, `facebook pixel`, `tiktok`, `linkedin insight`, `adsbygoogle`, `gads` |
| E-Mail | `resend`, `sendgrid`, `mailgun`, `postmark`, `nodemailer`, `mailchimp`, `brevo`, `loops`, `klaviyo`, `convertkit` |
| Fehler/Monitoring | `sentry`, `datadog`, `logrocket`, `bugsnag`, `highlight` |
| KI | `openai`, `@anthropic-ai`, `anthropic`, `gemini`, `replicate`, `mistral`, `ollama`, `ai` (Vercel SDK) |
| Storage/CDN/Fonts | `s3`, `cloudinary`, `uploadthing`, `fonts.googleapis.com`, `cdnjs`, `unpkg`, `jsdelivr` |
| Karten/Embeds/Widgets | `google maps`, `mapbox`, `youtube`, `vimeo`, `intercom`, `crisp`, `calendly`, `recaptcha`, `hcaptcha`, `turnstile` |
| Social Login | `google`, `github`, `apple`, `facebook` Provider |

Für jeden Fund: Name, Zweck, Datenkategorien (grob), Region (falls ermittelbar), Fundstelle.

## 3. Personenbezogene Daten
- DB-Schemas/Migrationen/ORM-Modelle: Spalten wie `email`, `name`, `phone`, `address`, `birth`, `ip`, `location`, `avatar`, `ssn`, `payment`, `health`, besondere Kategorien (Art. 9).
- Formulare/Endpoints: Registrierung, Kontakt, Newsletter, Checkout, Upload, Kommentare.
- Cookies/Storage: `document.cookie`, `localStorage`, `sessionStorage`, `Set-Cookie`, `cookies()`.
- Logging: IP-Logging, Request-Logs mit PII.
- Nutzergruppen: Minderjährige? B2B/B2C? (aus README/Texten ableiten, sonst fragen).

## 4. Vorhandene Rechts- und Compliance-Artefakte
Glob/Grep (case-insensitive): `privacy`, `datenschutz`, `impressum`, `imprint`, `terms`, `agb`, `tos`, `cookie`, `consent`, `widerruf`, `refund`, `unsubscribe`, `gdpr`, `dsgvo`, `dpa`, `avv`, `security.md`, `SECURITY.md`, `LICENSE`, `NOTICE`, `THIRD_PARTY`, `CODEOWNERS`, `CONTRIBUTING`, `.compliance/`.
Lies gefundene Dokumente und extrahiere: Verantwortlicher, Anschrift, Kontakt, DSB, Zwecke, Drittanbieter, Datum/Version.

## 5. Lizenz & Code-Herkunft
- `LICENSE`, `package.json#license`, Header in Quelldateien.
- Dependency-Lizenzen: `npx license-checker --summary` bzw. `pip-licenses`, `cargo license`, `go-licenses` (nur wenn Netz/Tools verfügbar; sonst Lockfile-Heuristik).
- KI-Spuren: `CLAUDE.md`, `.cursor/`, `.claude/`, `AGENTS.md`, `.github/copilot-instructions.md`, `Co-Authored-By` in `git log`.

## 6. Sicherheitsindikatoren (Modul 11)
Grep nach: hartkodierten Secrets (Muster `sk_live`, `AKIA`, `-----BEGIN`, `api_key\s*=`), `.env` im Repo/`.gitignore`, CORS `*`, `dangerouslySetInnerHTML`, `eval(`, fehlende Auth-Middleware, RLS-Status (Supabase), Security-Header (`next.config`, `vercel.json`, `helmet`), Rate Limiting, CSRF, Passwort-Hashing (`bcrypt`, `argon2`, MD5/SHA1 = Warnsignal).

## 7. Ausgabe der Erkennung
Zeige dem Nutzer eine kompakte Zusammenfassung (nicht den Rohoutput): Stack, Dienste-Liste, Datenkategorien, vorhandene Rechtsseiten, Auffälligkeiten. Danach Phase 1.
