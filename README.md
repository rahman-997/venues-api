# Venues API

[![CI](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml/badge.svg)](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml)

**A compact backend service designed to demonstrate clean API architecture, strict validation, predictable errors, bounded HTTP behavior, persistence boundaries, and repeatable verification.**

Built with **Express 5, TypeScript 5, and Zod 4**, the API manages venue resources through a versioned REST contract and a deliberately small layered architecture.

**Live API:** [venues-api-rahman.onrender.com](https://venues-api-rahman.onrender.com) · **Health:** [/health](https://venues-api-rahman.onrender.com/health) · **Case study:** [Portfolio](https://abdulrahman-hajar-portfolio.onrender.com/work/venues-api/) · **Engineer:** [Abdulrahman Hajar](https://github.com/rahman-997)

> The free Render instance may need a short wake-up after inactivity.

---

## Engineering snapshot

| Area | Design |
| --- | --- |
| Runtime | Node.js 18+ with bounded HTTP timeouts and graceful shutdown |
| HTTP | Express 5 |
| Language | TypeScript 5 |
| Validation | Zod 4 + 100 KB JSON body ceiling |
| Architecture | routes → controllers → services |
| Persistence | Configurable JSON file store |
| IDs | Server-generated UUIDs + per-request correlation IDs |
| Errors | Centralized JSON errors for validation, malformed JSON, 404, 409, 413, and 500 paths |
| Security | No framework disclosure, defensive API headers, immutable CI security scanners |
| Verification | Typecheck, service tests, HTTP contract tests, production build, CodeQL, Semgrep |

## Architecture

```text
HTTP request
    │
    ▼
Request context + security headers
    │
    ▼
Routes
  validation + endpoint wiring
    │
    ▼
Controllers
  HTTP translation only
    │
    ▼
Services
  business rules + persistence boundary
    │
    ▼
JSON store
```

```text
src/
├── app.ts
├── server.ts
├── errors/
│   └── HttpError.ts
├── middleware/
│   ├── errorHandler.ts
│   ├── notFound.ts
│   ├── requestContext.ts
│   ├── securityHeaders.ts
│   └── validate.ts
├── routes/
│   └── index.ts
└── venues/
    ├── venue.controller.ts
    ├── venue.routes.ts
    ├── venue.schema.ts
    ├── venue.service.ts
    └── venue.types.ts
```

### Boundary rules

- **Request middleware** establishes a correlation ID and defensive response headers before body parsing.
- **Routes** connect HTTP endpoints to schemas and controllers.
- **Controllers** translate requests into service calls and responses.
- **Services** own business rules and persistence operations.
- **Validation middleware** rejects invalid body, params, and query input before business logic runs.
- **Central error middleware** owns JSON formatting for known and unexpected failures.
- **Unknown routes** return the same JSON error contract instead of Express's default HTML response.

This keeps the service small without collapsing every concern into one file.

## API contract

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/v1/venues` | Create a venue |
| `GET` | `/v1/venues?limit=20` | List venues |
| `GET` | `/v1/venues/:id` | Read one venue |
| `PATCH` | `/v1/venues/:id` | Partially update a venue |
| `DELETE` | `/v1/venues/:id` | Delete a venue |
| `GET` | `/health` | Liveness check |

`GET /venues` returns a permanent `308` redirect to the versioned collection route.

## Resource model

```ts
type Venue = {
  id: string;
  name: string;
  address: string;
  capacity: number;
  contactEmail: string;
  createdAt: string;
};
```

The server generates `id` with `crypto.randomUUID()` and `createdAt` as an ISO timestamp. Venue names are unique regardless of letter case.

## Validation and error behavior

Validation covers request bodies, route parameters, and query strings. Invalid input never reaches the service layer. JSON request bodies are capped at **100 KB** before schema validation.

Every request gets an `X-Request-Id`. A caller-provided ID is preserved only when it matches the bounded safe character set; otherwise the server generates a UUID. Error responses expose the correlation ID without leaking internal exception details.

Example error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  },
  "requestId": "5f5f5e7a-9a2e-4df4-9a5b-9c06d61eb301"
}
```

Typical status codes:

```text
400  invalid input or malformed JSON
404  venue or route not found
409  duplicate venue name
413  request body exceeds the configured limit
500  unexpected persistence/runtime failure
```

## HTTP runtime hardening

The API intentionally avoids adding a large middleware stack for a small service while still enforcing explicit runtime boundaries:

- disables `X-Powered-By`
- sends `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Cross-Origin-Resource-Policy`
- caps JSON bodies at 100 KB
- returns structured JSON for malformed JSON and oversized payloads
- propagates bounded `X-Request-Id` values for request correlation
- uses 30-second request, 15-second header, and 5-second keep-alive timeouts
- handles `SIGTERM` and `SIGINT` with a bounded graceful shutdown window

## Example request

```bash
curl -X POST https://venues-api-rahman.onrender.com/v1/venues \
  -H "Content-Type: application/json" \
  -H "X-Request-Id: demo-create-venue" \
  -d '{
    "name": "Bosphorus Hall",
    "address": "1 Example Street, Istanbul",
    "capacity": 250,
    "contactEmail": "events@example.com"
  }'
```

## Persistence strategy

The project intentionally uses JSON persistence to keep the service focused on API architecture rather than database infrastructure. The storage path is configurable, which allows tests to use isolated temporary files without touching development data.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | Bind address |
| `VENUES_DATA_FILE` | `data/venues.json` | Persistence file |

## Run locally

```bash
git clone https://github.com/rahman-997/venues-api.git
cd venues-api
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

## Verification

```bash
npm run typecheck
npm test
npm run build
```

Tests cover both business logic and real HTTP behavior, including the normal CRUD contract, malformed JSON, oversized payloads, unknown routes, security headers, request correlation, and the legacy redirect. The suite uses an isolated persistence file so verification is repeatable and does not modify normal development data.

GitHub Actions also runs CodeQL and Semgrep with immutable scanner versions.

## Engineering signals

- Versioned API surface
- Strict TypeScript boundaries
- Zod schemas for all external input
- Bounded request-body and HTTP timeout behavior
- Case-insensitive uniqueness rule
- Server-generated UUIDs and request correlation IDs
- Centralized JSON HTTP errors
- Defensive response headers without framework disclosure
- Graceful process shutdown
- Layered business logic
- Isolated persistence in tests
- Service-level and HTTP contract verification
- CI-backed typecheck/test/build plus static security scanning

## Author

Built by **[Abdulrahman Hajar](https://github.com/rahman-997)** — Software Engineer focused on Full-Stack & Backend Systems in Istanbul, Türkiye.

## License

Released under the [MIT License](LICENSE).
