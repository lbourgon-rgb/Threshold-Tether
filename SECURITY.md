# Security Policy

## Overview

Threshold Tether is a client-side web application that runs entirely in the browser. It makes requests to emotional state API endpoints that you configure in your `config.js`.

## What to Keep Private

- **`config.js`** — contains your real API endpoints. This file is `.gitignore`d by default. Never commit it to a public repo.
- **API keys / tokens** — if your emotional state endpoints require authentication, handle auth on the server side, not in config.js. TT does not send auth headers by default.
- **Personal assets** — your room art and companion sprites are `.gitignore`d. They're your creative work.

## Endpoint Security

TT polls your companion API endpoints over HTTPS. Ensure your endpoints:

- Use **HTTPS only** — never expose emotional state over plain HTTP
- Implement **CORS headers** appropriately — restrict `Access-Control-Allow-Origin` to your domain or `localhost`
- **Rate limit** API responses — TT polls at the configured interval (default: 30 seconds), but a modified client could poll faster
- **Do not expose sensitive data** — the emotional state endpoint should only return mood/emotion data needed for room selection, nothing personally identifiable

## Local Execution

TT runs from `file://` or any static file server. It does not:

- Store any data on disk
- Use cookies or local storage
- Send data anywhere except the endpoints you configure
- Execute any server-side code
- Load external scripts, CDNs, or third-party resources

## Reporting Vulnerabilities

If you discover a security issue, please report it responsibly:

- Email: reach out via Discord https://discord.com/users/itzqueenmai
- Do not open a public issue for security vulnerabilities

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
