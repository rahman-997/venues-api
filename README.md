<<<<<<< HEAD
# Venues API

A RESTful API for managing venues built with Express 5, TypeScript, and Zod. This project follows a layered architecture (Routes → Controller → Service) ensuring clear separation of concerns.

## Architecture Highlights
- **Clean Architecture:** Business logic is isolated in the `Service` layer. `Controllers` only handle HTTP mapping, and `Routes` manage wiring and middleware.
- **Robust Validation:** Requests (body, query, params) are validated using centralized `Zod` schemas and middleware.
- **Centralized Error Handling:** A central error-handling middleware catches `HttpError` instances, `ZodError` validation failures, and unhandled exceptions.
- **JSON Persistence:** Data is persisted to `data/venues.json` by default; configurable via `VENUES_DATA_FILE`.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
1. Clone the repository or extract the source code.
2. Install dependencies:
```bash
npm install
```

### Running the Application
**Development Mode (with auto-reload):**
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

**Type Checking:**
```bash
npm run typecheck
```

**Production Build:**
```bash
npm run build
npm run start
```

## API Endpoints

| Method | Endpoint         | Description                         |
|--------|------------------|-------------------------------------|
| POST   | `/v1/venues`     | Create a new venue                  |
| GET    | `/v1/venues`     | List venues (supports `?limit=`)    |
| GET    | `/v1/venues/:id` | Get a venue by ID                   |
| PATCH  | `/v1/venues/:id` | Partially update a venue            |
| DELETE | `/v1/venues/:id` | Delete a venue                      |

## Data Model

**Venue**
```ts
{
  id: string;          // Auto-generated UUID
  name: string;        // Unique (case-insensitive)
  address: string;
  capacity: number;    // Positive integer
  contactEmail: string; // Valid email format
  createdAt: string;   // Auto-generated ISO Date
}
```

## Examples

Create a venue:
```bash
curl -X POST http://localhost:3000/v1/venues \
  -H "Content-Type: application/json" \
  -d '{"name":"My Hall","address":"1 Road","capacity":100,"contactEmail":"a@b.com"}'
```

Run tests:
```bash
npm run test
```

Notes:

- Data is persisted to `data/venues.json` by default. Change path with `VENUES_DATA_FILE`.
- Launch configuration is set to open `http://localhost:3000/v1/venues` in the debugger.

