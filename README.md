# Venues API

[![CI](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml/badge.svg)](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml)

**A compact backend service designed to demonstrate clean API architecture, strict validation, predictable errors, persistence boundaries, and repeatable verification.**

Built with **Express 5, TypeScript 5, and Zod 4**, the API manages venue resources through a versioned REST contract and a deliberately small layered architecture.

**Live API:** [venues-api-rahman.onrender.com](https://venues-api-rahman.onrender.com) · **Health:** [/health](https://venues-api-rahman.onrender.com/health) · **Case study:** [Portfolio](https://abdulrahman-hajar-dev.netlify.app/work/venues-api/) · **Engineer:** [Abdulrahman Hajar](https://github.com/rahman-997)

> The free Render instance may need a short wake-up after inactivity.

---

## Engineering snapshot

| Area | Design |
| --- | --- |
| Runtime | Node.js 18+ |
| HTTP | Express 5 |
| Language | TypeScript 5 |
| Validation | Zod 4 |
| Architecture | routes → controllers → services |
| Persistence | Configurable JSON file store |
| IDs | Server-generated UUIDs |
| Errors | Centralized predictable error middleware |
| Verification | Typecheck, service tests, HTTP contract tests, production build |

## Architecture

```text
HTTP request
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

- **Routes** connect HTTP endpoints to schemas and controllers.
- **Controllers** translate requests into service calls and responses.
- **Services** own business rules and persistence operations.
- **Validation middleware** rejects malformed body, params, and query input before business logic runs.
- **Central error middleware** owns unexpected and known HTTP error formatting.

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

`GET /venues` redirects to the versioned collection route.

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

Validation covers request bodies, route parameters, and query strings. Invalid input never reaches the service layer.

Example error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Typical status codes:

```text
400  invalid input
404  venue not found
409  duplicate venue name
500  unexpected persistence/runtime failure
```

## Example request

```bash
curl -X POST https://venues-api-rahman.onrender.com/v1/venues \
  -H "Content-Type: application/json" \
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

Tests cover both business logic and real HTTP behavior. The test suite uses an isolated persistence file so verification is repeatable and does not modify normal development data.

## Engineering signals

- Versioned API surface
- Strict TypeScript boundaries
- Zod schemas for all external input
- Case-insensitive uniqueness rule
- Server-generated UUID and timestamps
- Centralized HTTP errors
- Layered business logic
- Isolated persistence in tests
- Service-level and HTTP contract verification
- CI-backed typecheck/test/build workflow

## Author

Built by **[Abdulrahman Hajar](https://github.com/rahman-997)** — Software Engineer and Full-Stack Developer in Istanbul, Türkiye.

## License

Released under the [MIT License](LICENSE).
