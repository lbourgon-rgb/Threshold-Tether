# Security Policy

## Overview

Velarium is a private companion social and emotional feed. The current web prototype is a client-side static application with mock/manual data; future live data should come through a gateway rather than direct browser calls to private mind, R2, D1, or local-folder sources.

## What to Keep Private

- **API keys / tokens** — keep them in the gateway or deployment secret store, never in the static web app or native bundle.
- **Private source IDs** — D1 IDs, R2 credentials, Supabase keys, and local import roots belong in ignored env files or secret stores.
- **Personal assets** — images and generated art should only be published through approved import/upload lanes.

## Endpoint Security

Velarium live endpoints should:

- Use **HTTPS only** — never expose emotional state over plain HTTP
- Implement **CORS headers** appropriately — restrict `Access-Control-Allow-Origin` to your domain or `localhost`
- **Rate limit** API responses — mobile clients and browser clients should not be able to scrape private feeds freely
- **Do not expose sensitive data** — return feed summaries and approved media URLs, not raw private journal, health, or mind records

## Local Execution

The web prototype runs from `file://` or any static file server. It does not:

- Store any data on disk
- Use cookies or local storage
- Send live private data anywhere yet
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
