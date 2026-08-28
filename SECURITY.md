# Security Policy

## Supported version

The current `main` branch is the supported version of Venues API. Older snapshots, experimental branches, and historical releases may not receive security fixes.

## Reporting a vulnerability

Please do **not** publish exploit details, credentials, tokens, or sensitive reproduction material in a public GitHub issue.

If you discover a security issue:

1. Contact the repository owner through the GitHub profile and request a private channel for the report.
2. Include the affected endpoint or component, impact, reproduction steps, and the minimum evidence required to understand the issue.
3. Redact real credentials, personal data, and third-party secrets.
4. Allow time for triage and remediation before public disclosure.

A public issue is appropriate only for non-sensitive hardening suggestions that do not expose an exploitable vulnerability.

## Scope

Useful reports include request-validation bypasses, injection, unsafe error disclosure, path or file-persistence abuse, denial-of-service conditions with practical impact, dependency vulnerabilities, and production configuration that creates a concrete security risk.

The API intentionally uses a compact JSON persistence strategy for this project. Reports that only recommend replacing JSON persistence with a database, without identifying a concrete vulnerability in the implemented boundary, are architecture suggestions rather than security findings.

## Security baseline

Venues API uses strict input validation, centralized error handling, isolated test persistence, and CI-backed verification. Security fixes should include a regression test or explicit verification step whenever practical.
