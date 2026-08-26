# Venues API

[![CI](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml/badge.svg)](https://github.com/rahman-997/venues-api/actions/workflows/ci.yml)

A small, production-minded REST API for managing venues. It uses Express 5,
TypeScript, and Zod with a deliberately simple layered architecture and JSON
file persistence.

**Live API:** [venues-api-rahman.onrender.com](https://venues-api-rahman.onrender.com)  
**Health check:** [`/health`](https://venues-api-rahman.onrender.com/health)  
**Portfolio case study:** [Venues API engineering case study](https://abdulrahman-hajjar-dev.netlify.app/work/venues-api/)

> The free Render instance can take a short moment to wake after inactivity.

## Highlights

- Versioned REST endpoints under `/v1/venues`
- Lightweight `/health` endpoint for deployment monitoring
- Strict validation for request bodies, route parameters, and query strings
- Layered routes → controllers → services design
- Centralized, predictable error responses
- Case-insensitive venue-name uniqueness checks
- Server-generated UUIDs and ISO timestamps
- Configurable JSON persistence for local development and tests
- Type checking, production builds, and service plus HTTP contract tests

## Tech stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js 18+ |
| HTTP | Express 5 |
| Language | TypeScript 5 |
| Validation | Zod 4 |
| Development | tsx |
| Persistence | JSON file |

## Architecture

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

- **Routes** connect endpoints to validation and controllers.
- **Controllers** translate HTTP requests and responses.
- **Services** contain business rules and persistence operations.
- **Middleware** validates inputs and formats errors consistently.

## Getting started

### Requirements

- Node.js 18 or later
- npm

### Install and run

```bash
git clone https://github.com/rahman-997/venues-api.git
cd venues-api
npm install
npm run dev
```

The API starts at `http://localhost:3000` by default.

### Production build

```bash
npm run build
npm start
```

### Quality checks

```bash
npm run typecheck
npm test
```

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/v1/venues` | Create a venue |
| `GET` | `/v1/venues?limit=20` | List venues |
| `GET` | `/v1/venues/:id` | Get a venue by ID |
| `PATCH` | `/v1/venues/:id` | Partially update a venue |
| `DELETE` | `/v1/venues/:id` | Delete a venue |
| `GET` | `/health` | Service health check |

`GET /venues` redirects to the versioned collection endpoint.

### Venue model

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

The API generates `id` with `crypto.randomUUID()` and creates `createdAt` as
an ISO timestamp. Venue names must be unique regardless of letter case.

### Create a venue

```bash
curl -X POST http://localhost:3000/v1/venues \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bosphorus Hall",
    "address": "1 Example Street, Istanbul",
    "capacity": 250,
    "contactEmail": "events@example.com"
  }'
```

Successful response:

```json
{
  "data": {
    "id": "2abf9fc3-7a76-4e40-9c96-5a612b336824",
    "name": "Bosphorus Hall",
    "address": "1 Example Street, Istanbul",
    "capacity": 250,
    "contactEmail": "events@example.com",
    "createdAt": "2026-08-25T10:00:00.000Z"
  }
}
```

### Update a venue

```bash
curl -X PATCH http://localhost:3000/v1/venues/VENUE_ID \
  -H "Content-Type: application/json" \
  -d '{"capacity":300}'
```

### Error shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

Common status codes are `400` for invalid input, `404` for a missing venue,
`409` for a duplicate name, and `500` for unexpected persistence failures.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP server port |
| `HOST` | `0.0.0.0` | HTTP bind address |
| `VENUES_DATA_FILE` | `data/venues.json` | JSON persistence path |

Tests set `VENUES_DATA_FILE` to an isolated temporary file, exercise both the
service layer and real HTTP endpoints, and never modify development data.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the server with file watching |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run build` | Compile the production build |
| `npm start` | Run the compiled server |
| `npm test` | Run service and HTTP contract tests |

## License

No license has been added yet. Add one before redistributing the project.
